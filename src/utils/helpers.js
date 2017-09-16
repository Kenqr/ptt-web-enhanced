//querySelectorAll
const $qsa = function(selector, baseElement = document){
    return [...baseElement.querySelectorAll(selector)];
};

//querySelector
const $qs = function(selector, baseElement = document){
    return baseElement.querySelector(selector);
};
