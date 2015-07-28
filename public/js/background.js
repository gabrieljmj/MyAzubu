function checkOnline () {
    localStorage.setItem('azubu_extension_running', true);
    var extData = JSON.parse(localStorage.getItem('azubu_extension'));
    var following = new Following(extData.usernames);
    var online = new Online(extData.online);

    for (var k in following.getAll()) {
        var channel = following.getAll()[k];

        $.ajax({
            method: 'GET',
            url:    'http://api.azubu.tv/public/channel/' + channel + '/info',
            type:   'json',
            async:  false,
            success: function (data) {
                if (data.data.is_live) {
                    if (!online.has(channel)) {
                        var n = new Notification(channel, {
                            tag: 'started streamming on Azubu.tv',
                            icon: data.data.url_thumbnail
                        });

                        n.onclick = function () {
                            window.open('http://azubu.tv/' + channel);      
                        };

                        setTimeout(function () {n.close()}, 3000);

                        online.add(channel);
                    }
                } else {
                    if (online.has(channel)) {
                        online.remove(channel);
                    }
                }
            }
        });
    }

    chrome.browserAction.setBadgeText({text: "" + online.getAll().length + ""});
    localStorage.removeItem('azubu_extension_running');
}

chrome.browserAction.setBadgeText({text: "0"});
//localStorage.removeItem('azubu_extension');
if (!localStorage.getItem('azubu_extension')) {
    localStorage.setItem('azubu_extension', '{"usernames": [], "online": []}');
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

/** 
 * Run for the first time 
*/
localStorage.setItem('azubu_extension_running', true);
checkOnline();
localStorage.removeItem('azubu_extension_running');

/**
 * Check what channels are online
 */
setInterval(function () { checkOnline() }, 30000);