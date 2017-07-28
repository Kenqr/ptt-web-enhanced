let posterUserid = null; //文章作者id

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

        //新增highlight
        $qsa('.userid-'+userid).forEach(userid => {
            userid.classList.add('highlight-selected-userid');
        });
    });
});

//幫推文的文章作者id加上高亮度
if (posterUserid) {
    $qsa('.userid-'+posterUserid).forEach(userid => {
        userid.classList.add('highlight-poster-userid');
    });
}
