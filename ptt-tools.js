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
