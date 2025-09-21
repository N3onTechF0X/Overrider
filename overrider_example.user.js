// ==UserScript==
// @name         Overrider Demo
// @version      4.0.0
// @description  Пример работы с Overrider
// @author       N3onTechF0X
// @icon         https://raw.githubusercontent.com/N3onTechF0X/Overrider/main/logo.png
// @require      https://raw.githubusercontent.com/N3onTechF0X/Overrider/refs/heads/main/overrider.src.js
// @match        https://*/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    const overrider = new ResourceOverrider({ logLevel: "debug" });

    // ----------------------
    // Подмена ресурсов (строка)
    // ----------------------
    overrider.addRule({
        from: "https://example.com/images/logo.png",
        to: "https://cdn.example.com/custom/logo.png",
        comment: "Кастомный логотип",
        priority: 10
    });

    // ----------------------
    // Подмена ресурсов (регулярное выражение)
    // ----------------------
    overrider.addRule({
        from: /https:\/\/example.com\/images\/backgrounds\/.+\.jpg/,
        to: "https://cdn.example.com/backgrounds/demo.jpg",
        comment: "Подменяем все фоны на демо"
    });

    // ----------------------
    // Подмена ресурсов (функция)
    // ----------------------
    overrider.addRule({
        from: (url) => url.includes("styles/demo.css"),
        to: "https://cdn.example.com/styles/fake.css",
        comment: "Подменяем CSS"
    });

    // ----------------------
    // Блокировка ресурсов
    // ----------------------
    overrider.addRule({
        from: /ads\/.+\.js/,
        to: null,
        comment: "Блокируем рекламу"
    });

    overrider.addRule({
        from: "https://example.com/analytics.js",
        to: null,
        comment: "Блокируем аналитический скрипт"
    });

    // ----------------------
    // Динамические подстановки
    // ----------------------
    overrider.addRule({
        from: "https://example.com/data/config.json",
        to: "{origin}/data/demo_config.json?ts={timestamp}&rnd={random}",
        comment: "Используем резервный JSON с таймстемпом и случайной строкой"
    });

    // ----------------------
    // События
    // ----------------------
    overrider.on.start(() => console.log("Overrider активирован."));
    overrider.on.match(({ rule, url }) => console.log("Совпадение:", rule.comment, url));
    overrider.on.success(({ rule }) => console.log("Ресурс подменен:", rule.comment));
    overrider.on.blocked(({ rule }) => console.log("Ресурс заблокирован:", rule.comment));
    overrider.on.error(({ rule, error }) => console.error("Ошибка подмены:", rule?.comment, error));

})();