---------------------------------------------------------------------------
-- fks-animations (client)
---------------------------------------------------------------------------
local Lang = Locales[Config.Locale] or Locales['en']

local function L(key, ...)
    local str = Lang[key] or Locales['en'][key] or key
    return select('#', ...) > 0 and str:format(...) or str
end

local function menuTitle()
    return Lang.ui and Lang.ui.title or Locales['en'].ui.title
end

local function notify(key, kind, ...)
    lib.notify({ title = menuTitle(), description = L(key, ...), type = kind or 'inform' })
end

local byId = {}
for _, anim in ipairs(Config.Animations) do byId[anim.Command] = anim end

local isOpen, nuiReady = false, false
local data              -- { favorites = {}, shortcuts = {}, recent = {} } once loaded
local playing           -- { id, anim, mode, since }
local previewOn, previewCam = false, nil

---------------------------------------------------------------------------
-- Saving (debounced)
---------------------------------------------------------------------------
local saveQueued = false
local function queueSave()
    if saveQueued or not data then return end
    saveQueued = true
    SetTimeout(1500, function()
        saveQueued = false
        TriggerServerEvent('fks-animations:server:save', data)
    end)
end

local function loadData()
    if data then return true end
    local result = lib.callback.await('fks-animations:server:load', false)
    if not result then return false end
    data = result
    return true
end

-- new character -> load again next time
RegisterNetEvent('RSGCore:Client:OnPlayerLoaded', function() data = nil end)
RegisterNetEvent('RSGCore:Client:OnPlayerUnload', function() data = nil end)
RegisterNetEvent('vorp:SelectedCharacter', function() data = nil end)

local function pushRecent(id)
    if not data then return end
    local list = { id }
    for _, v in ipairs(data.recent) do
        if v ~= id and #list < Config.MaxRecent then list[#list + 1] = v end
    end
    data.recent = list
    queueSave()
end

---------------------------------------------------------------------------
-- Playing animations
---------------------------------------------------------------------------
local function sendPlaying()
    if nuiReady then
        SendNUIMessage({ action = 'playing', id = playing and playing.id or false })
    end
end

local function loadDict(dict)
    if not DoesAnimDictExist(dict) then return false end
    RequestAnimDict(dict)
    local timeout = GetGameTimer() + 3000
    while not HasAnimDictLoaded(dict) do
        if GetGameTimer() > timeout then return false end
        Wait(10)
    end
    return true
end

local function stopAnimation(silent)
    local ped = PlayerPedId()
    if playing and playing.mode == 'upper' then
        ClearPedSecondaryTask(ped)
    else
        ClearPedTasks(ped)
    end
    local was = playing
    playing = nil
    sendPlaying()
    if was and not silent then notify('stopped') end
end

local function playAnimation(id, mode)
    local anim = byId[id]
    if not anim then return false, L('not_found', tostring(id)) end

    local ped = PlayerPedId()
    if IsEntityDead(ped) or IsPedRagdoll(ped) or IsPedSwimming(ped) or IsPedFalling(ped) then
        return false, L('cant_now')
    end

    mode = mode == 'upper' and 'upper' or 'full'
    if IsPedOnMount(ped) or IsPedInAnyVehicle(ped, false) then
        if anim.Type == 'Scenario' then return false, L('not_on_horse') end
        mode = 'upper'
    end

    if playing then stopAnimation(true) end
    if mode == 'upper' then ClearPedSecondaryTask(ped) else ClearPedTasks(ped) end

    if anim.Type == 'Anim' then
        if not loadDict(anim.Dict) then return false, L('load_failed') end
        local flag = mode == 'upper' and (anim.UpperFlag or 31) or (anim.Flag or 0)
        TaskPlayAnim(ped, anim.Dict, anim.Body, 1.0, 1.0, -1, flag, 1, false, false, false, 0, true)
        RemoveAnimDict(anim.Dict)
    elseif anim.Type == 'Emote' then
        if mode == 'upper' then
            Citizen.InvokeNative(0xB31A277C1AC7B7FF, ped, 0, 0, joaat(anim.EmoteType), 1, 1, 0, 0, 0)
        else
            Citizen.InvokeNative(0xB31A277C1AC7B7FF, ped, 0, 2, joaat(anim.EmoteType), 0, 0, 0, 0, 0)
        end
    elseif anim.Type == 'Scenario' then
        TaskStartScenarioInPlace(ped, joaat(anim.Scenario), -1, true)
    else
        return false, L('not_found', id)
    end

    playing = { id = id, anim = anim, mode = mode, since = GetGameTimer() }
    pushRecent(id)
    sendPlaying()
    return true
end

-- is the current animation still running?
local function stillPlaying()
    local ped = PlayerPedId()
    local anim = playing.anim
    if GetGameTimer() - playing.since < 1000 then return true end
    if anim.Type == 'Anim' then return IsEntityPlayingAnim(ped, anim.Dict, anim.Body, 3) end
    if anim.Type == 'Scenario' then return IsPedUsingAnyScenario(ped) end
    return GetGameTimer() - playing.since < 6000 -- emotes play once
end

CreateThread(function()
    while true do
        if playing then
            if not stillPlaying() then
                playing = nil
                sendPlaying()
            elseif not isOpen and Config.StopKey then
                -- X stops the animation
                for _ = 1, 25 do
                    Wait(0)
                    if not playing then break end
                    if IsControlJustReleased(0, Config.StopKey) then
                        stopAnimation(true)
                        break
                    end
                end
            end
            Wait(0)
        else
            Wait(500)
        end
    end
end)

---------------------------------------------------------------------------
-- Preview camera
---------------------------------------------------------------------------
local function startPreview()
    if previewCam then return end
    local ped = PlayerPedId()
    local cfg = Config.PreviewCamera
    local pos = GetOffsetFromEntityInWorldCoords(ped, cfg.offset.x, cfg.offset.y, cfg.offset.z)
    local target = GetOffsetFromEntityInWorldCoords(ped, cfg.target.x, cfg.target.y, cfg.target.z)

    previewCam = CreateCamWithParams('DEFAULT_SCRIPTED_CAMERA', pos.x, pos.y, pos.z, 0.0, 0.0, 0.0, cfg.fov, false, 0)
    PointCamAtCoord(previewCam, target.x, target.y, target.z)
    SetCamActive(previewCam, true)
    RenderScriptCams(true, true, 600, true, true, 0)
end

local function stopPreview()
    if not previewCam then return end
    RenderScriptCams(false, true, 600, true, true, 0)
    SetCamActive(previewCam, false)
    DestroyCam(previewCam, false)
    previewCam = nil
end

---------------------------------------------------------------------------
-- Menu
---------------------------------------------------------------------------
local function playSound()
    if Config.Sound then PlaySoundFrontend(Config.Sound.name, Config.Sound.set, true, 0) end
end

local function initNui()
    if nuiReady then return end
    -- translated names, English Label from the config when missing
    local names = Lang.animations or {}
    local catNames = Lang.categories or {}
    local anims, cats = {}, {}
    for i, a in ipairs(Config.Animations) do
        anims[i] = { id = a.Command, label = names[a.Command] or a.Label, cat = a.Category, icon = a.Icon, image = a.Image, type = a.Type }
    end
    for i, c in ipairs(Config.Categories) do
        cats[i] = { id = c.id, label = catNames[c.id] or c.label, icon = c.icon }
    end
    -- missing menu texts fall back to English
    local ui = {}
    for k, v in pairs(Locales['en'].ui) do ui[k] = Lang.ui and Lang.ui[k] or v end
    local keys = {}
    for i = 1, Config.ShortcutSlots do
        keys[i] = Config.ShortcutKeys[i] and L('key_numpad', i) or false
    end
    SendNUIMessage({
        action = 'init',
        animations = anims,
        categories = cats,
        lang = ui,
        locale = Config.Locale,
        command = Config.Commands.play,
        slots = Config.ShortcutSlots,
        slotKeys = keys,
    })
    nuiReady = true
end

local function openMenu()
    if isOpen then return end
    if not loadData() then return notify('no_character', 'error') end
    initNui()
    isOpen = true
    SendNUIMessage({
        action = 'open',
        favorites = data.favorites,
        shortcuts = data.shortcuts,
        recent = data.recent,
        playing = playing and playing.id or false,
    })
    SetNuiFocus(true, true)
    playSound()
end

local function closeMenu()
    if not isOpen then return end
    isOpen = false
    SetNuiFocus(false, false)
    SendNUIMessage({ action = 'close' })
    stopPreview()
    playSound()
end

AddEventHandler('onResourceStop', function(res)
    if res ~= GetCurrentResourceName() then return end
    if isOpen then SetNuiFocus(false, false) end
    stopPreview()
end)

RegisterNUICallback('close', function(_, cb)
    closeMenu()
    cb('ok')
end)

RegisterNUICallback('play', function(body, cb)
    local ok, err = playAnimation(body.id, body.mode)
    cb({ ok = ok, error = err, recent = data and data.recent })
end)

RegisterNUICallback('stop', function(_, cb)
    stopAnimation(true)
    cb('ok')
end)

RegisterNUICallback('favorite', function(body, cb)
    if data and byId[body.id] then
        local list = {}
        for _, v in ipairs(data.favorites) do
            if v ~= body.id then list[#list + 1] = v end
        end
        if body.on and #list < Config.MaxFavorites then list[#list + 1] = body.id end
        data.favorites = list
        queueSave()
    end
    cb('ok')
end)

RegisterNUICallback('shortcut', function(body, cb)
    local slot = tonumber(body.slot)
    if data and slot and slot >= 1 and slot <= Config.ShortcutSlots then
        data.shortcuts[slot] = byId[body.id] and body.id or ''
        queueSave()
    end
    cb('ok')
end)

RegisterNUICallback('preview', function(body, cb)
    previewOn = body.on == true
    if previewOn and isOpen then startPreview() else stopPreview() end
    cb('ok')
end)

---------------------------------------------------------------------------
-- Keys
---------------------------------------------------------------------------
local function playShortcut(slot)
    if not loadData() then return end
    local id = data.shortcuts[slot]
    if not id or id == '' then return end
    if playing and playing.id == id then return stopAnimation(true) end
    local ok, err = playAnimation(id, 'full')
    if not ok then lib.notify({ title = menuTitle(), description = err, type = 'error' }) end
end

CreateThread(function()
    local raw = IsRawKeyReleased ~= nil
    local openRaw = raw and Config.OpenKey.raw
    local openControl = Config.OpenKey.control
    if not openRaw and not openControl then
        print(L('no_open_key'))
        return
    end

    while true do
        Wait(0)
        if not isOpen and not IsPauseMenuActive() and not IsNuiFocused() then
            if (openRaw and IsRawKeyReleased(openRaw)) or (openControl and IsControlJustReleased(0, openControl)) then
                openMenu()
            elseif raw then
                for slot, key in ipairs(Config.ShortcutKeys) do
                    if IsRawKeyReleased(key) then
                        playShortcut(slot)
                        break
                    end
                end
            end
        end
    end
end)

---------------------------------------------------------------------------
-- Commands
---------------------------------------------------------------------------
RegisterCommand(Config.Commands.menu, openMenu, false)

RegisterCommand(Config.Commands.play, function(_, args)
    local name = args[1] and args[1]:lower()
    if not name then return openMenu() end
    if name == 'c' or name == 'stop' then return stopAnimation() end
    local ok, err = playAnimation(name, args[2] == 'upper' and 'upper' or 'full')
    if not ok then lib.notify({ title = menuTitle(), description = err, type = 'error' }) end
end, false)

TriggerEvent('chat:addSuggestion', '/' .. Config.Commands.menu, L('cmd_menu'))
TriggerEvent('chat:addSuggestion', '/' .. Config.Commands.play, L('cmd_play', Config.Commands.play), {
    { name = L('cmd_arg'), help = L('cmd_arg_help') },
})

---------------------------------------------------------------------------
-- Exports
---------------------------------------------------------------------------
-- exports['fks-animations']:PlayAnimation('sit')             -- full body
-- exports['fks-animations']:PlayAnimation('wave', 'upper')   -- upper body only
exports('PlayAnimation', playAnimation)
exports('StopAnimation', function() stopAnimation(true) end)
exports('OpenMenu', openMenu)
exports('CloseMenu', closeMenu)
exports('IsPlaying', function() return playing ~= nil, playing and playing.id end)
