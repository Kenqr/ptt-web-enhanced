const init = async function(){
    // 套件重新啟用時重新載入頁面
    if ($qs('html.pwe')) { window.location.reload(); }
    $qs('html').classList.add('pwe');

    authorMenu();
};

//幫作者ID加上搜尋選單
const authorMenu = function(){
    //取得板名
    const board = pwe.boardName;

    $qsa('.author').forEach(authorElem => {
        //作者 ID
        const author = authorElem.textContent;

        //建立選單
        authorElem.classList.add('pwe-menu');
        authorElem.innerHTML = `
            <div class="pwe-menu__trigger" tabindex>${author}▾</div>
            <div class="pwe-menu__dropdown">
                <div>
                    <a href="/bbs/${board}/search?q=author:${author}" class="pwe-menu__anchor">
                        搜尋看板內 ${author} 的文章
                    </a>
                </div>
                <div>
                    <a href="/bbs/ALLPOST/search?q=author:${author}" class="pwe-menu__anchor">
                        搜尋 ALLPOST 板 ${author} 的文章
                    </a>
                </div>
                <div>
                    <a href="https://www.google.com/search?q=site%3Aptt.cc%20${author}"
                        target="_blank" class="pwe-menu__anchor"
                    >
                        Google 搜尋 ${author}
                    </a>
                </div>
            </div>
        `;
    });
};

init();
