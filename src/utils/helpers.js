/* exported $qsa, $qs, $create, pwe */

//querySelectorAll
const $qsa = function(selector, baseElement = document){
    return [...baseElement.querySelectorAll(selector)];
};

//querySelector
const $qs = function(selector, baseElement = document){
    return baseElement.querySelector(selector);
};

/**
 * 安全的建立元素
 * 參考 https://developer.mozilla.org/en-US/docs/Archive/Add-ons/Overlay_Extensions/XUL_School/DOM_Building_and_HTML_Insertion#JSON_Templating
 * 使用例：
 * const content = $create(
 *     ['div', // 第一個參數是元素名稱
 *         { // 第二個參數是元素的屬性
 *             'class': 'foo'
 *         },
 *         // 後面任意數量的參數是子元素
 *         '<script>alert("not injected")</script>', // 第一個子元素。字串使用 createTextNode 處理，因此不會被插入程式
 *         ['span', {}, // 第二個子元素。傳入 array 時，可遞迴建立元素
 *             'success!!',
 *         ],
 *     ]
 * );
 */
const $create = function $create(json) {
    const [tag, attrs, ...children] = json;

    //建立元素
    const elem = document.createElement(tag);

    //加上屬性
    for (const name in attrs) {
        if (Object.prototype.hasOwnProperty.call(attrs, name)) {
            elem.setAttribute(name, attrs[name]);
        }
    }

    //加上子元素
    for (let i=0; i<children.length; i++) {
        if (typeof children[i] === 'object') {
            const node = $create(children[i]);
            elem.appendChild(node);
        } else {
            const node = document.createTextNode(children[i]);
            elem.appendChild(node);
        }
    }

    return elem;
};

const pwe = {};

//找出網址中的板名
pwe.boardName = (function(){
    const re = /\/bbs\/([\w-]+)\/.+/;
    const match = window.location.href.match(re);
    if (!match) return null;
    return match[1];
})();
