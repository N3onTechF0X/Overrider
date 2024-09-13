# Overrider

Overrider - это скрипт, который может подменять текстуры игры.  
Основная функция проекта - подмена скинов в игре. Вы можете одеть на свой танк любой[^1] скин, даже если у вас его нет на аккаунте.  
Так же с помощью этого скрипта можно подменять и другие файлы игры.  
  
[^1]: Который есть в базе скрипта. В разделе `Известные проблемы` будет написано о не найденных скинах, если таковые есть.  

## Установка
1. TamperMonkey - [click](https://www.tampermonkey.net)
2. Overrider - [click](https://github.com/N3onTechF0X/Overrider/raw/main/Overrider.user.js)

## Использование

Для того что б заменить один скин на другой (либо не имея скины на какой либо) необходимо:  
1. В конце кода добавить функцию
```javascript
overrideSkin({
    element: "название пушки/корпуса",
    from: "начальный скин",
    to: "конечный скин"
});
```
2. Сохранить скрипт используя `Ctrl + S` или нажав на **Файл** > **Сохранить** в меню TamperMonkey
3. Обновить страницу Танков Онлайн

`element` - английское название пушки/корпуса с маленькой буквы.  
Возможные значения для `from` и `to`:
- `default` - без скина.
- `XT` - ХТ скин
  - ХТ скины на летающие корпуса, а так же новые ХТ скины на пушки и корпуса у которых уже был ХТ называются - `XT_new`
- `LC` - Легаси скин
- `PR` - Прайм скин
- `UT` - Ультра скин
- `SP` - Стимпанк скин
- `DC` - Демоник скин
  - У огнемёта присутствует так же старый демоник скин - `DC_old`
- `IC` - Айс скин
- `RF` - Ретро скин
- `GT` - Гт скин
- `SE` - SE скин на фриз
> ⚠️ Необходимо указывать только те значения скинов которые есть на выбранный корпус/пушку  

`+` - скин есть в базе  
`-` - скин не существует  
`?` - скина нет в базе  
| **element\skin** | **default** | **XT** | **XT_new** | **LC** | **PR** | **UT** | **SP** | **DC** | **IC** | **RF** | **GT** | **DC_old** | **SE** |
|:----------------:|:------------:|:------:|:----------:|:------:|:------:|:------:|:------:|:------:|:------:|:------:|:------:|:----------:|:------:|
| **firebird**     | +            | +      | -          | +      | -      | -      | -      | +      | -      | -      | +      | +          | -      |
| **freeze**       | +            | +      | +          | +      | -      | -      | -      | -      | +      | -      | +      | -          | +      |
| **isida**        | +            | +      | -          | +      | -      | -      | -      | -      | -      | -      | +      | -          | -      |
| **tesla**        | +            | -      | +          | +      | -      | -      | -      | -      | -      | +      | -      | -          | -      |
| **hammer**       | +            | +      | -          | +      | -      | -      | -      | +      | -      | -      | -      | -          | -      |
| **twins**        | +            | +      | -          | +      | -      | -      | +      | -      | -      | +      | +      | -          | -      |
| **ricochet**     | +            | +      | -          | +      | -      | -      | -      | -      | -      | +      | -      | -          | -      |
| **vulcan**       | +            | +      | -          | +      | +      | +      | -      | ?      | -      | -      | -      | -          | -      |
| **smoky**        | +            | +      | -          | +      | -      | -      | -      | -      | -      | -      | +      | -          | -      |
| **striker**      | +            | +      | -          | -      | -      | +      | -      | -      | -      | -      | -      | -          | -      |
| **thunder**      | +            | +      | +          | +      | +      | +      | -      | -      | -      | -      | +      | -          | -      |
| **scorpion**     | +            | -      | +          | -      | -      | -      | -      | -      | -      | -      | -      | -          | -      |
| **magnum**       | +            | +      | -          | -      | -      | -      | +      | -      | -      | -      | -      | -          | -      |
| **railgun**      | +            | +      | -          | +      | +      | +      | -      | -      | -      | -      | +      | -          | -      |
| **gauss**        | +            | +      | -          | -      | +      | +      | -      | -      | +      | -      | +      | -          | -      |
| **shaft**        | +            | +      | -          | +      | -      | -      | -      | -      | -      | -      | -      | -          | -      |
| **wasp**         | +            | +      | -          | +      | -      | -      | -      | +      | -      | -      | +      | -          | -      |
| **hopper**       | +            | -      | +          | -      | -      | -      | -      | -      | -      | +      | -      | -          | -      |
| **hornet**       | +            | +      | -          | +      | +      | +      | -      | -      | -      | -      | +      | -          | -      |
| **viking**       | +            | +      | +          | +      | +      | +      | -      | +      | -      | -      | +      | -          | -      |
| **crusader**     | +            | -      | +          | -      | -      | -      | -      | -      | -      | +      | -      | -          | -      |
| **hunter**       | +            | +      | -          | +      | +      | +      | -      | ?      | -      | -      | +      | -          | -      |
| **paladin**      | +            | -      | +          | -      | -      | -      | -      | -      | -      | +      | -      | -          | -      |
| **dictator**     | +            | +      | -          | +      | -      | -      | ?      | -      | -      | -      | +      | -          | -      |
| **titan**        | +            | +      | -          | +      | +      | -      | +      | -      | -      | -      | -      | -          | -      |
| **ares**         | +            | -      | +          | -      | -      | -      | -      | -      | -      | -      | -      | -          | -      |
| **mammoth**      | +            | +      | -          | +      | -      | +      | +      | -      | -      | -      | +      | -          | -      |
| **crisis**       | +            | +      | -          | -      | -      | -      | -      | -      | -      | -      | -      | -          | -      |
| **hyperion**     | +            | +      | -          | -      | -      | -      | -      | -      | -      | -      | -      | -          | -      |

## Пример

```javascript
overrideSkin({ // Замена стандартного скина смоки на ХТ
  element: "smoky",
  to: "XT" // параметр from можно не писать если вы заменяете стандартый скин
});
overrideSkin({ // Замена хантера прайм на ультра
  element: "hunter",
  from: "PR",
  to: "UT"
});
``` 

## Известные проблемы

1. **Отсутствие скинов**: В базе таких скинов: Вулкан DC, Хантер DC, Диктатор SP.
   - Если вы хотите помочь проекту и у вас на аккаунте есть эти скины вы можете написать N3onTechF0X в любую из указанных в `Обратная связь` соц. сетей и просто зайти в закрытую карту вместе. Или если вы разбираетесь в работе DevTools вы можете самостоятельно достать ссылку на скин в вкладке Application.

2. **Проблемы с гусеницами**: При подмене старых ХТ скинов на другие может наблюдаться потеря гусениц, так как старые ХТ скины не имеют отдельного файла для гусениц.

3. **Краши игры с ГТ скинами**: Иногда возможны краши игры при подмене ГТ скинов корпусов, поскольку у них файл колес, а не гусениц.

4. **"Клоны" танков**: При подмене корпусов на старые ХТ скины могут появляться летающие "клоны" танков.

## ЧаВо (Частые вопросы)

1) Крашится игра при входе  
  - Если игра крашится при включении именно этого скрипта в консоли должны быть сообщения об ошибке, в нём написано в чём может быть проблема.  
2) Скин не сменился  
  - Проверьте правильно ли вы написали функцию, так же после этого надо сохранить скрипт и обновить страницу. Если скин всё еще не поменялся проверьте консоль, возможно у вас ошибка в названии пушки/корпуса или скина, в консоли будет ошибка об этом.  
3) Можно ли получить бан за использования этого скрипта?  
  - Нет, скрипт никоим образом не влияет на игру. Официально правила игры запрещают любые модификации, которые дают преимущество в игре, но Overrider не изменяет игровой процесс и не предоставляет таких преимуществ.
4) Видят ли другие игроки заменённые скины?
  - Нет, скрипт лишь подменяет текстуры на вашем компьютере и другие игроки видят такой скин который был одет до замены.
5) Можно ли использовать несколько скинов одновременно?  
  - Да, можно подменять скины для нескольких пушек и корпусов одновременно. Для этого нужно добавить несколько вызовов функции overrideSkin, указав разные пушки и корпуса в каждом вызове.  
6) Влияет ли скрипт на производительность игры?
  - Если вы меняете только стандартные скины игры - нет. Скины загружаются точно так же как это делает сама игра. Однако, если вы меняете текстуры на свои и ваша текстура весит больше то может быть замедление загрузки страницы пока грузится текстура.  
7) Работает ли скрипт в клиенте игры?
  - Нет, скрипт был разработан для браузерной версии игры и использует расширения позволяющие встраивать собственные скрипты на сайт (такие как TamperMonkey).
8) Работает ли скрипт на тестовых серверах игры?
  - Нет, на данный момент скрипт работает только на основных серверах игры. Но планируется поддержка в будущем.

## В планах

- Поддержка тест серверов игры.
- Готовая функция замены неба в игре.
- Управление подменой скинов через визуальное меню в игре.
- Собственное расширение для браузера.

## Обратная связь

Discord - [neontechfox](https://discordapp.com/users/1086946472576159794)  
VK - [n3ontechf0x](https://vk.com/n3ontechf0x)

## Благодарности

#### Попкорн

- 🍿 - за то что ты есть

#### Помощь с кодом

- [xeon](https://github.com/xeon-git) - идеи по улучшению кода
- Ryukotsu - идеи и отладка кода

#### Помощь с базой скинов

- ashotloh777 - выгрузка и сортировка скинов
- squirtatrise - скины в базу
- humorist - скины в базу
- mtz__82 - скины в базу
- gps.locator - скины в базу  

