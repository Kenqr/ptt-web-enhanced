const init = async function(){
    await pweSettings.ready;

    loadSettings();

    //修改時自動寫入
    $qsa('[option-type="boolean"]').forEach(option => {
        option.addEventListener('change', function(event){
            pweSettings.set(event.target.name, event.target.checked);
        });
    });

    //重置設定按鈕
    $qs('#resetSettings').addEventListener('click', resetSettings);
};

//載入設定
const loadSettings = async function(){
    const values = await pweSettings.getAll();
    
    //載入boolean設定
    $qsa('[option-type="boolean"]').forEach(option => {
        option.checked = values[option.name];
    });
};

//重置設定
const resetSettings = async function(){
    await pweSettings.reset();
    loadSettings();
};

document.addEventListener('DOMContentLoaded', init);
