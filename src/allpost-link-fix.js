//修正 ALLPOST 板文章連結錯誤的問題
$qsa('.r-ent').forEach(rEnt => {
    //從文章列表的文章標題找出板名
    const anchor = $qs('a', rEnt);
    const re = /\(([\w-]+)\)$/; //match 板名
    const result = re.exec(anchor.innerHTML);
    if (!result[1]) {
        console.error('偵測板名失敗!, result = ', result);
        return;
    }
    const board = result[1];

    //將連結中的板名替換為正確的板名
    anchor.href = anchor.href.replace('ALLPOST', board);
});
