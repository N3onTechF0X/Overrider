/**
 * @file
 * Библиотека для Tampermonkey/Greasemonkey, позволяющая подменять или блокировать
 * загрузку игровых файлов через перехват `fetch`.
 *
 * @note Для работы необходимы права доступа к `unsafeWindow` и `GM_xmlhttpRequest`.
 *
 * @example
 * // Подключение через Tampermonkey/Greasemonkey:
 * // @require https://raw.githubusercontent.com/N3onTechF0X/Overrider/refs/heads/main/overrider.src.js
 *
 * const overrider = new ResourceOverrider();
 * overrider.addRule({ from: "original_url", to: "new_url" });
 *
 * @author N3onTechF0X
 * @version 4.0.1
 * @license MIT
 * @since 2024-09-12
 * @updated 2025-09-22
 */

/**
 * Класс описывает правило подмены или блокировки ресурса.
 * @class
 */
class OverrideRule {
    /**
     * Создаёт новое правило подмены или блокировки ресурса.
     * @constructor
     * @param {Object} config - Конфигурация правила
     * @param {string|RegExp|function(string):boolean} config.from - Шаблон для совпадения URL.
     *        Можно использовать строку, регулярное выражение или функцию.
     * @param {string|null} config.to - Ссылка на замену ресурса. Если `null`, запрос блокируется.
     *        Поддерживаются динамические подстановки:
     *        - `{origin}`    → `location.origin`
     *        - `{host}`      → `location.host`
     *        - `{pathname}`  → `location.pathname`
     *        - `{query}`     → `location.search`
     *        - `{timestamp}` → `Date.now().toString()`
     *        - `{random}`    → `Math.random().toString(36).slice(2)`
     *
     * @param {string} [config.comment="---"] - Комментарий для правила.
     * @param {boolean} [config.enabled=true] - Включено ли правило.
     * @param {number} [config.priority=0] - Приоритет правила (чем выше, тем важнее).
     * @param {Object} [config.options={}] - Параметры запроса.
     */
    constructor({ from, to, comment = "---", enabled = true, priority = 0, options={} }) {
        this.from = from;
        this.to = to;
        this.comment = comment;
        this.enabled = enabled;
        this.priority = priority;
        this.options = options;

        if (from instanceof RegExp) {
            this.matcher = url => from.test(url);
        } else if (typeof from === "function") {
            this.matcher = url => !!from(url);
        } else {
            const regex = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
            this.matcher = url => regex.test(url);
        }
    }

    /**
     * Проверяет, соответствует ли URL правилу.
     * @param {string} url - Проверяемый адрес.
     * @returns {boolean} true, если совпадает.
     */
    matches(url) {
        return this.enabled && this.matcher(url);
    }

    /**
     * Возвращает итоговый URL для подмены с подстановкой динамических значений.
     * @returns {string|null} Итоговый URL с подстановками, либо `null`, если `to` не задано.
     */
    getProcessedTo() {
        if (!this.to) return null;
        return this.to
            .replace(/\{origin}/g, location.origin)
            .replace(/\{host}/g, location.host)
            .replace(/\{pathname}/g, location.pathname)
            .replace(/\{query}/g, location.search)
            .replace(/\{timestamp}/g, Date.now().toString())
            .replace(/\{random}/g, Math.random().toString(36).slice(2));
    }
}

/**
 * Основной класс для управления подменой ресурсов.
 * Перехватывает глобальный `fetch` и применяет правила.
 * @class
 */
class ResourceOverrider {
    /**
     * Создаёт экземпляр ResourceOverrider.
     * @constructor
     * @param {Object} [data] - Опции инициализации.
     * @param {boolean} [data.fallback=true] - Использовать оригинальный fetch при ошибке подмены.
     * @param {"info"|"debug"|"warn"|"error"|null} [data.logLevel="info"] - Уровень логирования.
     * @throws {Error} Если unsafeWindow или GM_xmlhttpRequest недоступны.
     */
    constructor({ fallback=true, logLevel="info" } = {}) {
        if (typeof unsafeWindow === "undefined") {
            console.error(
                `[Overrider] `,
                `Ошибка: unsafeWindow недоступен`
            );
            throw new Error("unsafeWindow undefined");
        }
        if (typeof GM_xmlhttpRequest === "undefined") {
            console.error(
                `[Overrider] `,
                `Ошибка: GM_xmlhttpRequest недоступен`
            );
            throw new Error("GM_xmlhttpRequest undefined");
        }

        this.fallback = fallback;
        this.logLevel = logLevel;
        /** @type {OverrideRule[]} */
        this.rules = [];

        /** @private */
        this.originalFetch = unsafeWindow.fetch;
        /** @private */
        this._eventHandlers = { start: null, match: null, success: null, blocked: null, error: null };

        /**
         * Регистрирует обработчики событий.
         * Доступные события:
         * - start   : начало работы
         * - match   : найдено совпадение с правилом
         * - success : ресурс успешно подменён
         * - blocked : ресурс заблокирован
         * - error   : ошибка подмены
         */
        this.on = {
            start: (fn) => { this._eventHandlers.start = fn },
            match: (fn) => { this._eventHandlers.match = fn },
            success: (fn) => { this._eventHandlers.success = fn },
            blocked: (fn) => { this._eventHandlers.blocked = fn },
            error: (fn) => { this._eventHandlers.error = fn },
        };

        this._hookFetch();
    }

    /**
     * @returns {Object} Объект с текущим состоянием.
     */
    toObject() { return { ...this } }

    /**
     * @returns {string} JSON-представление объекта.
     */
    toString() { return JSON.stringify(this) }

    /**
     * Подменяет глобальный fetch, добавляя проверку правил.
     * @private
     * @returns {void}
     */
    _hookFetch() {
        unsafeWindow.fetch = async (url, options) => {
            const rule = this.rules
                .filter(r => r.matches(url))
                .sort((a, b) => b.priority - a.priority)[0];

            if (!rule) return await this.originalFetch.call(unsafeWindow, url, options);

            this._emit("match", { rule, url, options });

            if (rule.to === null) {
                const response = new Response("", { status: 200, statusText: "OK" });
                this._emit("blocked", { rule, url, options });
                return response;
            }

            try {
                const urlToFetch = rule.getProcessedTo();

                const response = await new Promise((resolve, reject) => {
                    GM_xmlhttpRequest({
                        url: urlToFetch,
                        responseType: "blob",
                        onload: (res) => res.status === 200 ? resolve(res) : reject(res),
                        onerror: reject,
                        method: options.method || "GET",
                        headers: options.headers || {},
                        data: options.body ?? null,
                        ...rule.options
                    });
                });

                this._emit("success", { rule, url, options, response });

                return new Response(response.response, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: { "Content-Type": response.response.type }
                });
            } catch (error) {
                this._emit("error", { rule, url, options, error });
                return this.fallback
                    ? await this.originalFetch.call(unsafeWindow, url, options)
                    : new Response("", { status: 502, statusText: "Bad Gateway" });
            }
        };
        setTimeout(() => { this._emit("start", null) }, 0);
    }

    /**
     * Генерация события.
     * @private
     * @param {"start"|"match"|"success"|"blocked"|"error"} event - Тип события.
     * @param {Object} payload - Данные события.
     * @returns {void}
     */
    _emit(event, payload) {
        const handler = this._eventHandlers[event];
        if (handler) {
            try { handler(payload) }
            catch (e) {
                console.error(
                    `[Overrider] `,
                    `Event handler error: `, e
                );
            }
        } else this._log(event, payload);
    }

    /**
     * Логирование событий в консоль, если нет обработчиков.
     * @private
     * @param {string} event - Тип события.
     * @param {Object} payload - Данные события.
     * @returns {void}
     */
    _log(event, payload = {}) {
        if (!this.logLevel) return;
        const allowedEvents = {
            debug: ["start", "match", "success", "blocked", "error", "unknown"],
            info: ["start", "success", "blocked", "error", "unknown"],
            warn: ["error", "unknown"],
            error: ["error"]
        };
        event = ["start", "match", "success", "blocked", "error"].includes(event) ? event : "unknown";

        if (!(allowedEvents[this.logLevel]?.includes(event)))
            return;

        const loggers = {
            start: () => console.info(
                `[Overrider] `,
                `start`
            ),
            success: () => console.info(
                `[Overrider] `,
                `Resource overridden.\n`,
                `From: ${payload.rule?.from}\n`,
                `To: ${payload.rule?.to}\n`,
                `Comment:  ${payload.rule?.comment}`
            ),
            blocked: () => console.info(
                `[Overrider] `,
                `Resource blocked.\n`,
                `Link: ${payload.rule?.from}\n`,
                `Comment: ${payload.rule?.comment}`
            ),
            error: () => console.error(
                `[Overrider] `,
                `Failed to load resource.\n`,
                `Link: ${payload.rule?.to}\n`,
                `Comment: ${payload.rule?.comment}\n`,
                `Error: ${payload.error?.status || payload.error}`
            ),
            match: () => console.debug(
                `[Overrider] `,
                `Matched rule: ${payload.rule?.from}\n`,
                `Link: ${payload.url}\n`,
                `Comment: ${payload.rule?.comment}`
            ),
            unknown: () => console.warn(
                `[Overrider] `,
                `Unknown event: ${event}`, payload
            )
        };
        loggers[event]();
    }

    /**
     * Добавляет одно или несколько правил подмены.
     * @param {...Object} rulesConfigs - Конфигурации правил.
     * @returns {void}
     */
    addRule(...rulesConfigs) {
        rulesConfigs.forEach(cfg => {
            const rule = new OverrideRule(cfg);
            this.rules.push(rule);
        });
        this.rules.sort((a, b) => b.priority - a.priority);
    }

    /**
     * Удаляет правило по объекту или индексу.
     * @param {OverrideRule|number} ruleOrIndex - Ссылка на правило или его индекс.
     * @returns {void}
     */
    removeRule(ruleOrIndex) {
        if (typeof ruleOrIndex === "number") this.rules.splice(ruleOrIndex, 1);
        else this.rules = this.rules.filter(r => r !== ruleOrIndex);
    }

    /**
     * Удаляет все правила.
     * @returns {void}
     */
    clearRules() { this.rules = [] }
}
