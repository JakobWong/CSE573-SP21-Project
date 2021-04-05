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
                color = d3.scaleSequential(d3["interpolatePurples"]);
                break;
            case 3:
                color = d3.scaleLinear()
                          .domain([0,1])
                          .range(["#FFCEE6","#990c58"])
                          .interpolate(d3.interpolateHcl);
                break;
        }
    }
    color.domain([0,1]);

    const path = 'preds_' + datasetSelected + '/' + modelSelected + '/' + cellI.toString() + '_' + cellJ.toString() + '.json';
    
    d3.select("#nn_tooltip").remove();

    var div = d3.select("#nn")
                .append("div")	
                .attr("class", "tooltip")			
                .attr("id","nn_tooltip")	
                .style("opacity", 0);

    if (modelSelected == 'lin'){
        d3.json(path,(preds)=>{
            const pred = preds.filter(d=>d.id==pointId)[0];

            // console.log(keys);
            const input = pred.input;
            const dense1 = (datasetSelected == 'test_laptop')? pred.dense_48:pred.dense_51;
            const dense2 = (datasetSelected == 'test_laptop')? pred.dense_49:pred.dense_52;
            const dense3 = (datasetSelected == 'test_laptop')? pred.dense_50:pred.dense_53;
            const dense1StartId = input.length;
            const dense2StartId = dense1StartId + dense1.length;
            const dense3StartId = dense2StartId + dense2.length;


            d3.selectAll(".neuron")
              .on("mouseover",d=>{
                div.transition().duration(200).style('opacity', 1)
                .style('left', (d3.event.pageX-600) + 'px')
                .style('top', (d3.event.pageY) + 'px');

                div.html(`<h6>${d.value}</h6>`)

              })
            
            // a_i means activation_i
            input.forEach((a_i,i)=>{
                d3.select("#lin_input_"+i.toString())
                  .style("fill",d=>{ d.value = a_i; return color(a_i)});
                  dense1.forEach((a_j,j)=>{
                    d3.select("#nn_link_"+i.toString()+'_'+ (dense1StartId+j).toString())
                      .style("stroke",color(a_i/2+a_j/2));
                })
            })

            dense1.forEach((a_i,i)=>{
                d3.select("#lin_dense1_"+i.toString())
                    .style("fill",d=>{ d.value = a_i; return color(a_i)});
                dense2.forEach((a_j,j)=>{
                    d3.select("#nn_link_"+(dense1StartId+i).toString()+'_'+ (dense2StartId+j).toString())
                      .style("stroke",color(a_i/2+a_j/2))
                })
            })
            dense2.forEach((a_i,i)=>{
                d3.select("#lin_dense2_"+i.toString())
                .style("fill",d=>{ d.value = a_i; return color(a_i)});
                dense3.forEach((a_j,j)=>{
                    d3.select("#nn_link_"+(dense2StartId+i).toString()+'_'+(dense3StartId+j).toString())
                    .style("stroke",color(a_i/2+a_j/2));
                })
            })
            dense3.forEach((a_i,i)=>{
                d3.select("#lin_dense3_"+i.toString())
                .style("fill",d=>{ d.value = a_i; return color(a_i)});
            })



        })
    }
    if (modelSelected == 'mlp'){
        d3.json(path,(preds)=>{
            const pred = preds.filter(d=>d.id==pointId);
            const dense1 = (datasetSelected == 'test_laptop')? pred.dense_44: pred.dense_4;
            const dense2 = (datasetSelected == 'test_laptop')? pred.dense_45: pred.dense_5;
            const dense3 = (datasetSelected == 'test_laptop')? pred.dense_46: pred.dense_6;
            const input = pred.input;

            d3.selectAll(".neuron")
              .on("mouseover",d=>{
                div.transition().duration(200).style('opacity', 1)
                .style('left', (d3.event.pageX-600) + 'px')
                .style('top', (d3.event.pageY) + 'px');

                div.html(`<h6>${d.value}</h6>`)

              })
            
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
                d3.select("#lin_dense3_"+i.toString())
                .style("fill",d=>{ d.value = a_i; return color(a_i)});
            })
        })
    }
    if (modelSelected == 'cnn'){
        d3.json(path,(preds)=>{
            const pred = preds.filter(d=>d.id==pointId)[0];
            color.domain([1,0])
            const keys = Object.keys(pred);
            var layerName2idxMapping;
            if (datasetSelected == 'test_laptop'){  
                layerName2idxMapping = {'input':'0','conv2d_3':'1','max_pooling2d_3':'2','conv2d_4':'3','max_pooling2d_4':'4'};
            }
            else{
                layerName2idxMapping = {'input':'0','conv2d_1':'1','max_pooling2d_1':'2','conv2d_2':'3','max_pooling2d_2':'4'};
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
                                .style('top', (d3.event.pageY) + 'px');
                
                                div.html(`<h6>${d.value}</h6>`)
                              });
                        }
                    })
                }
            }

            color.domain([1,0])
            for(var i=0; i < 4;i++){
                d3.select("#pred_"+i.toString())
                    .style("fill",d=>{
                        d.value = pred["prediction"][i];
                        return color(pred["prediction"][i]);
                    })
                    .on("mouseover",(d)=>{
                        div.transition().duration(200).style('opacity', 1)
                        .style('left', (d3.event.pageX-600) + 'px')
                        .style('top', (d3.event.pageY) + 'px');

                        div.html(`<h6>${d.value}</h6>`);
                      });
            }


        })
    }
}