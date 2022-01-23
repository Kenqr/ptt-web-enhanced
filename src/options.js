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

document.addEventListener('DOMContentLoaded', init);
