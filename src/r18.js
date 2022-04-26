/* global $qs, pweSettings */

const init = async function(){
    // 套件重新啟用時重新載入頁面
    if ($qs('html.pwe')) { window.location.reload(); }
    $qs('html').classList.add('pwe');

    await pweSettings.ready;
    const settings = await pweSettings.getAll();

    if(settings.autoR18) autoR18();
};

const autoR18 = function(){
    $qs('.btn-big').click();
};

//執行並捕捉可能的錯誤輸出到 console，方便除錯
init().catch(error => {
    console.error('PWE:', error);
});
