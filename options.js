const init = async function(){
    const values = await pweSettings.getAll();

    //處理boolean設定
    $qsa('[option-type="boolean"]').forEach(option => {
        //載入設定
        option.checked = values[option.name];

        //修改時自動寫入
        option.addEventListener("blur", function(event){
            pweSettings.set(event.target.name, event.target.checked);
        });
    });
};

document.addEventListener("DOMContentLoaded", init);
