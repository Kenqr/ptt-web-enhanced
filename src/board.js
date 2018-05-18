const init = async function(){
    // 套件重新啟用時重新載入頁面
    if ($qs('html.pwe')) { window.location.reload(); }
    $qs('html').classList.add('pwe');

    authorMenu();

    if (pwe.boardName === 'ALLPOST') fixAllpostLink();
};

//幫作者ID加上搜尋選單
const authorMenu = function(){
    //取得板名
    const board = pwe.boardName;

    $qsa('.author').forEach(authorElem => {
        //作者 ID
        const author = authorElem.textContent;

        authorElem.classList.add('pwe-menu');
        authorElem.textContent = '';

        //建立按鈕部份
        authorElem.appendChild($create(
            ['div',
                {
                    'class': 'pwe-menu__trigger',
                    'tabindex': '',
                },
                `${author}▾`
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

//修正 ALLPOST 板文章連結錯誤的問題
const fixAllpostLink = function(){
    $qsa('.r-ent').forEach(rEnt => {
        //從文章列表的文章標題找出板名
        const anchor = $qs('a', rEnt);
        const re = /\(([\w-]+)\)$/; //match 板名
        const result = re.exec(anchor.innerHTML);
        if (!result[1]) {
            console.error('偵測板名失敗!, result = ', result);
            return;
        }
        const board = result[1];
    
        //將連結中的板名替換為正確的板名
        anchor.href = anchor.href.replace('ALLPOST', board);
    });
};

init();
