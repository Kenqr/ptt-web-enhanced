let posterUserid = null; //文章作者id
let selectedUserid = null; //點選的推文id

//querySelectorAll
const $qsa = function(selector, baseElement = document){
    return [...baseElement.querySelectorAll(selector)];
};

//querySelector
const $qs = function(selector, baseElement = document){
    return baseElement.querySelector(selector);
};

//找出文章作者
$qsa('.article-metaline').forEach(articleMetaline => {
    if ($qs('.article-meta-tag', articleMetaline).innerHTML == '作者') {
        let pattern = /\w+/;
        let matches = $qs('.article-meta-value', articleMetaline).innerHTML.match(pattern);
        if(matches) posterUserid = matches[0];
    }
});

//推文數量統計用
let pushCount = {
    good: 0,
    bad: 0,
    normal: 0,
};
//對所有推文進行處理
let pushArray = $qsa('.push');
for(let i=0; i<pushArray.length; i++) {
    let push = pushArray[i];

    //顯示樓層
    let floor = document.createElement("span");
    floor.classList.add('floor');
    let textnode = document.createTextNode(`${i+1}樓`);
    floor.appendChild(textnode);
    push.insertBefore(floor, push.childNodes[0]);

    //統計推/噓/→
    var pushTag = $qs('.push-tag', push).innerHTML;
    if(pushTag == '推 ') pushCount.good++;
    if(pushTag == '噓 ') pushCount.bad++;
    if(pushTag == '→ ') pushCount.normal++;
}

//在文章後面顯示推文統計結果
let pushStatistics = document.createElement('div');
pushStatistics.classList.add('push-statistics');
pushStatistics.textContent = `推噓文統計：推=${pushCount.good}, 噓=${pushCount.bad}, →=${pushCount.normal}`;
$qs('#main-container').insertBefore(pushStatistics, $qs('#article-polling'));

//對所有推文id欄位進行處理
$qsa('.push-userid').forEach(pushUserid => {
    let userid = pushUserid.innerHTML; //此則推文id

    //幫所有推文id加上class，方便後續select
    pushUserid.classList.add('userid-'+userid);

    //點選id時，將推文相同id高亮度顯示
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

//幫推文的文章作者id加上高亮度
if (posterUserid) {
    $qsa('.userid-'+posterUserid).forEach(userid => {
        userid.classList.add('highlight-poster-userid');
    });
}
