// ==UserScript==
// @name         Overrider
// @version      3.0.1
// @description  Override any file in game
// @author       N3onTechF0X
// @icon         https://raw.githubusercontent.com/N3onTechF0X/Overrider/main/logo.png
// @match        https://*.tankionline.com/*
// @require      https://raw.githubusercontent.com/N3onTechF0X/Overrider/main/consts.js
// @require      https://raw.githubusercontent.com/N3onTechF0X/Overrider/main/overrider.src.js
// @require      https://raw.githubusercontent.com/N3onTechF0X/Overrider/main/utils.js
// @grant        GM_xmlhttpRequest
// ==/UserScript==

// Примеры
overrideSkin({ // Замена стандартного скина смоки на ХТ
  element: "smoky",
  to: "XT" // параметр from можно не писать если вы заменяете стандартый скин
})
overrideSkin({ // Замена хантера прайм на ультра
  element: "hunter",
  from: "PR",
  to: "UT"
})
