//收到article.js的訊息就進行下載並回傳檔名
browser.runtime.onMessage.addListener(function(message, sender, sendResponse){
    return browser.downloads.download({
        url: message.url,
        saveAs: true
    }).then(function(id){
        return browser.downloads.search({id});
    }).then(function(downloads){
        for (let download of downloads) {
            return download.filename;
        }
    });
});
