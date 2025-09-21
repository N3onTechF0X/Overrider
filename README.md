# Overrider

**Overrider** - это библиотека для Tampermonkey/Greasemonkey, которая
позволяет перехватывать запросы `fetch` и:
- подменять ресурсы (например, загружать файлы с других серверов);
- блокировать ресурсы полностью;

> ❗ Для работы необходим доступ к таким функциям:
> - `unsafeWindow`
> - `GM_xmlhttpRequest`
>
> Их можно выдать используя заголовок grant в метаданных скрипта:
> ```
> // @grant unsafeWindow
> // @grant GM_xmlhttpRequest
> ```

---

## Установка

1.  Установите [Tampermonkey](https://www.tampermonkey.net).

2.  Подключите библиотеку в ваш скрипт:

    ``` javascript
    // @require  https://raw.githubusercontent.com/N3onTechF0X/Overrider/refs/heads/main/overrider.src.js
    ```
Для наглядного примера работы можно установить готовый юзерскрипт:  
**[overrider_example.user.js](https://raw.githubusercontent.com/N3onTechF0X/Overrider/refs/heads/main/overrider_example.user.js)**

---

## Использование

Создайте экземпляр и добавьте правила:

``` javascript
const overrider = new ResourceOverrider();

// Подмена ресурса
overrider.addRule({
    from: "https://game.com/assets/texture.png",
    to: "https://yourcdn.com/custom-texture.png",
    comment: "Кастомная текстура"
});

// Блокировка ресурса
overrider.addRule({
    from: /ads\/.+\.js/,
    to: null,
    comment: "Блокировка рекламы"
});
```

---

## Возможности правил

### `from`

Шаблон для совпадения URL:
- строка (ищется как подстрока);
- регулярное выражение;
- функция `(url) => boolean`.

### `to`

Ссылка для подмены (или `null`, чтобы блокировать запрос).
Поддерживаются динамические плейсхолдеры:
- `{origin}` → `location.origin`
- `{host}` → `location.host`
- `{pathname}` → `location.pathname`
- `{timestamp}` → `Date.now()`
- `{random}` → случайная строка

### Дополнительно

-   `comment` - описание правила (по умолчанию `"---"`).
-   `enabled` - включено ли правило (по умолчанию `true`).
-   `priority` - приоритет (чем выше, тем важнее).

---

## События

Можно подписаться на события:

``` javascript
overrider.on.success((data) => console.log("Подмена:", data));
overrider.on.blocked((data) => console.log("Блокировка:", data));
overrider.on.error((err) => console.error("Ошибка:", err));
```

События:
- `start` - библиотека активирована
- `match` - найдено совпадение с правилом
- `success` - ресурс успешно заменён
- `blocked` - ресурс заблокирован
- `error` - ошибка при подмене

---

## ЧаВо

**1) Можно ли использовать несколько правил?**
- Да, правила складываются, при совпадении выбирается правило с наибольшим
  приоритетом.

**2) Можно ли получить бан за использование этого скрипта?**
- Скрипт не предназначен для читов или получения преимуществ в игре.  
  Если кто-то использует его для нечестной игры - риск бана полностью на пользователе.  
  При применении только для косметических изменений скрипт безопасен.

**3) Влияет ли скрипт на производительность игры?**
- Скрипт загружает ресурсы точно так же, как это делает игра, поэтому обычно на производительность это не влияет.  
  Замедление может наблюдаться только если подменяемые ресурсы значительно больше оригинальных или подключение идёт к медленному серверу.

**4) Видят ли другие пользователи мои подмены?**
- Нет, подмена выполняется только у вас в браузере, на стороне клиента.

---

## Обратная связь

[![Telegram](https://img.shields.io/badge/Telegram-@NeonTechFox-24A1DE?logo=telegram)](https://t.me/NeonTechFox)  
[![Discord](https://img.shields.io/badge/Discord-NeonTechFox-5865F2?logo=discord)](https://discordapp.com/users/1086946472576159794)
