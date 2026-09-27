Locales = Locales or {}

-- English is the base language: animation names come from Label in config_animations.lua
Locales['en'] = {
    -- notifications
    not_found     = 'Animation "%s" not found.',
    cant_now      = 'You cannot play animations right now.',
    not_on_horse  = 'This animation cannot be played on horseback.',
    load_failed   = 'Could not load the animation.',
    stopped       = 'Animation stopped.',
    no_character  = 'Character not loaded yet.',
    no_open_key   = '[fks-animations] IsRawKeyReleased is not available in this build. Set Config.OpenKey.control (ex: F6 = 0x3C0A40F2).',

    -- commands
    cmd_menu      = 'Open the animation book',
    cmd_play      = 'Play an animation (/%s c to stop)',
    cmd_arg       = 'command',
    cmd_arg_help  = 'Animation name (ex: sit)',

    -- menu
    ui = {
        title        = 'Animations',
        subtitle     = 'A ledger of gestures, dances & manners',
        all          = 'All',
        favorites    = 'Favourites',
        recent       = 'Recent',
        results      = 'Results',
        search       = 'Search animation or command...',
        sort_az      = 'A – Z',
        sort_za      = 'Z – A',
        full_body    = 'Full body',
        upper_body   = 'Upper body',
        body_hint    = 'Full body / upper body only (works on horseback)',
        preview      = 'Camera',
        preview_hint = 'Turn the camera to face your character',
        close        = 'Close',
        shortcuts    = 'Shortcuts',
        stop         = 'Stop',
        empty        = 'No animation found',
        empty_fav    = 'No favourites yet. Click the star on an animation.',
        empty_recent = 'You have not played any animation yet.',
        slot_empty   = 'Drag an animation here',
        playing      = 'Playing',
        help         = 'Click: play · Right click: favourite · Drag: shortcut · Enter: first',
        fav_on       = 'Added to favourites',
        fav_off      = 'Removed from favourites',
        slot_set     = 'Shortcut %s saved',
        slot_clear   = 'Shortcut %s cleared',
        key_numpad   = 'Num %s',
    },
}
