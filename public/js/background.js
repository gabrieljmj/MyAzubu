function checkOnline (first) {
    localStorage.setItem('azubu_extension_running', true);
    var extData = JSON.parse(localStorage.getItem('azubu_extension')),
        following = new Following(extData.usernames),
        online = new Online(extData.online),
        configs = JSON.parse(localStorage.getItem('azubu_extension_configs')),
        channelsInfo = {};
    localStorage.removeItem('azubu_channels_info');

    for (var k in following.getAll()) {
        var channel = following.getAll()[k];

        channelsInfo[channel] = {};
    }

    localStorage.setItem('azubu_channels_info', JSON.stringify(channelsInfo));

    for (var k in following.getAll()) {
        var channel = following.getAll()[k];

        $.ajax({
            method: 'GET',
            url:    'http://api.azubu.tv/public/channel/' + channel + '/info',
            type:   'json',
            async:  false,
            success: function (data) {
                setChannelInfo(channel, data.data);

                if (data.data.is_live) {
                    if (!online.has(channel)) {
                        online.add(channel);

                        if (configs.notifications.on) {
                            var notificationOptions = {
                                body: 'started streamming ' + data.data.category.title,
                                icon: data.data.url_thumbnail
                            }

                            if (configs.notifications.sound) {
                                notificationOptions.silent = false;
                                if (!first) {
                                    playNotificationSound();
                                }
                            }

                            var n = new Notification(channel, notificationOptions);
                            var uri = 'http://azubu.tv/' + channel;

                            n.onclick = function () {
                                window.open(uri);      
                            };

                            setTimeout(function () {n.close()}, 6000);
                        }
                    }
                } else {
                    if (online.has(channel)) {
                        online.remove(channel);
                    }
                }
            }
        });
    }

    if (first && online.getAll().length && configs.notifications.sound) {
        playNotificationSound();
    }

    chrome.browserAction.setBadgeText({text: "" + online.getAll().length + ""});
    localStorage.removeItem('azubu_extension_running');
}

function setChannelInfo (channel, data) {
    var all = JSON.parse(localStorage.getItem('azubu_channels_info'));
    all[channel] = data;
    localStorage.setItem('azubu_channels_info', JSON.stringify(all));
}

chrome.browserAction.setBadgeText({text: "0"});

//localStorage.removeItem('azubu_extension');
//localStorage.removeItem('azubu_extension_configs');

if (!localStorage.getItem('azubu_extension')) {
    localStorage.setItem('azubu_extension', JSON.stringify({
        usernames: [],
        online: []
    }));
}

if (!localStorage.getItem('azubu_extension_configs')) {
    localStorage.setItem('azubu_extension_configs', JSON.stringify({
        notifications: {
            on: true,
            sound: false
        },
        refresh: {
            interval: 30000
        },
        oldschool: {
            on: false
        }
    }));
}

setInterval(function () {
    var extData = JSON.parse(localStorage.getItem('azubu_extension'));
    var following = new Following(extData.usernames);
    var online = new Online(extData.online);

    for (var k in online.getAll()) {
        if (!following.has(online.getAll()[k])) {
            online.remove(online.getAll()[k]);
        }
    }

    chrome.browserAction.setBadgeText({text: "" + online.getAll().length + ""});
}, 500);

var extData = JSON.parse(localStorage.getItem('azubu_extension'));
    extData.online = [];
    localStorage.setItem('azubu_extension', JSON.stringify(extData));
var configs = JSON.parse(localStorage.getItem('azubu_extension_configs'));

/** 
 * Run for the first time 
*/
localStorage.setItem('azubu_extension_running', true);
checkOnline(true);
localStorage.removeItem('azubu_extension_running');

/**
 * Check what channels are online
 */
setInterval(function () { checkOnline(false); }, configs.refresh.interval);

function playNotificationSound() {
    var audio = new Audio('public/sounds/notification.mp3');
    audio.play();
}