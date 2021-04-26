document.getElementById("embedding-check").addEventListener("change", ()=>{
    isRenderCorrectness = document.getElementById("embedding-check").checked;
    LoadDataset('test_rest',isRenderCorrectness);
});
document.getElementById("btn-test-rest").addEventListener("click", ()=>LoadDataset('test_rest',isRenderCorrectness));

document.getElementById("btn-two-classifier").addEventListener("click", ()=>{
    LoadModel('cnn',datasetSelected);
    LoadModel('mlp',datasetSelected);
});

// document.getElementById("btn-mlp").addEventListener("click", Load("lin_graph"));
// document.getElementById("btn-cnn").addEventListener("click", Load("cnn_graph"));