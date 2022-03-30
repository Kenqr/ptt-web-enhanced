/* global $qs, $qsa, $create, pweSettings, pwe */

const init = async function(){
    // 套件重新啟用時重新載入頁面
    if ($qs('html.pwe')) { window.location.reload(); }
    $qs('html').classList.add('pwe');

    await pweSettings.ready;
    const settings = await pweSettings.getAll();

    parseArticles();

    authorMenu();

    if(settings.blacklistEnabled) handleBlacklist(settings.blacklist);
};

const parseArticles = function(){
    $qsa('.r-ent').forEach(article => {
        const authorElem = $qs('.author', article);
        //作者 ID
        let author = authorElem.textContent;
        if (author === '-') { //文章已被刪除，改為由刪文標題取得作者 id
            const match = $qs('.title', article).textContent.match(/\[(\w+)\]/);
            if (match) author = match[1];
        }
        article.dataset.author = author;
    });
};

//幫作者ID加上搜尋選單
const authorMenu = function(){
    //取得板名
    const board = pwe.boardName;

    $qsa('.r-ent').forEach(article => {
        const authorElem = $qs('.author', article);

        //作者 ID
        const author = article.dataset.author;

        authorElem.classList.add('pwe-menu');
        authorElem.textContent = '';

        //建立按鈕部份
        authorElem.appendChild($create(
            ['div',
                {
                    'class': 'pwe-menu__trigger pwe-menu__trigger--arrow',
                    tabindex: '0',
                },
                author
            ]
        ));

        //建立下拉選單部份
        authorElem.appendChild($create(
            ['div', {'class': 'pwe-menu__dropdown'},
                ['div', {},
                    ['a',
                        {
                            href: `/bbs/${board}/search?q=author:${author}`,
                            'class': 'pwe-menu__anchor',
                        },
                        `搜尋看板內 ${author} 的文章`,
                    ],
                    ['a',
                        {
                            href: `/bbs/ALLPOST/search?q=author:${author}`,
                            'class': 'pwe-menu__anchor',
                        },
                        `搜尋 ALLPOST 板 ${author} 的文章`,
                    ],
                    ['a',
                        {
                            href: `https://www.google.com/search?q=site%3Aptt.cc%20${author}`,
                            target: '_blank',
                            'class': 'pwe-menu__anchor',
                        },
                        `Google 搜尋 ${author}`,
                    ],
                ]
            ]
        ));
    });
};

const handleBlacklist = function(blacklist){
    blacklist = new Set(blacklist);
    for (const item of $qsa('.r-ent')) {
        if (blacklist.has(item.dataset.author)) {
            item.classList.add('pwe-blocked-article');
        }
    }
};

//執行並捕捉可能的錯誤輸出到 console，方便除錯
init().catch(error => {
    console.error('PWE:', error);
});
