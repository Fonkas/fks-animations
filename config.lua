Config = {}

-- Warns in the server console when a newer GitHub release exists
Config.VersionCheck = {
    enabled  = true,
    repo     = 'Fonkas/fks-animations',    -- GitHub "user/repository"
    interval = 12,                         -- check again every X hours (0 = only on start)
}

Config.Locale = 'en' -- language file in locales/: 'en', 'pt', 'es', 'fr', 'de', 'it'

-- 'auto' detects the running framework | 'rsg' (rsg-core) | 'vorp' (vorp_core)
-- Used to save favourites / shortcuts per character.
Config.Framework = 'auto'

---------------------------------------------------------------------------
-- Keys
---------------------------------------------------------------------------
-- Opens / closes the menu.
--   raw     = Windows virtual key code (0x76 = F7). Read with IsRawKeyReleased.
--   control = RedM control hash, used if raw keys are not available in your
--             build (ex: F6 = 0x3C0A40F2). nil = off.
Config.OpenKey = {
    raw     = 0x76,
    control = nil,
}

-- Stops the current animation when the menu is closed (RedM control hash, X).
-- nil = off (players can still use /e c or the button in the menu).
Config.StopKey = 0x8CC9CD42

-- Plays the animation in shortcut slot 1..6 (raw keys, numpad 1..6 by default).
-- Set to {} to turn off.
Config.ShortcutKeys = { 0x61, 0x62, 0x63, 0x64, 0x65, 0x66 }

---------------------------------------------------------------------------
-- Commands
---------------------------------------------------------------------------
Config.Commands = {
    menu = 'emotes', -- /emotes opens the menu
    play = 'e',      -- /e sit plays an animation, /e c stops it, /e alone opens the menu
}

---------------------------------------------------------------------------
-- Menu
---------------------------------------------------------------------------
Config.ShortcutSlots = 6   -- slots in the shortcut bar
Config.MaxRecent     = 12  -- animations kept in "Recent"
Config.MaxFavorites  = 200

-- Camera that turns to face the player while the menu is open (players can toggle it).
Config.PreviewCamera = {
    offset = vector3(0.75, 2.6, 0.35), -- camera position, relative to the player
    target = vector3(0.8, 0.0, -0.05), -- point the camera looks at (x > 0 pushes the player to the right of the screen)
    fov    = 50.0,
}

-- Sound when the menu opens / closes (false = off)
Config.Sound = { name = 'BACK', set = 'RDRO_Character_Creator_Sounds' }
