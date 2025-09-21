/**
 * @fileoverview
 * Библиотека для Tampermonkey/Greasemonkey, позволяющая подменять или блокировать
 * загрузку игровых файлов через перехват `fetch`.
 *
 * ВНИМАНИЕ: Для работы библиотеки необходим доступ к функциям Tampermonkey/Greasemonkey:
 *  - `unsafeWindow`
 *  - `GM_xmlhttpRequest`
 *
 * Подключение:
 * // @require  https://.../overrider.src.js
 *
 * Использование:
 * const overrider = new ResourceOverrider();
 * overrider.addRule({ from: "original_url", to: "new_url", comment: "..." });
 */

/**
 * Класс описывает правило подмены или блокировки ресурса.
 */
class OverrideRule {
    /**
     * @param {Object} config - Конфигурация правила
     * @param {string|RegExp|function(string):boolean} config.from - Шаблон для совпадения URL.
     *        Можно использовать строку, регулярное выражение или функцию.
     * @param {string|null} config.to - Ссылка на замену ресурса. Если `null`, запрос блокируется.
     *        Поддерживаются динамические подстановки:
     *        - `{origin}`    → `location.origin`
     *        - `{host}`      → `location.host`
     *        - `{pathname}`  → `location.pathname`
     *        - `{timestamp}` → `Date.now()`
     *        - `{random}`    → `Math.random().toString(36).slice(2)`
     *
     * @param {string} [config.comment="---"] - Комментарий для правила.
     * @param {boolean} [config.enabled=true] - Включено ли правило.
     * @param {number} [config.priority=0] - Приоритет правила (чем выше, тем важнее).
     */
    constructor({ from, to, comment = "---", enabled = true, priority = 0 }) {
        this.from = from;
        this.to = to;
        this.comment = comment;
        this.enabled = enabled;
        this.priority = priority;

        if (from instanceof RegExp) { this.pattern = from }
        else if (typeof from === "function") { this.pattern = from }
        else { this.pattern = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) }
    }

    /**
     * Проверяет, соответствует ли URL правилу.
     * @param {string} url - Проверяемый адрес.
     * @returns {boolean} true, если совпадает.
     */
    matches(url) {
        if (!this.enabled) return false;
        if (this.pattern instanceof RegExp) return this.pattern.test(url);
        if (typeof this.pattern === "function") return !!this.pattern(url);
        return false;
    }

    /**
     * Возвращает итоговый URL для подмены с подстановкой динамических значений.
     * Подставляет плейсхолдеры `{origin}`, `{host}`, `{pathname}`, `{timestamp}`, `{random}`.
     *
     * @returns {string|null} Итоговый URL с подстановками, либо `null`, если `to` не задано.
     */
    getProcessedTo() {
        if (!this.to) return null;
        return this.to
            .replace(/\{origin}/g, location.origin)
            .replace(/\{host}/g, location.host)
            .replace(/\{pathname}/g, location.pathname)
            .replace(/\{timestamp}/g, Date.now().toString())
            .replace(/\{random}/g, Math.random().toString(36).slice(2));
    }
}

/**
 * Основной класс для управления подменой ресурсов.
 * Перехватывает глобальный `fetch` и применяет правила.
 */
class ResourceOverrider {
    /**
     * Создаёт экземпляр ResourceOverrider.
     *
     * @param {Object} [options] - Опции инициализации.
     * @param {boolean} [options.fallback=true] - Использовать оригинальный fetch при ошибке подмены.
     * @param {"info"|"debug"|"warn"|"error"|null} [options.logLevel="info"] - Уровень логирования.
     */
    constructor(options = {}) {
        const styles = {
            header: "color: #8e44ad; font-weight: bold;",
            error: "color: #ff4444; font-weight: bold;",
            text: "color: #ffffff;"
        };
        if (typeof unsafeWindow === "undefined") {
            console.error(
                "%c[Overrider] %cОшибка: %cunsafeWindow недоступен",
                styles.header, styles.text, styles.error
            );
            throw new Error("unsafeWindow undefined");
        }
        if (typeof GM_xmlhttpRequest === "undefined") {
            console.error(
                "%c[Overrider] %cОшибка: %cGM_xmlhttpRequest недоступен",
                styles.header, styles.text, styles.error
            );
            throw new Error("GM_xmlhttpRequest undefined");
        }

        this.fallback = options.fallback ?? true;
        this.logLevel = options.logLevel ?? "info";
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
         * @example
         * overrider.on.success((data) => console.log("Подмена:", data));
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
     * Подменяет глобальный `fetch`, добавляя проверку правил.
     * @private
     */
    _hookFetch() {
        unsafeWindow.fetch = async (url, options) => {
            const rule = this.rules
                .filter(r => r.matches(url))
                .sort((a, b) => b.priority - a.priority)[0];

            if (!rule) return await this.originalFetch.call(unsafeWindow, url, options);

            this._emit("match", { rule, url });

            if (rule.to === null) {
                const response = new Response("", { status: 200, statusText: "OK" });
                this._emit("blocked", { rule });
                return response;
            }

            try {
                const urlToFetch = rule.getProcessedTo();
                const response = await new Promise((resolve, reject) => {
                    GM_xmlhttpRequest({
                        method: "GET",
                        url: urlToFetch,
                        responseType: "blob",
                        onload: (res) => res.status === 200 ? resolve(res) : reject(res),
                        onerror: reject
                    });
                });

                this._emit("success", { rule });

                return new Response(response.response, {
                    status: 200,
                    statusText: "OK",
                    headers: { "Content-Type": response.response.type }
                });
            } catch (error) {
                this._emit("error", { rule, error });
                return this.fallback
                    ? await this.originalFetch.call(unsafeWindow, url, options)
                    : new Response("", { status: 502, statusText: "Bad Gateway" });
            }
        };
        setTimeout(() => { this._emit("start", null) }, 0);
    }

    /**
     * Генерация события.
     * @param {"start"|"match"|"success"|"blocked"|"error"} event - Тип события.
     * @param {Object} payload - Данные события.
     * @private
     */
    _emit(event, payload) {
        const handler = this._eventHandlers[event];
        if (handler) {
            try { handler(payload) }
            catch (e) {
                console.error(
                    "%c[Overrider] %cEvent handler error:",
                    "color: #8e44ad; font-weight: bold;", "color: #ff4444; font-weight: bold;",
                    e
                );
            }
        } else this._log(event, payload);
    }

    /**
     * Логирование событий в консоль, если нет обработчиков.
     * @param {string} event - Тип события.
     * @param {Object} payload - Данные события.
     * @private
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

        if (!(allowedEvents[this.logLevel]?.includes(event))) return;

        const styles = {
            header: "color: #8e44ad; font-weight: bold;",
            text: "color: #ffffff;",
            comment: "color: #aaaaaa;",
            error: "color: #ff4444; font-weight: bold;",
            link: "color: #aaaaff; text-decoration: underline;",
        };

        const prefix = "%c[Overrider]";
        const loggers = {
            start: () => console.info(
                `${prefix} %cstart`,
                styles.header, styles.text
            ),
            success: () => console.info(
                `${prefix} %cResource overridden.\nFrom: %c%s\n%cTo: %c%s\n%cComment: %c%s`,
                styles.header, styles.text,
                styles.link, payload.rule?.from,
                styles.text, styles.link, payload.rule?.to,
                styles.text, styles.comment, payload.rule?.comment
            ),
            blocked: () => console.info(
                `${prefix} %cResource blocked.\nLink: %c%s\n%cComment: %c%s`,
                styles.header, styles.text,
                styles.link, payload.rule?.from,
                styles.text, styles.comment, payload.rule?.comment
            ),
            error: () => console.error(
                `${prefix} %cFailed to load resource.\nLink: %c%s\n%cComment: %c%s\n%cError: %c%s`,
                styles.header, styles.text,
                styles.link, payload.rule?.to,
                styles.text, styles.comment, payload.rule?.comment,
                styles.text, styles.error, payload.error?.status || payload.error
            ),
            match: () => console.debug(
                `${prefix} %cMatched rule: %s | %c%s\n%cLink: %c%s`,
                styles.header, styles.text, payload.rule?.from,
                styles.comment, payload.rule?.comment,
                styles.text, styles.link, payload.url
            ),
            unknown: () => console.warn(
                `${prefix} %cUnknown event: %s`,
                styles.header, styles.text, event, payload
            )
        };
        loggers[event]();
    }

    /**
     * Добавляет одно или несколько правил подмены.
     * @param {...Object} rulesConfigs - Конфигурации правил.
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
     */
    removeRule(ruleOrIndex) {
        if (typeof ruleOrIndex === "number") this.rules.splice(ruleOrIndex, 1);
        else this.rules = this.rules.filter(r => r !== ruleOrIndex);
    }

    /**
     * Удаляет все правила.
     */
    clearRules() { this.rules = [] }
}

const _overrider = new ResourceOverrider();
