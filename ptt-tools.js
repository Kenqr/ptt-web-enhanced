var posterUserid = null;

//找出文章作者
let articleMetalines = document.querySelectorAll('.article-metaline');
for(let i=0; i<articleMetalines.length; i++) {
    if (articleMetalines[i].querySelector('.article-meta-tag').innerHTML == '作者') {
        let pattern = /\w+/;
        let matches = articleMetalines[i].querySelector('.article-meta-value').innerHTML.match(pattern);
        if(matches) posterUserid = matches[0];
        break;
    }
}

let pushUserids = document.querySelectorAll('.push-userid'); //所有推文id
for(let i=0; i<pushUserids.length; i++) {
    //幫所有推文id加上class，方便後續select
    pushUserids[i].classList.add('userid-'+pushUserids[i].innerHTML);

    //點選id時，將推文相同id高亮度顯示
    pushUserids[i].addEventListener('click', function(){
        //移除原有highlight
        let highlights = document.querySelectorAll('.highlight-selected-userid');
        for(let j=0; j<highlights.length; j++) {
            highlights[j].classList.remove('highlight-selected-userid');
        }

        //新增highlight
        let userid = pushUserids[i].innerHTML;
        let userids = document.querySelectorAll('.userid-'+userid);
        for(let j=0; j<userids.length; j++) {
            userids[j].classList.add('highlight-selected-userid');
        }
    });
}

//幫推文的文章作者id加上高亮度
if (posterUserid) {
    let userids = document.querySelectorAll('.userid-'+posterUserid);
    for(let i=0; i<userids.length; i++) {
        userids[i].classList.add('highlight-poster-userid');
    }
}
