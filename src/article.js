const init = async function(){
    const settings = await pweSettings.getAll();

    processPushUserid();

    if(settings.showFloor) showFloor();

    if(settings.countPushStatistics) countPushStatistics();

    clickToHighlightUserid();

    if(settings.highlightPosterUserid) highlightPosterUserid();

    if(settings.resizeImage) resizeImage();

    if(settings.clickToDownloadImage) clickToDownloadImage();

    if(settings.navbarAutohide) navbarAutohide();
};

//顯示通知訊息
const notify = (() => {
    const pweNotify = document.createElement('div');
    pweNotify.classList.add('pwe-notify', 'hidden');
    $qs('body').insertBefore(pweNotify, null);
    let notifyTimeoutId = undefined;

    return message => {
        //移除原有的timeout
        if(notifyTimeoutId) {
            clearTimeout(notifyTimeoutId);
            notifyTimeoutId = undefined;
        }
        //顯示訊息，並定時移除
        pweNotify.textContent = message;
        pweNotify.classList.remove('hidden');
        notifyTimeoutId = setTimeout(function(){
            pweNotify.classList.add('hidden');
        }, 5000);
    };
})();

//幫所有推文id加上class，方便後續select
const processPushUserid = function(){
    $qsa('.push-userid').forEach(pushUserid => {
        const userid = pushUserid.innerHTML.trim(); //此則推文id
        pushUserid.classList.add('userid-'+userid);
    });
};

//顯示樓層
const showFloor = function(){
    $qsa('.push').forEach((push, index) => {
        const floor = document.createElement('span');
        floor.classList.add('floor');
        if((index+1) % 5 == 0) floor.classList.add('floor-multiple-5'); //5的倍數樓層
        const textnode = document.createTextNode(`${index+1}樓`);
        floor.appendChild(textnode);
        push.insertBefore(floor, push.childNodes[0]);
    });
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
    $qsa('.push-tag').forEach(pushTag => {
        const pushTagText = pushTag.innerHTML;
        if (pushTagText == '推 ') pushCount.good++;
        if (pushTagText == '噓 ') pushCount.bad++;
        if (pushTagText == '→ ') pushCount.normal++;
    });

    //在文章後面顯示推文統計結果
    const pushStatistics = document.createElement('div');
    pushStatistics.classList.add('push-statistics');
    pushStatistics.textContent = `推噓文統計：推=${pushCount.good}, 噓=${pushCount.bad}, →=${pushCount.normal}`;
    $qs('#main-container').insertBefore(pushStatistics, $qs('#article-polling'));
};

//點選id時，將推文相同id高亮度顯示
const clickToHighlightUserid = function(){
    let selectedUserid = null; //點選的推文id

    $qsa('.push-userid').forEach(pushUserid => {
        const userid = pushUserid.innerHTML; //此則推文id

        pushUserid.addEventListener('click', function(){
            //移除原有highlight
            $qsa('.highlight-selected-userid').forEach(highlight => {
                highlight.classList.remove('highlight-selected-userid');
            });

            //假如點選的id是目前選擇的id，就取消選取
            if (selectedUserid === userid) {
                selectedUserid = null;
                return;
            }

            //新增highlight
            $qsa('.userid-'+userid).forEach(userid => {
                userid.classList.add('highlight-selected-userid');
            });
            selectedUserid = userid; //更新目前選擇的id
        });
    });
};

//放大圖片
const resizeImage = function(){
    //對所有圖片進行處理
    $qsa('.richcontent').forEach(richcontent => {
        const img = $qs('img', richcontent);
        if(!img) return;

        //增加class，以套用CSS
        richcontent.classList.add('richcontent-resize');
    });
};

//點選圖片進行下載
const clickToDownloadImage = function(){
    //對所有圖片進行處理
    $qsa('.richcontent img').forEach(img => {
        img.classList.add('clickable'); //指到圖片時滑鼠指標變成手

        //點選圖片時進行下載
        img.addEventListener('click', function(){
            //通知背景程式進行下載
            browser.runtime.sendMessage({
                url: img.src
            }).then(function(filename){
                //顯示下載完成訊息
                notify(`圖片已下載至${filename}`);
            });
        });    
    });
};

/* 頂部和底部導覽列自動隱藏 */
const navbarAutohide = function(){
    $qs('#topbar-container').classList.add('autohide');
    $qs('#navigation-container').classList.add('autohide');
};

//高亮度文章作者id
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

    //幫推文的文章作者id加上高亮度
    if (posterUserid) {
        $qsa('.userid-'+posterUserid).forEach(userid => {
            userid.classList.add('highlight-poster-userid');
        });
    }
};

init();
