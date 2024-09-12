// ==UserScript==
// @name         Overrider
// @version      3.0.0
// @description  Override any file in game
// @author       N3onTechF0X
// @icon         https://raw.githubusercontent.com/N3onTechF0X/overrider-API_like/main/logo.png
// @match        https://*.tankionline.com/*
// @require      file:///C:/Users/user/Documents/TO/textures.js
// @require      https://raw.githubusercontent.com/N3onTechF0X/overrider-API_like/main/overrider.src.js
// @require      https://raw.githubusercontent.com/N3onTechF0X/overrider-API_like/main/utils.js
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @run-at       document-start
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
