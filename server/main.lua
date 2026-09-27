---------------------------------------------------------------------------
-- Favourites, shortcuts and recent animations, saved per character
---------------------------------------------------------------------------
local function started(name)
    local state = GetResourceState(name)
    return state == 'started' or state == 'starting'
end

local framework = (Config.Framework or 'auto'):lower()
if framework ~= 'rsg' and framework ~= 'vorp' then
    framework = started('rsg-core') and 'rsg' or started('vorp_core') and 'vorp' or 'none'
end

local RSGCore, VORPCore
if framework == 'rsg' then
    RSGCore = exports['rsg-core']:GetCoreObject()
elseif framework == 'vorp' then
    VORPCore = exports.vorp_core:GetCore()
end

-- character id (citizenid / charIdentifier), license without a framework
local function characterId(src)
    if framework == 'rsg' then
        local Player = RSGCore.Functions.GetPlayer(src)
        return Player and Player.PlayerData.citizenid
    end
    if framework == 'vorp' then
        local user = VORPCore.getUser(src)
        local char = user and user.getUsedCharacter
        return char and char.charIdentifier and tostring(char.charIdentifier)
    end
    return GetPlayerIdentifierByType(src, 'license')
end

MySQL.ready(function()
    MySQL.query.await([[
        CREATE TABLE IF NOT EXISTS `fks_animations` (
            `identifier` VARCHAR(64) NOT NULL,
            `favorites`  LONGTEXT NOT NULL,
            `shortcuts`  LONGTEXT NOT NULL,
            `recent`     LONGTEXT NOT NULL,
            `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`identifier`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ]])
end)

local validId = {}
for _, anim in ipairs(Config.Animations) do validId[anim.Command] = true end

local function decode(str)
    local ok, data = pcall(json.decode, str or '[]')
    return ok and type(data) == 'table' and data or {}
end

-- keeps only known animation ids, no duplicates, max `limit`
local function cleanList(list, limit)
    local out, seen = {}, {}
    if type(list) ~= 'table' then return out end
    for _, id in ipairs(list) do
        if #out >= limit then break end
        if type(id) == 'string' and validId[id] and not seen[id] then
            seen[id] = true
            out[#out + 1] = id
        end
    end
    return out
end

-- fixed size array, '' = empty slot
local function cleanSlots(list)
    local out = {}
    for i = 1, Config.ShortcutSlots do
        local id = type(list) == 'table' and list[i]
        out[i] = (type(id) == 'string' and validId[id]) and id or ''
    end
    return out
end

lib.callback.register('fks-animations:server:load', function(src)
    local id = characterId(src)
    if not id then return nil end

    local row = MySQL.single.await('SELECT favorites, shortcuts, recent FROM fks_animations WHERE identifier = ?', { id })
    return {
        favorites = cleanList(row and decode(row.favorites), Config.MaxFavorites),
        shortcuts = cleanSlots(row and decode(row.shortcuts)),
        recent    = cleanList(row and decode(row.recent), Config.MaxRecent),
    }
end)

local lastSave = {}
RegisterNetEvent('fks-animations:server:save', function(data)
    local src = source
    local now = GetGameTimer()
    if lastSave[src] and now - lastSave[src] < 500 then return end
    lastSave[src] = now

    local id = characterId(src)
    if not id or type(data) ~= 'table' then return end

    MySQL.prepare([[
        INSERT INTO fks_animations (identifier, favorites, shortcuts, recent) VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE favorites = VALUES(favorites), shortcuts = VALUES(shortcuts), recent = VALUES(recent)
    ]], {
        id,
        json.encode(cleanList(data.favorites, Config.MaxFavorites)),
        json.encode(cleanSlots(data.shortcuts)),
        json.encode(cleanList(data.recent, Config.MaxRecent)),
    })
end)

AddEventHandler('playerDropped', function()
    lastSave[source] = nil
end)
