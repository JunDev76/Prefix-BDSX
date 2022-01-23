"use strict";
/*
       _             _____           ______ __
      | |           |  __ \         |____  / /
      | |_   _ _ __ | |  | | _____   __ / / /_
  _   | | | | | '_ \| |  | |/ _ \ \ / // / '_ \
 | |__| | |_| | | | | |__| |  __/\ V // /| (_) |
  \____/ \__,_|_| |_|_____/ \___| \_//_/  \___/


This program was produced by JunDev76 and cannot be reproduced, distributed or used without permission.

Developers:
 - JunDev76 (https://github.jundev.me/)

Copyright 2022. JunDev76. Allrights reserved.
*/
Object.defineProperty(exports, "__esModule", { value: true });
/*
    @name JunPrefix
    @version 1.0.0
    plugin for bdsx
 */
const packetids_1 = require("bdsx/bds/packetids");
const common_1 = require("bdsx/common");
const event_1 = require("bdsx/event");
const packets_1 = require("bdsx/bds/packets");
const command_1 = require("bdsx/command");
const form_1 = require("bdsx/bds/form");
const command_2 = require("bdsx/bds/command");
const server_1 = require("bdsx/bds/server");
const fs = require('fs');
let config = {
    "default_prefix": "§b§lNEWBIE",
    "chat_format": "@prefix@ §r§f@nick@ §r§f:: §r§7@chat@"
};
try {
    config = require(__dirname + '/JunPrefix_config.json');
}
catch (e) {
}
let db = {};
try {
    db = require(__dirname + '/JunPrefix_data.json');
}
catch (e) {
}
function make_player_data(player) {
    if (db.hasOwnProperty(player.getUniqueIdLow().toString() + '|' + player.getUniqueIdHigh())) {
        return;
    }
    db[player.getUniqueIdLow().toString() + '|' + player.getUniqueIdHigh().toString()] = {
        "main_prefix": config.default_prefix,
        "prefixs": []
    };
}
function get_player_data(player) {
    if (!db.hasOwnProperty(player.getUniqueIdLow().toString() + '|' + player.getUniqueIdHigh())) {
        return null;
    }
    return db[player.getUniqueIdLow().toString() + '|' + player.getUniqueIdHigh()];
}
function get_player_main_prefix(player) {
    var _a, _b;
    return (_b = (_a = get_player_data(player)) === null || _a === void 0 ? void 0 : _a.main_prefix) !== null && _b !== void 0 ? _b : config.default_prefix;
}
command_1.command.register('prefix', 'manage prefix.').overload(async (param, origin) => {
    const sender = origin.getEntity();
    if (sender === null) {
        return;
    }
    let buttons = [new form_1.FormButton('§lMANAGE PREFIX')];
    if (sender.getCommandPermissionLevel() === command_2.CommandPermissionLevel.Operator) {
        buttons.push(new form_1.FormButton('§l§c[OP] §r§lGIVE PREFIX'));
        buttons.push(new form_1.FormButton('§l§c[OP] §r§lTAKE PREFIX'));
    }
    const form = new form_1.SimpleForm('§lMANAGE PREFIX', '', buttons);
    form.sendTo(sender.getNetworkIdentifier(), (form, target) => {
        const response = form.response;
        if (response === 0) {
            PrefixManage.manage_form(target.getActor());
        }
        if (response === 1) {
            PrefixManage.givePrefix_form(target.getActor());
        }
        if (response === 2) {
            PrefixManage.delete_form(target.getActor());
        }
    });
}, {});
class PrefixManage {
    static manage_form(player) {
        let prefixs = [config.default_prefix];
        const data = get_player_data(player);
        let main_prefix = config.default_prefix;
        if (data !== null) {
            main_prefix = data.main_prefix;
            data.prefixs.forEach((value) => {
                prefixs.push(value);
            });
        }
        let buttons = [];
        prefixs.forEach(value => {
            buttons.push(new form_1.FormButton((main_prefix === value ? '§r§f✅§r' : '') + value));
        });
        const form = new form_1.SimpleForm('§lMANAGE PREFIX', 'Please select the prefix you want to use.', buttons);
        form.sendTo(player.getNetworkIdentifier(), (form, identifier) => {
            const response = form.response;
            if (response === null || response === 0) {
                return;
            }
            const player = identifier.getActor();
            if (player === null) {
                return;
            }
            make_player_data(player);
            const data = get_player_data(player);
            if (data === null) {
                return;
            }
            data.main_prefix = data.prefixs[(response - 1)];
            player.sendMessage('§a§l[PREFIX] §r§fYou chose prefix §e' + data.main_prefix);
        });
    }
    static givePrefix_form(player) {
        let buttons = [];
        const playerMap = server_1.serverInstance.getPlayers();
        playerMap.forEach(player => {
            buttons.push(new form_1.FormButton('§l' + player.getName() + '\n§r§8' + "I'm going to give that user a title!"));
        });
        const form = new form_1.SimpleForm('§lGIVE PREFIX', 'Please select the user to whom the prefix will be awarded.', buttons);
        form.sendTo(player.getNetworkIdentifier(), (form, target) => {
            const response = form.response;
            if (response === null) {
                return;
            }
            const target_player = playerMap[response];
            const input_form = new form_1.CustomForm('§lGIVE PREFIX', [new form_1.FormInput('Plz enter the prefix', '§l§eVIP')]);
            input_form.sendTo(target, (form, target) => {
                const response = form.response;
                if (response === null || response[0] === '') {
                    return;
                }
                const sender = target.getActor();
                if (this.givePrefix(target_player, response[0])) {
                    sender.sendMessage('§a§l[PREFIX] §r§fgave the prefix.');
                }
                else {
                    sender.sendMessage('§a§l[prefix] §r§fThe user already owns the prefix §e' + response[0]);
                }
            });
        });
    }
    static delete_form(player) {
        let buttons = [];
        const playerMap = server_1.serverInstance.getPlayers();
        playerMap.forEach(player => {
            buttons.push(new form_1.FormButton('§l' + player.getName() + '\n§r§8I want to give the prefix to the user.'));
        });
        const form = new form_1.SimpleForm('§lGIVE PREFIX', 'Plz choose the user to give prefix', buttons);
        form.sendTo(player.getNetworkIdentifier(), (form, target) => {
            const response = form.response;
            if (response === null) {
                return;
            }
            const player = target.getActor();
            if (player === null) {
                return;
            }
            const target_player = playerMap[response];
            let prefixs = [];
            const data = get_player_data(target_player);
            if (data !== null) {
                data.prefixs.forEach((value) => {
                    prefixs.push(value);
                });
            }
            let buttons = [];
            prefixs.forEach(value => {
                buttons.push(new form_1.FormButton(value));
            });
            const take_form = new form_1.SimpleForm('§lTAKE PREFIX', 'Plz choose the prefix to take away.', buttons);
            take_form.sendTo(player.getNetworkIdentifier(), (form, identifier) => {
                const response = form.response;
                if (response === null) {
                    return;
                }
                const player = identifier.getActor();
                if (player === null) {
                    return;
                }
                make_player_data(target_player);
                const data = get_player_data(target_player);
                if (data === null) {
                    return;
                }
                if (this.deletePrefix(target_player, response)) {
                    player.sendMessage('§a§l[prefix] §r§ftook the prefix.');
                }
                else {
                    player.sendMessage('§a§l[prefix] §r§fAn unknown error has occurred.');
                }
            });
        });
    }
    static deletePrefix(player, index) {
        make_player_data(player);
        const data = get_player_data(player);
        if (data === null) {
            // 발생될 일 없음.
            return false;
        }
        if (data.prefixs.length < index) {
            return false;
        }
        if (data.prefixs[index] === data.main_prefix) {
            data.main_prefix = config.default_prefix;
        }
        data.prefixs = data.prefixs.filter((value, index_) => {
            return index_ !== index;
        });
        return true;
    }
    static givePrefix(player, prefix) {
        make_player_data(player);
        const data = get_player_data(player);
        if (data === null) {
            // 발생될 일 없음.
            return false;
        }
        if (!data.prefixs.includes(prefix)) {
            data.prefixs.push(prefix);
            return true;
        }
        return false;
    }
}
event_1.events.packetSend(packetids_1.MinecraftPacketIds.Text).on((ev, networkIdentifier) => {
    if (ev.type !== packets_1.TextPacket.Types.Chat) {
        return;
    }
    ev.type = packets_1.TextPacket.Types.Raw;
    const player = networkIdentifier.getActor();
    if (player === null) {
        return common_1.CANCEL;
    }
    ev.message = config.chat_format.replace('@nick@', ev.name).replace('@prefix@', get_player_main_prefix(player)).replace('@chat@', ev.message);
});
function save_db() {
    fs.writeFile(__dirname + '/JunPrefix_config.json', JSON.stringify(config), () => {
    });
    fs.writeFile(__dirname + '/JunPrefix_data.json', JSON.stringify(db), () => {
    });
}
event_1.events.serverLeave.on(() => {
    save_db();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7OztFQWVFOztBQUVGOzs7O0dBSUc7QUFFSCxrREFBc0Q7QUFDdEQsd0NBQW1DO0FBQ25DLHNDQUFrQztBQUVsQyw4Q0FBNEM7QUFDNUMsMENBQXFDO0FBQ3JDLHdDQUE0RjtBQUM1Riw4Q0FBd0Q7QUFDeEQsNENBQStDO0FBRS9DLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUV6QixJQUFJLE1BQU0sR0FBRztJQUNULGdCQUFnQixFQUFFLFlBQVk7SUFDOUIsYUFBYSxFQUFFLHVDQUF1QztDQUN6RCxDQUFDO0FBRUYsSUFBSTtJQUNBLE1BQU0sR0FBRyxPQUFPLENBQUMsU0FBUyxHQUFHLHdCQUF3QixDQUFDLENBQUM7Q0FDMUQ7QUFBQyxPQUFPLENBQUMsRUFBRTtDQUVYO0FBT0QsSUFBSSxFQUFFLEdBQXlDLEVBQUUsQ0FBQztBQUVsRCxJQUFJO0lBQ0EsRUFBRSxHQUFHLE9BQU8sQ0FBQyxTQUFTLEdBQUcsc0JBQXNCLENBQUMsQ0FBQztDQUNwRDtBQUFDLE9BQU8sQ0FBQyxFQUFFO0NBQ1g7QUFFRCxTQUFTLGdCQUFnQixDQUFDLE1BQWM7SUFDcEMsSUFBSSxFQUFFLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxHQUFHLEdBQUcsTUFBTSxDQUFDLGVBQWUsRUFBRSxDQUFDLEVBQUU7UUFDeEYsT0FBTztLQUNWO0lBQ0QsRUFBRSxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxHQUFHLEdBQUcsTUFBTSxDQUFDLGVBQWUsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLEdBQUc7UUFDakYsYUFBYSxFQUFFLE1BQU0sQ0FBQyxjQUFjO1FBQ3BDLFNBQVMsRUFBRSxFQUFFO0tBQ2hCLENB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