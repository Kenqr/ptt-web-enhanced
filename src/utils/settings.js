const pweSettings = (function(){
    const pweSettings = {};

    let storage;
    const defaultSettings = {
        autoR18: false,
        showFloor: true,
        countPushStatistics: true,
        highlightPosterUserid: true,
        resizeImage: true,
        clickToDownloadImage: false,
        navbarAutohide: true,
        detectThread: false,
        detectThreadRange: 4,
        detectThreadCacheEnabled: true,
        detectThreadCacheExpire: 10 * 60 * 1000,
        blacklistEnabled: true,
        blacklist: [],
    };

    const init = function() {
        //檢查是否有sync storage可用，沒有的話就用local storage
        return browser.storage.sync.get().then(() => {
            storage = browser.storage.sync;
        }, () => {
            storage = browser.storage.local;
        });
    };

    pweSettings.get = async function(key) {
        const settings = await storage.get(key);
        return (settings[key] !== undefined) ? settings[key] : defaultSettings[key];
    };

    pweSettings.getAll = async function() {
        const settings = await storage.get();
        return Object.assign({}, defaultSettings, settings);
    };

    pweSettings.set = async function(key, value) {
        return storage.set({
            [key]: value
        });
    };

    pweSettings.reset = async function() {
        return storage.clear();
    };

    pweSettings.ready = init();

    return pweSettings;
})();
