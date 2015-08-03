String.prototype.isEmpty = function() {
    return (this.length === 0 || !this.trim());
};

function Channel (channel) {
    this.channel = channel;
}

Channel.prototype.getOnlineData = function () {
    var data;

    $.ajax({
        method: 'GET',
        url:    'http://api.azubu.tv/public/channel/' + this.channel,
        type:   'json',
        async:  false,
        error:  function () {
            data = false;
        },
        success: function (response) {
            data = {
                username: response.data.user.username
            };
        }
    });

    return data;
}

Channel.prototype.isOnline = function () {
    var online = false;

    $.ajax({
        method: 'GET',
        url:    'http://api.azubu.tv/public/channel/' + this.channel + '/info',
        type:   'json',
        async:  false,
        success: function (data) {
            if (data.data.is_live) {
                online = true;
            }
        }
    });

    return online;
}

Channel.prototype.getName = function () {
    return this.channel;
}

window.onload = function () {
    if (!localStorage.getItem('azubu_extension')) {
        localStorage.setItem('azubu_extension', '{"usernames": [], "online": []}');
    }

    $('#azubu-logo').on('click', function () {
        chrome.tabs.create({
            url: 'http://www.azubu.tv/',
            active: true
        });
    });

    $('#my-tt').on('click', function () {
        chrome.tabs.create({
            url: 'http://twitter.com/gabrieljmj',
            active: true
        });
    });

    $('.tab-link').on('click', function () {
        var tab = $(this).attr('data-tab');

        $('.channels').each(function (i) {
            $(this).hide();
        });

        $('.tab-link').each(function (i) {
            $(this).removeClass('focus');
        });

        $('#' + tab).show();
        $(this).addClass('focus');
    });

    var extData = JSON.parse(localStorage.getItem('azubu_extension'));
    var online = new Online(extData.online);
    var following = new Following(extData.usernames);
    var onlineDiv = [];
    var followingDiv = [];

    var addBtn = document.getElementById('add');

    for (var k in online.getAll()) {
        onlineDiv.push('<a href="http://azubu.tv/' + online.getAll()[k] + '" class="channel" id="on-channel-link-' + online.getAll()[k] + '" style="width: 100%">' + online.getAll()[k] + '</a>');
    }

    for (var k in following.getAll()) {
        followingDiv.push('<div><a href="http://azubu.tv/' + following.getAll()[k] + '" class="channel" id="channel-link-' + following.getAll()[k] + '">' + following.getAll()[k] + '</a><a href="#" data-channel="' + following.getAll()[k] + '" id="close-btn-' + following.getAll()[k] + '" class="remove-channel">X</a></div>');
    }

    if (online.getAll().length) document.getElementById('online').innerHTML = onlineDiv.join('');
    if (following.getAll().length) document.getElementById('following').innerHTML = followingDiv.join('');

    addBtn.addEventListener('click', function () {
        hideMsgs();
        var usernameField = document.getElementById('username');
        var username = usernameField.value;
        
        if (!following.has(username) && !username.isEmpty()) {
            var channel = new Channel(username);
            var userData = channel.getOnlineData();
            var followingList = document.getElementById('following');

            if (!userData) {
                msg('User not found: ' + username);
            } else {
                following.add(userData.username);
                var divToAdd = '<div><a href="http://azubu.tv/' + userData.username + '" class="channel" id="channel-link-' + userData.username + '">' + userData.username + '</a><a href="#" data-channel="' + userData.username + '" id="close-btn-' + userData.username + '" class="remove-channel">X</a></div>';

                if (!(following.getAll().length - 1)) {
                    $('#following').html(divToAdd);
                } else {
                    $('#following').append(divToAdd);
                }

                document.getElementById('channel-link-' + userData.username).addEventListener('click', function () {
                    chrome.tabs.create({
                        url: 'http://azubu.tv/' + userData.username,
                        active: true
                    });
                });

                if (channel.isOnline()) {
                    var divContent = '<a href="http://azubu.tv/' + userData.username + '" class="channel" id="on-channel-link-' + userData.username + '" style="width: 100%">' + userData.username + '</a>';
                    
                    if (!online.getAll().length) {
                        $('#online').html(divContent);
                    } else {
                        $('#online').append(divContent);
                    }

                    online.add(userData.username);

                    document.getElementById('on-channel-link-' + userData.username).addEventListener('click', function () {
                        chrome.tabs.create({
                            url: 'http://azubu.tv/' + userData.username,
                            active: true
                        });
                    });
                }

                document.getElementById('close-btn-' + userData.username).addEventListener('click', function () {
                    hideMsgs();
                    following.remove(userData.username);
                    $('#channel-link-' + userData.username).remove();
                    $('#on-channel-link-' + userData.username).remove();
                    $('#close-btn-' + userData.username).remove();

                    if (online.has(userData.username)) {
                        online.remove(userData.username);
                    }

                    if (!online.getAll().length) {
                        $('#online').html('<div class="empty-msg">There\'s no online channels that you are following.</div>');
                    }

                    msg('<b>' + userData.username + '</b> unfollowed successfully!');
                    setTimeout(function () { hideMsgs(); }, 3000);
                });

                usernameField.value = '';

                msg('<b>' + userData.username + '</b> followed successfully!');
                setTimeout(function () { hideMsgs(); }, 3000);
            }
        } else {
            usernameField.value = '';
        }
    });

    $('.channel').on('click', function () {
        chrome.tabs.create({
            url: $(this).attr('href'),
            active: true
        });
    });

    $('.remove-channel').on('click', function () {
        hideMsgs();
        var channel = $(this).attr('data-channel');
        if (following.has(channel)) {
            following.remove(channel);
            $('#channel-link-' + channel).remove();
            $('#on-channel-link-' + channel).remove();
            $('#close-btn-' + channel).remove();

            if (online.has(channel)) {
                online.remove(channel);
            }

            if (!online.getAll().length) {
                $('#online').html('<div class="empty-msg">There\'s no online channels that you are following.</div>');
            }

            msg('<b>' + channel + '</b> unfollowed successfully!');
            setTimeout(function () { hideMsgs(); }, 3000);
        }
    });

    $('#refresh').on('click', function () {
        if (!localStorage.getItem('azubu_extension_running')) {
            var _extData = JSON.parse(localStorage.getItem('azubu_extension'));
            var _online = new Online(extData.online);
            var _following = new Following(extData.usernames);

            for (var k in _following.getAll()) {
                var channel = new Channel(_following.getAll()[k]);

                if (channel.isOnline()) {
                    if (!online.has(channel.getName())) {
                        var divContent = '<a href="http://azubu.tv/' + channel.getName() + '" class="channel" id="on-channel-link-' + channel.getName() + '" style="width: 100%">' + channel.getName() + '</a>';
                        if (!online.getAll().length) {
                            $('#online').html(divContent);
                        } else {
                            $('#online').append(divContent);
                        }

                        online.add(channel.getName());
                    }
                } else {
                    if (online.has(channel.getName())) {
                        $('#on-channel-link-' + channel.getName()).remove();
                        online.remove(channel.getName());
                    }
                }
            }
        }
    });
};

function userExists(username) {
    var data;

    $.ajax({
        method: 'GET',
        url:    'http://api.azubu.tv/public/channel/' + username,
        type:   'json',
        async:  false,
        error:  function () {
            data = false;
        },
        success: function (response) {
            data = {
                username: response.data.user.username
            };
        }
    });

    return data;
}

function msg(msg) {
    var div = document.getElementById('msg');
    div.style.display = 'none';
    div.innerHTML = '';
    div.style.display = 'block';
    div.innerHTML = msg;
}

function hideMsgs() {
    var div = document.getElementById('msg');
    div.style.display = 'none';
    div.innerHTML = '';
}