const pweSettings = {};

pweSettings.defaultSettings = {
    showFloor: true,
    countPushStatistics: true,
    highlightPosterUserid: true,
    resizeImage: true,
    clickToDownloadImage: false,
    navbarAutohide: true,
};

pweSettings.get = async function(key) {
    const settings = await browser.storage.sync.get(key);
    return (settings[key] !== undefined) ? settings[key] : defaultSettings[key];
};

pweSettings.getAll = async function() {
    const settings = await browser.storage.sync.get();
    return Object.assign({}, pweSettings.defaultSettings, settings);
};

pweSettings.set = async function(key, value) {
    return browser.storage.sync.set({
        [key]: value
    });
};

pweSettings.reset = async function() {
    return browser.storage.sync.clear();
};
