fx_version 'cerulean'
rdr3_warning 'I acknowledge that this is a prerelease build of RedM, and I am aware my resources *will* become incompatible once RedM ships.'
game 'rdr3'
lua54 'yes'

name 'fks-animations'
author 'Fonkas'
description 'Animation book for RedM (RSG and VORP): search, favourites, shortcuts and preview camera'
version '1.0.0'
license 'GPL-3.0-or-later'
-- fks-animations  Copyright (C) 2026 Fonkas
-- animation data based on rsg-animations (XakraD / Rexshack-RedM, GPL-3.0)

shared_scripts {
    '@ox_lib/init.lua',
    'config.lua',
    'config_animations.lua',
    'locales/*.lua',
}

client_scripts {
    'client/main.lua',
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/main.lua',
    'server/version.lua',
}

ui_page 'html/index.html'

files {
    'html/index.html',
    'html/style.css',
    'html/icons.js',
    'html/app.js',
    'html/fonts/*',
    'html/img/*',
    'html/img/anims/*',
}

dependencies {
    'ox_lib',
    'oxmysql',
}
