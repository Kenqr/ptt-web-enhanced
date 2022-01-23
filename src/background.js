const pweDownloads = new Map();

//收到article.js的訊息就進行下載並回傳檔名
browser.runtime.onMessage.addListener(function(message, sender, sendResponse){
    const url = message.url;
    return browser.downloads.download({
        url,
        saveAs: true
    }).then(function(id){
        return new Promise((resolve, reject) => {
            const cb = async (downloadDelta) => {
                if (downloadDelta.error) {
                    reject(new Error(downloadDelta.error.current));
                    pweDownloads.delete(id);
                    return;
                }
                if (downloadDelta.state && downloadDelta.state.current === 'complete') {
                    const [download] = await browser.downloads.search({id});
                    resolve(download.filename);
                    pweDownloads.delete(id);
                    return;
                }
            };
            pweDownloads.set(id, cb);
        });
    }).catch(function(ex){
        console.error(`Failed to download ${url}: ${ex.message}`);
        return null;
    });
});

browser.downloads.onChanged.addListener(function(downloadDelta) {
    const cb = pweDownloads.get(downloadDelta.id);
    if (!cb) { return; }
    cb(downloadDelta);
});
