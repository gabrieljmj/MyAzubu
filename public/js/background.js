function checkOnline () {
    var extData = JSON.parse(localStorage.getItem('azubu_extension'));
    var following = new Following(extData.usernames);
    var online = new Online(extData.online);

    for (var k in following.getAll()) {
        var username = following.getAll()[k];

        $.ajax({
            method: 'GET',
            url:    'http://api.azubu.tv/public/channel/' + username + '/info',
            type:   'json',
            async:  false,
            success: function (data) {
                if (data.data.is_live) {
                    if (!online.has(username)) {
                        var n = new Notification(username, {
                            tag: 'started streamming on Azubu.tv',
                            icon: data.data.url_thumbnail
                        });

                        n.onclick = function () {
                            window.open('http://azubu.tv/' + username);      
                        };

                        setTimeout(function () {n.close()}, 3000);

                        online.add(username);
                    }
                } else {
                    if (online.has(username)) {
                        online.remove(username);
                    }
                }
            }
        });
    }

    chrome.browserAction.setBadgeText({text: "" + online.getAll().length + ""});
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

checkOnline();

setInterval('checkOnline', 30000);