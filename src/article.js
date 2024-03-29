/* global $qs, $qsa, $create, pweSettings, pwe */

const init = async function(){
    // 套件重新啟用時重新載入頁面
    if ($qs('html.pwe')) { window.location.reload(); }
    $qs('html').classList.add('pwe');

    await pweSettings.ready;
    const settings = await pweSettings.getAll();

    showArticleTitle();

    processPushUserid();

    if(settings.showFloor) showFloor();

    pushTitleFloor();

    if(settings.countPushStatistics) countPushStatistics();

    highlightPush.on();

    pushUserMenu();

    if(settings.highlightPosterUserid) highlightPosterUserid();

    if(settings.resizeImage) resizeImage();

    if(settings.clickToDownloadImage) clickToDownloadImage();

    if(settings.navbarAutohide) navbarAutohide();

    if(settings.detectThread) detectThread({
        range: settings.detectThreadRange,
        cacheEnabled: settings.detectThreadCacheEnabled,
        cacheExpire: settings.detectThreadCacheExpire,
    });

    if(settings.blacklistEnabled) handleBlacklist(settings.blacklist);

    boardNameLink();
};

//上方導覽列顯示文章標題
const showArticleTitle = function(){
    //由文章標題取得討論串標題
    const getArticleTitleToken = function(title){
        return title.replace(/^(?:(?:Re|Fw): ?)*/i, '');
    };

    //上方導覽列，以及第一個靠右的元素
    const topbar = $qs('#topbar');
    const rightItem = $qs('#topbar a.right');

    //箭頭
    const arrow = $create(['span', {}, '›']);

    //取得文章標題
    const metaTitle = $qs('head meta[property="og:title"]');
    if (!metaTitle) { return; }

    const articleTitle = metaTitle.getAttribute('content'); //文章標題
    const threadTitle = getArticleTitleToken(articleTitle); //討論串標題

    //建立搜尋討論串的連結
    const threadLink = $create(
        ['a', {href: `/bbs/${pwe.boardName}/search?q=thread%3A${threadTitle}`},
            articleTitle,
        ]
    );

    //將箭頭和討論串連結加進上方導覽列
    topbar.insertBefore(arrow, rightItem);
    topbar.insertBefore(threadLink, rightItem);
};

//幫所有推文id加上data-userid，方便後續select
const processPushUserid = function(){
    $qsa('.push-userid').forEach(pushUserid => {
        const userid = pushUserid.innerHTML.trim(); //此則推文id
        pushUserid.dataset.userid = userid;
    });
};

// 將所有推文分區並進行標記
const markPushSections = (function(){
    const concatRegExps = function(regExps, flags = undefined){
        // 傳回所有 regular expressions 連接起來的版本
        return new RegExp(
            regExps.reduce((regexStr, regex) => {
                return regexStr + regex.source;
            }, ''), flags
        );
    };
    // 總推文區塊數
    let sectionCount = null;
    const markPushSectionsImpl = function(){
        // 以推文起始行、轉錄起始行作為分隔來劃分推文區塊，並傳回總推文區塊數。
        // 這個標記只需要做一次，若 sectionCount 已經設置則表示已經標記過了，直接傳回總區塊數。
        if (sectionCount !== null) {
            return sectionCount;
        }
        // 初始化 regular expressions
        // PTT ID: 大小寫英數字不含底線，最少 4 個字元（早期為 2 個字元）
        const pttIdRegex = /[a-zA-Z0-9]{2,}/;
        // 發信站 BBS 名稱
        const bbsNameRegex = /批踢踢實業坊/;
        // 發信站主機名稱（早期文章的主機名稱不是「ptt.cc」）
        const hostNameRegex = /[\w.]+/;
        // IP（IPv4）
        const ipRegex = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
        // 日期與時間（mm/dd/yyyy HH:MM:SS）
        const datetimeRegex = /\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}/;
        // ※ 發信站: BBSName(HostName)...
        const signatureRegex = concatRegExps([/^※ 發信站: /, bbsNameRegex, /\(/, hostNameRegex, /\)(.+)?\n$/]);
        // 現行的「來自」（接在發信站後面）
        const modernFromRegex = concatRegExps([/^, 來自: /, ipRegex, /$/]);
        // 舊文的「來自」（在發信站下一行）
        const legacyFromRegex = concatRegExps([/^◆ From: /, hostNameRegex, /\n$/]);
        // ※ 轉錄者: PttID (IP), mm/dd/yyyy HH:MM:SS
        const forwardSigRegex = concatRegExps([/^※ 轉錄者: /, pttIdRegex, / \(/, ipRegex, /\), /, datetimeRegex, /\n$/]);
        // ※ 文章網址: https://www.ptt.cc/bbs/{BoardName}/{ArticleID}.html
        const articleUrlRegex = /^※ 文章網址: https:\/\/www\.ptt\.cc\/bbs\/[a-zA-Z0-9_-]+\/[MG]\.\d+\.A\.[0-9A-F]{3}\.html\n$/;
        // 搜尋並記錄各區塊分割點
        let cutPoints = [];
        $qsa('#main-content > span.f2').forEach((line) => {
            let isCutPoint = false;
            const match = signatureRegex.exec(line.textContent);
            if (match) {
                // 該行為「發信站」
                const nextSiblingText = (line.nextSibling && line.nextSibling.textContent) || '';
                if (modernFromRegex.test(match[1]) && articleUrlRegex.test(nextSiblingText)) {
                    // 該行為「發信站（含來自）」且次行是「文章網址」
                    isCutPoint = true;
                } else if (legacyFromRegex.test(nextSiblingText) || forwardSigRegex.test(nextSiblingText)) {
                    // 該行為「發信站（不含來自）」且次行為舊文的「來自」或「轉錄者」
                    isCutPoint = true;
                }
            }
            if (isCutPoint) {
                // 記錄區塊分割點
                cutPoints.push(line);
            }
        });
        // 為每個推文區塊的推文加入對應的 class
        // 由文章尾部開始以避免重複標示
        const unmarkedPushSelector = '.push:not([class|="pwe-push-section-"]):not([class*=" pwe-push-section-"])';
        let sectionIndex = cutPoints.length;
        for (; sectionIndex > 0; --sectionIndex) {
            // 以 pwe-push-section-N 標示不同區塊的推文（1~N）
            const sectionClass = `pwe-push-section-${sectionIndex}`;
            const sectionStart = cutPoints[sectionIndex - 1];
            sectionStart.classList.add('pwe-push-section-start');
            $qsa(`.pwe-push-section-start ~ ${unmarkedPushSelector}`).forEach((push) => {
                push.classList.add(sectionClass);
            });
            sectionStart.classList.remove('pwe-push-section-start');
        }
        // 為了處理上的一致性，將其餘沒有被分配到區塊的推文標示為 pwe-push-section-0
        const sectionClass = `pwe-push-section-${sectionIndex}`;
        $qsa(unmarkedPushSelector).forEach((push) => {
            push.classList.add(sectionClass);
        });
        // 記錄並傳回總推文區塊數
        sectionCount = 1 + cutPoints.length;
        return sectionCount;
    };
    return markPushSectionsImpl;
})();

//顯示樓層
const showFloor = function(){
    const pushSectionCount = markPushSections();
    for (let sectionIndex = 0; sectionIndex < pushSectionCount; ++sectionIndex) {
        $qsa(`.push.pwe-push-section-${sectionIndex}`).forEach((push, index) => {
            const floor = document.createElement('span');
            floor.classList.add('pwe-floor');
            if((index+1) % 5 == 0) floor.classList.add('pwe-floor-multiple-5'); //5的倍數樓層
            const textnode = document.createTextNode(`${index+1}樓`);
            floor.appendChild(textnode);
            push.insertBefore(floor, push.childNodes[0]);
        });
    }
};

//指到推文顯示樓層、第幾推/噓/箭頭
const pushTitleFloor = function(){
    const pushSectionCount = markPushSections();
    for (let sectionIndex = 0; sectionIndex < pushSectionCount; ++sectionIndex) {
        const pushCount = {
            good: 0,
            bad: 0,
            normal: 0,
        };

        $qsa(`.push.pwe-push-section-${sectionIndex}`).forEach((push, index) => {
            const pushTagText = $qs('.push-tag', push).innerHTML;

            push.title = `${index+1}樓，`;
            if (pushTagText == '推 ') {
                pushCount.good++;
                push.title = push.title + `第${pushCount.good}推`;
            }
            if (pushTagText == '噓 ') {
                pushCount.bad++;
                push.title = push.title + `第${pushCount.bad}噓`;
            }
            if (pushTagText == '→ ') {
                pushCount.normal++;
                push.title = push.title + `第${pushCount.normal}箭頭`;
            }
        });
    }
};

//推文統計
const countPushStatistics = function(){
    //推文數量統計用
    const pushCount = {
        good: 0,
        bad: 0,
        normal: 0,
    };

    //統計推/噓/→
    //只統計最後區塊的推文
    const pushSectionCount = markPushSections();
    $qsa(`.push.pwe-push-section-${pushSectionCount - 1} .push-tag`).forEach(pushTag => {
        const pushTagText = pushTag.innerHTML;
        if (pushTagText == '推 ') pushCount.good++;
        if (pushTagText == '噓 ') pushCount.bad++;
        if (pushTagText == '→ ') pushCount.normal++;
    });

    //在文章後面顯示推文統計結果
    const pushStatistics = document.createElement('div');
    pushStatistics.classList.add('pwe-push-statistics');
    pushStatistics.textContent = `推噓文統計：推=${pushCount.good}, 噓=${pushCount.bad}, →=${pushCount.normal}`;
    $qs('#main-container').insertBefore(pushStatistics, $qs('#article-polling'));
};

//點選推文時，將相同id的推文高亮度顯示
const highlightPush = (function(){
    let active; //此功能開啟狀態
    let selectedUserid = null; //點選的推文id

    //開啟此項功能
    const on = function(){
        if (active === true) return;
        active = true;

        $qsa('.push').forEach(push => {
            const userid = $qs('.push-userid', push).innerHTML; //此則推文id
    
            push.addEventListener('click', function(){
                toggleHl(userid);
            });
        });
    };

    //將userid的推文加上高亮度，同時會關閉其他id的高亮度
    const setHl = function(userid){
        if (!active) return false;

        //已經是目前高亮度的id，不用做事
        if (userid == selectedUserid) return;

        //移除目前的高亮度
        removeHl();

        //新增高亮度
        $qsa(`[data-userid="${userid}"]`).forEach(userid => {
            userid.parentElement.classList.add('pwe-highlight-push');
        });

        //更新目前選擇的id
        selectedUserid = userid;
    };

    //移除原有高亮度
    const removeHl = function(){
        if (!active) return false;

        //移除高亮度
        $qsa('.pwe-highlight-push').forEach(highlight => {
            highlight.classList.remove('pwe-highlight-push');
        });

        //更新目前選擇的id
        selectedUserid = null;
    };

    //切換某id的高亮度狀態。開啟一個id的高亮度會關閉其他id的高亮度。
    const toggleHl = function(userid){
        if (!active) return false;

        if (selectedUserid === userid) {
            //假如點選的id是目前高亮度的id，就取消高亮度
            removeHl();
        } else {
            //假如點選的id不是目前高亮度的id，就加上高亮度
            setHl(userid);
        }
    };

    return { on, setHl, removeHl, toggleHl };
})();

//幫推文ID加上搜尋選單
const pushUserMenu = function(){
    //取得板名
    const board = pwe.boardName;

    const copyId = function(id) {
        navigator.clipboard.writeText(id);
        pwe.notify('ID 已複製到剪貼簿');
    };

    $qsa('.push-userid').forEach(pushUserid => {
        //作者 ID
        const userid = pushUserid.textContent;

        //建立選單
        pushUserid.classList.add('pwe-menu');
        pushUserid.textContent = '';

        //建立可點選部份
        pushUserid.appendChild($create(
            ['span',
                {
                    'class': 'pwe-menu__trigger',
                    tabindex: '0',
                },
                userid,
            ]
        ));

        //建立下拉選單部份
        pushUserid.appendChild($create(
            ['div', {'class': 'pwe-menu__dropdown'},
                ['div', {},
                    ['a',
                        {
                            href: `/bbs/${board}/search?q=author:${userid}`,
                            'class': 'pwe-menu__anchor',
                        },
                        `搜尋看板內 ${userid} 的文章`,
                    ],
                    ['a',
                        {
                            href: `/bbs/ALLPOST/search?q=author:${userid}`,
                            'class': 'pwe-menu__anchor',
                        },
                        `搜尋 ALLPOST 板 ${userid} 的文章`,
                    ],
                    ['a',
                        {
                            href: `https://www.google.com/search?q=site%3Aptt.cc%20${userid}`,
                            target: '_blank',
                            'class': 'pwe-menu__anchor',
                        },
                        `Google 搜尋 ${userid}`,
                    ],
                    ['a',
                        {
                            'class': 'pwe-menu__anchor pwe-menu__copy-id',
                        },
                        '複製 ID',
                    ],
                ]
            ]
        ));

        //複製 ID 事件
        const copyIdButton = $qs('.pwe-menu__copy-id', pushUserid);
        copyIdButton.addEventListener('click', () => copyId(userid));
    });
};

//放大圖片
const resizeImage = function(){
    //對所有圖片進行處理
    $qsa('.richcontent').forEach(richcontent => {
        const img = $qs('img', richcontent);
        if(!img) return;

        //增加class，以套用CSS
        richcontent.classList.add('pwe-richcontent-resize');
    });
};

//點選圖片進行下載
const clickToDownloadImage = function(){
    //對所有圖片進行處理
    $qsa('.richcontent img').forEach(img => {
        img.classList.add('pwe-clickable'); //指到圖片時滑鼠指標變成手

        //點選圖片時進行下載
        img.addEventListener('click', function(){
            //通知背景程式進行下載
            browser.runtime.sendMessage({
                url: img.src
            }).then(function(filename){
                if (!filename) { return; }
                //顯示下載完成訊息
                pwe.notify(`圖片已下載至${filename}`);
            });
        });    
    });
};

//頂部和底部導覽列自動隱藏
const navbarAutohide = function(){
    $qs('#topbar-container').classList.add('pwe-autohide');
    $qs('#navigation-container').classList.add('pwe-autohide');
};

//自動連結討論串
const detectThread = async function({range, cacheEnabled, cacheExpire} = {}) {
    const CACHE_KEY = 'ptt-web-enhanced-v1';
    const now = Date.now();

    const getArticleId = function(url){
        /\/\w\.(\d+)\.[\w.]+$/.test(url.pathname);
        return RegExp.$1;
    };

    const getArticleTitleToken = function(title){
        /^(?:Re: ?)*(.*)$/i.test(title);
        return RegExp.$1;
    };

    const fetchWithCache = async function(url, options = {credentials: 'include'}){
        // For Firefox, content.fetch should be used to mimic a request from the page script;
        // For Chromium, fetch behaves as from the page script
        const fetchFunc = window.content && window.content.fetch || fetch;

        const request = new Request(url, options);

        if (cacheEnabled && window.caches) {
            try {
                // read from cache if available and not expired
                const cache = await caches.open(CACHE_KEY);
                let response = await cache.match(request);
                if (response && (now - new Date(response.headers.get('Date')).valueOf()) < cacheExpire) {
                    return response;
                }

                // fetch content, save to cache if the response is OK
                response = await fetchFunc(request);
                if (response.ok) { await cache.put(request, response.clone()); }
                return response;
            } catch (ex) {
                // For Firefox, cache related API throws a SecurityError when called in a private window.
                // Cache it and do nothing to fallback; otherwise re-throw the unexpected error.
                if (ex.name !== 'SecurityError') {
                    throw ex;
                }
            }
        }

        // fallback to a normal fetch
        return await fetchFunc(request);
    };

    const fetchDocument = async function(url){
        const response = await fetchWithCache(url);
        const text = await response.text();
        return new DOMParser().parseFromString(text, 'text/html');
    };

    const fetchListPageDocument = async function(index){
        // index == undefined 為最後一頁
        return await fetchDocument(new URL(`index${index || ""}.html`, curUrl));
    };

    const getArticles = function(doc, method = 'all'){
        let elems = $qsa('.r-list-container .r-ent .title a, .r-list-container .r-list-sep', doc);
        const sepIndex = elems.findIndex(x => x.classList.contains('r-list-sep'));
        if (sepIndex !== -1) { elems = elems.slice(0, sepIndex); }

        switch (method) {
            case 'all': {
                return elems.map(elem => ({
                    id: getArticleId(new URL(elem.href, curUrl)),
                    title: elem.textContent,
                    href: elem.href,
                }));
            }
            case 'first': {
                const elem = elems[0];
                if (!elem) { return null; }
                return {
                    id: getArticleId(new URL(elem.href, curUrl)),
                    title: elem.textContent,
                    href: elem.href,
                };
            }
            case 'last': {
                const elem = elems.pop();
                if (!elem) { return null; }
                return {
                    id: getArticleId(new URL(elem.href, curUrl)),
                    title: elem.textContent,
                    href: elem.href,
                };
            }
        }
        return null;
    };

    const seekArticlePage = async function(firstPage, lastPage){
        const searchNext = async function(){
            // 二分搜尋法
            let articlePageGuess = Math.floor(firstPage + (lastPage - firstPage) / 2);
            if (articlePageGuess === articlePage) { articlePageGuess++; }
            articlePage = articlePageGuess;

            const doc = await fetchListPageDocument(articlePageGuess);
            articles = getArticles(doc, 'all');
            let minId = articles[0].id;
            let maxId = articles[articles.length - 1].id;

            if (articleId < minId) {
                if (firstPage === lastPage) {
                    // 此 ID 的文章不存在
                    return -1;
                }
                lastPage = articlePageGuess;
                return searchNext();
            } else if (articleId > maxId) {
                if (firstPage === lastPage) {
                    // 此 ID 的文章不存在
                    return -1;
                }
                firstPage = articlePageGuess;
                return searchNext();
            } else {
                const article = articles.find(x => x.id === articleId);
                if (!article) {
                    // 此 ID 的文章不存在
                    return -1;
                }
                return articlePageGuess;
            }
        };

        return searchNext();
    };

    const seekPrevPage = async function(){
        const searchNext = async function(){
            if (--page < pageMin) { return null; }
            const doc = await fetchListPageDocument(page)
            let prev = getArticles(doc, 'all').reverse().find(x => getArticleTitleToken(x.title) === getArticleTitleToken(article.title));
            if (prev) { return prev; }
            return searchNext();
        };

        let prev = articles.slice(0, articleIndex).reverse().find(x => getArticleTitleToken(x.title) === getArticleTitleToken(article.title));
        if (prev) { return prev; }
        let page = articlePage, pageMin = Math.max(page - range, firstPage);
        return searchNext();
    };

    const seekNextPage = async function(){
        const searchNext = async function(){
            if (++page > pageMax) { return null; }
            const doc = await fetchListPageDocument(page)
            let next = getArticles(doc, 'all').find(x => getArticleTitleToken(x.title) === getArticleTitleToken(article.title));
            if (next) { return next; }
            return searchNext();
        };

        let next = articles.slice(articleIndex + 1).find(x => getArticleTitleToken(x.title) === getArticleTitleToken(article.title));
        if (next) { return next; }
        let page = articlePage, pageMax = Math.min(page + range, lastPage);
        return searchNext();
    };

    const curUrl = new URL(location.href);
    let articles,
        articleId = getArticleId(curUrl), articlePage = -1, article, articleIndex,
        firstPage = 1, lastPage;

    try {
        const lastDoc = await fetchListPageDocument();
        const url = $qsa('.btn-group-paging a.btn', lastDoc)[1].href;
        if (url && /\/index(\d+)\.html$/.test(url)) {
            lastPage = parseInt(RegExp.$1, 10) + 1;
        } else {
            lastPage = 1;
        }

        articlePage = await seekArticlePage(firstPage, lastPage);
        if (articlePage === -1) { throw new Error(`'${curUrl}' 頁面不存在`); }

        // 重導向「返回看板」
        const newUrl = new URL(`index${articlePage}.html`, curUrl);
        for (const elem of $qsa('a.board, a.pwe-board')) {
            elem.href = newUrl.pathname;
        }

        articleIndex = articles.findIndex(x => x.id === articleId);
        article = articles[articleIndex];

        const [prevPage, nextPage] = await Promise.all([seekPrevPage(), seekNextPage()]);
        let prevPageElem;
        if (prevPage) {
            prevPageElem = document.createElement('a');
            prevPageElem.href = prevPage.href;
        } else {
            prevPageElem = document.createElement('del');
        }
        prevPageElem.classList.add('pwe-thread');
        prevPageElem.textContent = '上一篇';
        $qs('#navigation').insertBefore(prevPageElem, $qs('#navigation .bar'));

        let nextPageElem;
        if (nextPage) {
            nextPageElem = document.createElement('a');
            nextPageElem.href = nextPage.href;
        } else {
            nextPageElem = document.createElement('del');
        }
        nextPageElem.classList.add('pwe-thread');
        nextPageElem.textContent = '下一篇';
        $qs('#navigation').insertBefore(nextPageElem, $qs('#navigation .bar'));
    } catch (ex) {
        console.error(ex);
    }
};

//作者的推文使用較明顯的箭頭
const highlightPosterUserid = function(){
    let posterUserid = undefined; //文章作者id

    //找出文章作者
    $qsa('.article-metaline').forEach(articleMetaline => {
        if ($qs('.article-meta-tag', articleMetaline).innerHTML == '作者') {
            const pattern = /\w+/;
            const matches = $qs('.article-meta-value', articleMetaline).innerHTML.match(pattern);
            if(matches) posterUserid = matches[0];
        }
    });

    //把文章作者的箭頭加上class
    if (posterUserid) {
        $qsa(`[data-userid="${posterUserid}"]`).forEach(userid => {
            const pushTag = $qs('.push-tag', userid.parentElement);
            pushTag.classList.add('pwe-poster-push-tag');
        });
    }

    //把文章作者的推文加上高亮度
    highlightPush.setHl(posterUserid);
};

//文章右上角的板名增加連到看板的連結
const boardNameLink = function(){
    //因為文章格式可能被作者修改，所以會做各種檢查

    const articleMetalineRight = $qs('.article-metaline-right');
    if (!articleMetalineRight) return;

    const articleMetaTag = $qs('.article-meta-tag', articleMetalineRight);
    if (!articleMetaTag || articleMetaTag.innerHTML.trim() != '看板') return;
    
    const articleMetaValue = $qs('.article-meta-value', articleMetalineRight);
    if (!articleMetaValue) return;

    const board = articleMetaValue.innerHTML.trim();
    if (!board.match(/[\w-]+/)) return;

    const anchor = document.createElement('a');
    anchor.href = `/bbs/${board}/index.html`;
    anchor.textContent = board;
    anchor.classList.add('pwe-board');
    articleMetaValue.innerHTML = '';
    articleMetaValue.appendChild(anchor);
};

const handleBlacklist = function(blacklist){
    blacklist = new Set(blacklist);
    for (const push of $qsa('.push')) {
        const userId = $qs('.push-userid', push).dataset.userid;
        if (!blacklist.has(userId)) { continue; }
        push.classList.add('pwe-blocked-push');

        //標記推文內容產生的圖片或影片預覽
        let next = push.nextElementSibling;
        while (next && next.matches('.richcontent')) {
            next.classList.add('pwe-blocked-push-richcontent');
            next = next.nextElementSibling;
        }
    }
};

//執行並捕捉可能的錯誤輸出到 console，方便除錯
init().catch(error => {
    console.error('PWE:', error);
});
