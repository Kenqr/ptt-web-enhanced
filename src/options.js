/* global $qs, $qsa, pweSettings */

const init = async function(){
    await pweSettings.ready;

    loadSettings();

    //修改時自動寫入
    $qsa('input[type="checkbox"]').forEach(option => {
        option.addEventListener('change', function(event){
            pweSettings.set(event.target.name, event.target.checked);
        });
    });
    $qsa('input[type="number"]').forEach(option => {
        option.addEventListener('change', function(event){
            if (event.target.validity.valid) {
              pweSettings.set(event.target.name, event.target.valueAsNumber);
            }
        });
    });

    //重置設定按鈕
    $qs('#resetSettings').addEventListener('click', resetSettings);

    //黑名單設定按鈕
    $qs('#blacklistSettings').addEventListener('click', blacklistSettings);
};

//載入設定
const loadSettings = async function(){
    const values = await pweSettings.getAll();
    
    //載入設定
    $qsa('input[type="checkbox"]').forEach(option => {
        option.checked = values[option.name];
    });
    $qsa('input[type="number"]').forEach(option => {
        option.value = values[option.name];
    });
};

//重置設定
const resetSettings = async function(){
    await pweSettings.reset();
    loadSettings();
};

const blacklistSettings = async function(){
    const blacklistOld = await pweSettings.get('blacklist');
    const valueOld = blacklistOld.join(' ');
    const valueNew = prompt('請輸入欲列入黑名單的使用者 ID（以空白字元分隔）', valueOld);
    if (valueNew === null || valueNew === valueOld) { return; }
    const blacklistNew = Array.from(new Set(valueNew.match(/[a-zA-Z0-9]{2,}/g) || []));
    await pweSettings.set('blacklist', blacklistNew);
};

document.addEventListener('DOMContentLoaded', init);
