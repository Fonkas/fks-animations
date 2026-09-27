# fks-animations

Animation book for **RedM** - works with **RSG** and **VORP** (detected automatically).

- Old western parchment menu, opened with **F7**
- 214 animations (gestures, emotes, dances and scenarios) in 9 categories, each card with its own ink icon
- Search by name or command (accents ignored), A–Z / Z–A sorting
- **Favourites** and **Recent**, saved per character in the database
- **6 shortcut slots**: drag a card onto a slot, play it from the menu or with Num1..Num6
- **Full body / upper body** mode (upper body is used automatically on horseback)
- **Preview camera** that turns to face your character while the menu is open
- Keyboard: arrows + Enter to play, Tab to change category, type anywhere to search
- **X** stops the current animation
- 6 languages: English, Português, Español, Français, Deutsch, Italiano (menu **and** animation names)

---

## Requirements

| Resource | |
|---|---|
| **RSG:** [rsg-core](https://github.com/Rexshack-RedM/rsg-core) or **VORP:** [vorp_core](https://github.com/VORPCORE/vorp_core) | framework (favourites are saved per character) |
| [ox_lib](https://github.com/overextended/ox_lib) | notifications, callbacks |
| [oxmysql](https://github.com/overextended/oxmysql) | saves favourites, shortcuts and recent animations |

The framework is detected automatically (`Config.Framework = 'auto'`), or set it to `'rsg'` / `'vorp'`.

---

## Installation

1. Put the `fks-animations` folder in your `resources` folder.
2. In `server.cfg`, start it **after** its dependencies and your framework:
   ```cfg
   ensure oxmysql
   ensure ox_lib
   ensure rsg-core        # or: ensure vorp_core
   ensure fks-animations
   ```
3. **Database** - nothing to do: the `fks_animations` table is created on start.
   If your database user can't create tables, import `install/fks_animations.sql`.
4. Stop other animation menus (rsg-animations, etc.) so players don't have two menus.
5. Restart the server.

---

## Usage

| Key / command | |
|---|---|
| **F7** | open / close the menu (ESC also closes it) |
| **X** | stop the current animation |
| **Num1..Num6** | play the animation in shortcut slot 1..6 |
| `/emotes` | open the menu |
| `/e <command>` | play an animation, ex: `/e sit`, `/e wave upper` |
| `/e c` | stop the current animation |
| `/e` | open the menu |

In the menu: **click** plays, **right click** (or the star) adds to favourites, **drag** a card to a shortcut slot,
**right click** a slot to clear it. The command of each animation is shown under its name.

---

## Configuration

| File | What's in it |
|---|---|
| `config.lua` | language, keys, commands, shortcut slots, preview camera, sound |
| `config_animations.lua` | categories and animations |
| `locales/*.lua` | all texts, category names and animation names, one file per language |
| `html/icons.js` | card icons |

### Language
```lua
Config.Locale = 'en' -- 'en', 'pt', 'es', 'fr', 'de', 'it'
```
Missing texts fall back to English. Commands (`/e sit`) are the same in every language.

### Open key
```lua
Config.OpenKey = { raw = 0x76, control = nil } -- 0x76 = F7
```
F7 is read as a raw keyboard key (`IsRawKeyReleased`). If your RedM build doesn't support raw keys,
the server console shows a warning - set `control` to a RedM control hash instead (ex: F6 = `0x3C0A40F2`).
The shortcut keys (`Config.ShortcutKeys`) also use raw keys.

### Adding an animation
```lua
-- config_animations.lua
{ Command = 'lookmap', Label = 'Read a map', Category = 'activities', Icon = 'book', Type = 'Anim', Dict = 'dict_name', Body = 'anim_name', Flag = 1 },
{ Command = 'salute',  Label = 'Salute',     Category = 'gestures',   Icon = 'wave', Type = 'Emote', EmoteType = 'KIT_EMOTE_...' },
{ Command = 'smoke',   Label = 'Smoke',      Category = 'activities', Icon = 'cigar', Type = 'Scenario', Scenario = 'WORLD_HUMAN_...' },
```
- `Command` must be unique (it is also the `/e` command and the key in the database).
- `Flag` (Anim only): `0` plays once (default), `1` loops, `31` loops on the upper body and lets you walk.
- `Icon` is any icon from `html/icons.js`. For your own picture, put it in `html/img/anims/` and use `Image = 'img/anims/file.png'`.
- To translate the name, add `lookmap = '...'` to `animations = {...}` at the end of each `locales/*.lua`.
  Without a translation, `Label` is shown.

---

## For developers

### Client exports
```lua
exports['fks-animations']:PlayAnimation('sit')             -- full body, returns ok, error
exports['fks-animations']:PlayAnimation('wave', 'upper')   -- upper body only
exports['fks-animations']:StopAnimation()
exports['fks-animations']:OpenMenu()
exports['fks-animations']:CloseMenu()
local playing, command = exports['fks-animations']:IsPlaying()
```

---

## Updates

On start (and every `Config.VersionCheck.interval` hours) the server checks the latest
release on GitHub and prints a warning in the server console when your version is outdated:

```lua
Config.VersionCheck = { enabled = true, repo = 'Fonkas/fks-animations', interval = 12 }
```

To update: download the new release and replace everything **except** your `config*.lua`
files and your images in `html/img/anims/` (check the changelog for new config options).

---

## Credits

- Animation list based on [rsg-animations](https://github.com/Rexshack-RedM/rsg-animations) (XakraD / Rexshack-RedM, GPL-3.0)
- Fonts: [Rye](https://fonts.google.com/specimen/Rye) and [Alegreya](https://fonts.google.com/specimen/Alegreya) - SIL Open Font License (see `html/fonts/OFL-*.txt`)
- Native animation and scenario lists: [femga/rdr3_discoveries](https://github.com/femga/rdr3_discoveries)

---

## License

fks-animations - Animation book for RedM (RSG and VORP)
Copyright (C) 2026 Fonkas

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program (see [`LICENSE`](LICENSE)). If not, see <https://www.gnu.org/licenses/>.

The fonts in `html/fonts/` keep their own license (SIL Open Font License 1.1, see `html/fonts/OFL-*.txt`).
