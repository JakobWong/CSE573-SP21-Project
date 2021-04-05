function renderNeuronActivations(data, datasetSelected, modelSelected, isRenderCorrectness){
    const pointId = data.id;
    console.log(pointId);
    const cellI = data.c_i;
    const cellJ = data.c_j;
    console.log(data.value);
    var color;
    if (isRenderCorrectness){
        color = (data.value == 0)? d3.scaleSequential(d3["interpolateReds"]): d3.scaleSequential(d3["interpolateGreens"]);
    }
    else{
        switch (data.value){
            case 0:
                color = d3.scaleSequential(d3["interpolateBlues"]);
                break;
            case 1:
                color = d3.scaleSequential(d3["interpolateOranges"]);
                break;
            case 2:
                color = d3.scaleSequential(d3["interpolateGreens"]);
                break;
            case 3:
                color = d3.scaleSequential(d3["interpolateReds"]);
                break;
        }
    }
    color.domain([0,1]);

    const path = 'preds_' + datasetSelected + '/' + modelSelected + '/' + cellI.toString() + '_' + cellJ.toString() + '.json';
    
    if (modelSelected == 'lin'){
        d3.json(path,(preds)=>{
            const pred = preds.filter(d=>d.id==pointId)[0];

            // console.log(keys);
            const input = pred.input;
            const dense48 = pred.dense_48;
            const dense49 = pred.dense_49;
            const dense50 = pred.dense_50;
            const dense48StartId = input.length;
            const dense49StartId = dense48StartId + dense48.length;
            const dense50StartId = dense49StartId + dense49.length;


            // a_i means activation_i
            input.forEach((a_i,i)=>{
                d3.select("#lin_input_"+i.toString())
                  .style("fill",color(a_i));
                dense48.forEach((a_j,j)=>{
                    d3.select("#nn_link_"+i.toString()+'_'+ (dense48StartId+j).toString())
                      .style("stroke",color(a_i/2+a_j/2));
                })
            })

            dense48.forEach((a_i,i)=>{
                d3.select("#lin_dense48_"+i.toString())
                  .style("fill",color(a_i));
                dense49.forEach((a_j,j)=>{
                    d3.select("#nn_link_"+(dense48StartId+i).toString()+'_'+ (dense49StartId+j).toString())
                      .style("stroke",color(a_i/2+a_j/2))
                })
            })
            dense49.forEach((a_i,i)=>{
                d3.select("#lin_dense49_"+i.toString())
                  .style("fill",color(a_i));
                dense50.forEach((a_j,j)=>{
                    d3.select("#nn_link_"+(dense49StartId+i).toString()+'_'+(dense50StartId+j).toString())
                    .style("stroke",color(a_i/2+a_j/2));
                })
            })
            dense50.forEach((activation,i)=>{
                d3.select("#lin_dense50_"+i.toString())
                  .style("fill",color(activation));
            })



        })
    }
    if (modelSelected == 'mlp'){
        d3.json(path,(preds)=>{
            const pred = preds.filter(d=>d.id==pointId);
            const dense44 = pred.dense_44;
            const dense45 = pred.dense_45;
            const dense46 = pred.dense_46;
            const input = pred.input;

            input.forEach((activation,i)=>{
                d3.select("#mlp_input_"+i.toString())
                  .style("fill",colorNode(activation));
            })

            dense44.forEach((activation,i)=>{
                d3.select("#mlp_dense44_"+i.toString())
                  .style("fill",colorNode(activation));
            })
            dense45.forEach((activation,i)=>{
                d3.select("#mlp_dense45_"+i.toString())
                  .style("fill",colorNode(activation));
            })
            dense46.forEach((activation,i)=>{
                d3.select("#mlp_dense46_"+i.toString())
                  .style("fill",colorNode(activation));
            })
        })
    }
    if (modelSelected == 'cnn'){
        d3.json(path,(preds)=>{
            const pred = preds.filter(d=>d.id==pointId)[0];
            // const color = d3.scaleSequential(d3["interpolateBlues"])
            color.domain([1,0])
            const keys = Object.keys(pred);
            console.log(keys);

            for(var i = 0; i < 24; i++){
                for(var j = 0; j < 32; j++){
                    keys.forEach(key=>{
                        if (key != 'id' && key !='prediction'){
                            d3.select("#"+key+"_"+i.toString()+"_"+j.toString())
                              .style("fill",color(pred.input[i][j]*.5 + pred[key][i][j]*.5));
                        }
                    })
                }
            }

            color.domain([1,0])
            for(var i=0; i < 4;i++){
                d3.select("#pred_"+i.toString())
                    .style("fill",color(pred["prediction"][i]));
            }


        })
    }
}