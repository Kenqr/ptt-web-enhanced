const init = async function(){
    // 套件重新啟用時重新載入頁面
    if ($qs('html.pwe')) { window.location.reload(); }
    $qs('html').classList.add('pwe');

    linkArticle();
};

//幫文章加上同主題串接的連結
const linkArticle = function(){
    $qsa('.r-ent').forEach(rEnt => {
        //取得文章標題
        const title = $qs('.title', rEnt).textContent;
        const thread = title; //FIXME 去掉前面的 Re: 或是 Fw:

        //取得板名
        const re = /\/bbs\/([\w-]+)\/.+/;
        const match = window.location.href.match(re);
        if (!match) return;
        const board = match[1];

        //建立連結
        const anchor = document.createElement('a');
        anchor.href = `/bbs/${board}/search?q=thread:${thread}`;
        anchor.textContent = '⛓️';

        //插入連結
        $qs('.title', rEnt).prepend(anchor);
    });
};

init();
