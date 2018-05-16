//querySelectorAll
const $qsa = function(selector, baseElement = document){
    return [...baseElement.querySelectorAll(selector)];
};

//querySelector
const $qs = function(selector, baseElement = document){
    return baseElement.querySelector(selector);
};

const pwe = {};

//找出網址中的板名
pwe.boardName = (function(){
    const re = /\/bbs\/([\w-]+)\/.+/;
    const match = window.location.href.match(re);
    if (!match) return null;
    return match[1];
})();
