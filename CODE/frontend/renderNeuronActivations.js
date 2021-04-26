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
                color = d3.scaleSequential(d3["interpolatePuBu"]);
                break;
            case 1:
                color = d3.scaleSequential(d3["interpolateOrRd"]);
                break;
            case 2:
                color = d3.scaleSequential(d3["interpolatePurples"]);
                break;
            case 3:
                color = d3.scaleSequential(d3["interpolateRdPu"])
                break;
        }
    }
    color.domain([0,1]);

    var path = 'preds_' + datasetSelected + '/' + modelSelected + '/' + cellI.toString() + '_' + cellJ.toString() + '.json';
    console.log(path);
    
    if (modelSelected == 'mlp'){
        
        
        d3.select("#mlp_tooltip").remove();

        var div = d3.select("#mlp")
        .append("div")	
        .attr("class", "tooltip")			
        .attr("id","mlp_tooltip")	
        .style("opacity", 0);

        d3.json(path,(preds)=>{
            var pred = preds.filter(d=>d.id==pointId)[0];
            var dense1 = pred.dense_28;
            var dense2 = pred.dense_29;
            var dense3 = pred.dense_30;
            var input = pred.input;
            var dense1StartId = input.length;
            var dense2StartId = dense1StartId + dense1.length;
            var dense3StartId = dense2StartId + dense2.length;
           
            console.log(modelSelected);
            // a_i means activation_i
            input.forEach((a_i,i)=>{
                d3.select("#mlp_input_"+i.toString())
                  .style("fill",d=>{ d.value = a_i; return color(a_i)});
                  dense1.forEach((a_j,j)=>{
                    d3.select("#nn_link_"+i.toString()+'_'+ (dense1StartId+j).toString())
                      .style("stroke",color(a_i/2+a_j/2));
                })
            })

            dense1.forEach((a_i,i)=>{
                d3.select("#mlp_dense1_"+i.toString())
                    .style("fill",d=>{ d.value = a_i; return color(a_i)});
                dense2.forEach((a_j,j)=>{
                    d3.select("#nn_link_"+(dense1StartId+i).toString()+'_'+ (dense2StartId+j).toString())
                      .style("stroke",color(a_i/2+a_j/2))
                })
            })
            dense2.forEach((a_i,i)=>{

                d3.select("#mlp_dense2_"+i.toString())
                .style("fill",d=>{ d.value = a_i; return color(a_i)});
                dense3.forEach((a_j,j)=>{
                    d3.select("#nn_link_"+(dense2StartId+i).toString()+'_'+(dense3StartId+j).toString())
                    .style("stroke",color(a_i/2+a_j/2));
                })
            })
            dense3.forEach((a_i,i)=>{
                
                d3.select("#mlp_dense3_"+i.toString())
                .style("fill",d=>{ d.value = a_i; return color(a_i)});
            })

            d3.selectAll(".neuron")
            .on("mouseover",d=>{
              div.transition().duration(200).style('opacity', 1)
              .style('left', (d3.event.pageX-600) + 'px')
              .style('top', (d3.event.pageY) + 'px');

              div.html(`<h6>${d.value}</h6>`)

            })
          
        })
    }
    if (modelSelected == 'cnn'){

        d3.select("#cnn_tooltip").remove();

        var div = d3.select("#cnn")
        .append("div")	
        .attr("class", "tooltip")			
        .attr("id","cnn_tooltip")	
        .style("opacity", 0);

        d3.json(path,(preds)=>{
            const pred = preds.filter(d=>d.id==pointId)[0];
            color.domain([1,0])
            const keys = Object.keys(pred);
            var layerName2idxMapping;
            if (datasetSelected == 'test_laptop'){  
                layerName2idxMapping = {'input':'0','conv2d_25':'1','max_pooling2d_25':'2','conv2d_26':'3','max_pooling2d_26':'4'};
            }
            else{
                layerName2idxMapping = {'input':'0','conv2d_25':'1','max_pooling2d_25':'2','conv2d_26':'3','max_pooling2d_26':'4'};
            }

            for(var i = 0; i < 24; i++){
                for(var j = 0; j < 32; j++){
                    keys.forEach(key=>{
                        if (key != 'id' && key !='prediction'){
                            d3.select("#layer_"+layerName2idxMapping[key]+"_"+i.toString()+"_"+j.toString())
                              .style("fill",d=>{
                                  d.value = pred[key][i][j];
                                  return color(pred.input[i][j]*.5 + d.value*.5)})
                              .on("mouseover",(d)=>{
                                div.transition().duration(200).style('opacity', 1)
                                .style('left', (d3.event.pageX-600) + 'px')
                                .style('top', (d3.event.pageY-600) + 'px');
                
                                div.html(`<h6>${d.value}</h6>`)
                              });
                        }
                    })
                }
            }

            color.domain([1,0]);
            for(var i=0; i < 4;i++){
                d3.select("#pred_"+i.toString())
                    .style("fill",d=>{
                        d.value = pred["prediction"][i];
                        return color(pred["prediction"][i]);
                    })
                    .on("mouseover",(d)=>{
                        div.transition().duration(200).style('opacity', 1)
                        .style('left', (d3.event.pageX-600) + 'px')
                        .style('top', (d3.event.pageY-600) + 'px');

                        div.html(`<h6>${d.value}</h6>`);
                      });
            }


        })
    }
}