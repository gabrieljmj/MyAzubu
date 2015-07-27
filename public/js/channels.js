function Channels (channels) {
    this.channels = channels;
}

Channels.prototype.has = function (channel) {
    for (var k in this.channels) {
        if (this.channels[k].toLowerCase() === channel.toLowerCase()) {
            return true;
        }
    }

    return false;
};

Channels.prototype.getAll = function () {
    return this.channels;
}

function Following (channels) {
    this.channels = channels;
}

Following.prototype = new Channels();

Following.prototype.add = function (channel) {
    var extData = JSON.parse(localStorage.getItem('azubu_extension'));
    extData.usernames.push(channel);
    localStorage.setItem('azubu_extension', JSON.stringify(extData));
    this.channels.push(channel);
};

Following.prototype.remove = function (channel) {
    var extData = JSON.parse(localStorage.getItem('azubu_extension'));
    extData.usernames.splice(extData.usernames.indexOf(channel), 1);
    localStorage.setItem('azubu_extension', JSON.stringify(extData));
    this.channels.splice(this.channels.indexOf(channel), 1);
};

function Online (channels) {
    this.channels = channels;
}

Online.prototype = new Channels();

Online.prototype.add = function (channel) {
    var extData = JSON.parse(localStorage.getItem('azubu_extension'));
    extData.online.push(channel);
    localStorage.setItem('azubu_extension', JSON.stringify(extData));
    this.channels.push(channel);
};

Online.prototype.remove = function (channel) {
    var extData = JSON.parse(localStorage.getItem('azubu_extension'));
    extData.online.splice(extData.online.indexOf(channel), 1);
    localStorage.setItem('azubu_extension', JSON.stringify(extData));
    this.channels.splice(this.channels.indexOf(channel), 1);
};