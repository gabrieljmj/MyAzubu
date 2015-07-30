$(document).ready(function () {
    $('header #azubu-logo').on('click', function () {
        chrome.tabs.create({
            url: 'http://www.azubu.tv/',
            active: true
        });
    });

    $('footer #my-tt').on('click', function () {
        chrome.tabs.create({
            url: 'http://twitter.com/gabrieljmj',
            active: true
        });
    });
    
    var configs = JSON.parse(localStorage.getItem('azubu_extension_configs'));

    if (configs.notifications.on) {
        $('#notification-on').prop('checked', true);
    }

    if (configs.notifications.sound) {
        $('#notification-sound').prop('checked', true);
    }

    $('#refresh-interval-time').val(configs.refresh.interval);

    function setConfig (name, value) {
        var config = JSON.parse(localStorage.getItem('azubu_extension_configs'));
        assign(config, name, value);
        localStorage.setItem('azubu_extension_configs', JSON.stringify(config));
    }

    $('#notification-on').on('click', function () {
        if ($(this).is(':checked')) {
            setConfig('notifications.on', true);
        } else {
            setConfig('notifications.on', false);
        }
    });

    $('#notification-sound').on('click', function () {
        if ($(this).is(':checked')) {
            setConfig('notifications.sound', true);
        } else {
            setConfig('notifications.sound', false);
        }
    });

    $('#refresh-interval-time').on('change', function () {
        var validTimes = [30000, 60000, 300000, 3000000, 30000000, 60000000];
        var chooseTime = $(this).val();

        if ($.inArray(chooseTime, validTimes)) {
            setConfig('refresh.interval', chooseTime);
        }
    });
});


function assign(obj, prop, value) {
    if (typeof prop === "string") {
        prop = prop.split(".");
    }

    if (prop.length > 1) {
        var e = prop.shift();
        assign(obj[e] =
                 Object.prototype.toString.call(obj[e]) === "[object Object]"
                 ? obj[e]
                 : {},
               prop,
               value);
    } else {
        obj[prop[0]] = value;
    }
};