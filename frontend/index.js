document.getElementById("embedding-check").addEventListener("change", ()=>{
    isRenderCorrectness = document.getElementById("embedding-check").checked;
    console.log(isRenderCorrectness);
    LoadDataset('test_laptop',isRenderCorrectness);
});
document.getElementById("btn-test-laptop").addEventListener("click", ()=>LoadDataset('test_laptop',isRenderCorrectness));
document.getElementById("btn-test-rest").addEventListener("click", ()=>LoadDataset('test_rest',isRenderCorrectness));
// document.getElementById("btn-mlp").addEventListener("click", Load("lin_graph"));
// document.getElementById("btn-cnn").addEventListener("click", Load("cnn_graph"));