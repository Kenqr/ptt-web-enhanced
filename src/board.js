const init = async function(){
    // 套件重新啟用時重新載入頁面
    if ($qs('html.pwe')) { window.location.reload(); }
    $qs('html').classList.add('pwe');

    setUpHotkeys();
};

const setUpHotkeys = function(){
    document.addEventListener('keypress', event => {
        const keyName = event.key;

        if (keyName === 'Control') {
            // do not alert when only Control key is pressed.
            return;
        }

        if (event.ctrlKey) {
            // Even though event.key is not 'Control' (i.e. 'a' is pressed),
            // event.ctrlKey may be true if Ctrl key is pressed at the time.
            console.log(`Combination of ctrlKey + ${keyName}`);
        } else {
            console.log(`Key pressed ${keyName}`);
        }
    }, false);
};

init();
