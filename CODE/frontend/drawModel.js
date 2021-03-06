var modelSelected;

function LoadModel(fileName, datasetSelected){

    document.getElementById("embedding-check").disabled = false;
    modelSelected = fileName.split('_')[0];
    
    // load the data
    d3.json(fileName + ".json", function(error, graph) {


        if (fileName == 'lin' || fileName == 'mlp'){

             // set the dimensions and margins of the graph
            var margin = {top: 50, right: 20, bottom: 0, left: 50};
            var width = 2000 - margin.left - margin.right;
            var height = 600 - margin.top - margin.bottom;

            d3.select("#mlp").selectAll("svg").remove();

            // append the svg object to the body of the page
            var svg = d3.select("#mlp").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform", 
                    "translate(" + margin.left + "," + margin.top + ")");
                    
            var nodes = graph.nodes;
            nodes = nodes.sort((a,b)=>(a.id-b.id));
            var depthsStr = d3.map(nodes, d=>d.depth).keys();
            let depths = [...new Set(nodes.map(d=>d.depth))];

            var listofX = [];
            depthsStr.forEach(depth=>{
                var nodes_of_depth = nodes.filter(d=> d.depth == parseInt(depth));
                if (parseInt(depth) >= 2){
                    var x = d3.scaleLinear()
                            .domain(d3.extent(nodes_of_depth,d=>d.index))
                            .range([width/4,3*width/4]);
                }
                else{
                    var x = d3.scaleLinear()
                            .domain(d3.extent(nodes_of_depth,d=>d.index))
                            .range([0,width]);
                }
                listofX[depth] = x;
            })

            var y = d3.scaleBand()
                    .domain(depths)
                    .range([0,height]);
            
            var node = svg.append("g").selectAll(".node")
                        .data(graph.nodes)
                    .enter().append("circle")
                    .attr("class","neuron")
                    .attr("id", d=>nameNeuron(d,modelSelected))
                    .attr("r", d=> (d.depth <= 1)? listofX[d.depth.toString()](1)/2 - listofX[d.depth.toString()](0)/2:5)
                    .attr("cx",d=> listofX[d.depth.toString()](d.index))
                    .attr("cy",d=>y(d.depth))
                    .style("fill", "grey")
        

            // add in the links
            var link = svg.append("g").selectAll(".link")
                        .data(graph.links)
                        .enter().append("path")
                        .attr("class", "link")
                        .attr("id",d=>"nn_link_"+d.source+"_"+d.target)
                        .attr("d", d=>{
                            var curvature = .9;
                            var depth_of_source = nodes[d.source].depth;
                            var depth_of_target = nodes[d.target].depth;
                            var index_of_source = nodes[d.source].index;
                            var index_of_target = nodes[d.target].index;
                            var x0 = listofX[depth_of_source](index_of_source);
                            var y0 = y(depth_of_source);
                            var x1 = listofX[depth_of_target](index_of_target);
                            var y1 = y(depth_of_target);
                            var xi = d3.interpolateNumber(x0, x1);
                            var x2 = xi(curvature);
                            var x3 = xi(1 - curvature);
                            return "M" + x0 + "," + y0
                                    + "C" + x2 + "," + y0
                                    + " " + x3 + "," + y1
                                    + " " + x1 + "," + y1;
                        })
            
            var layerNames = svg.append("g")
                                .selectAll(".text")
                                .data([0,1,2,3])
                                .enter()
                                .append("text")
                                .attr("transform",d=>"translate(20,"+(y(d)-10)+")")
                                .attr("font-size",20)
                                .text(d=>{
                                    switch (d){
                                        case 0:
                                            return "input";
                                        case 1:
                                            return "dense_1";
                                        case 2:
                                            return "dense_2";
                                        case 3:
                                            return "dense_3";
                                    }
                                })
        }
        if (fileName == 'cnn'){

            // set the dimensions and margins of the graph
            var margin = {top: 50, right: 20, bottom: 0, left: 50};
            var width = 2000 - margin.left - margin.right;
            var height = 350 - margin.top - margin.bottom;

            d3.select("#cnn").selectAll("svg").remove();

            // append the svg object to the body of the page
            var svg = d3.select("#cnn").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform", 
                    "translate(" + margin.left + "," + margin.top + ")");

            var depths = [...new Set(graph.nodes.map(d=>d.index))];
            depths.push(5);
            var x = d3.scaleBand()
                      .domain(depths)
                      .range([0,width])
            console.log(x.domain())

            var neurons = svg.append("g").selectAll(".node")
                        .data(graph.nodes)
                        .enter().append("g")
                        .attr("id", (d,i)=>i.toString())
                        .attr("transform",d=>"translate("+x(d.index)+",0)");
            
            var rects = neurons.selectAll(".rect")
                        .data(d=>d.fm)
                        .enter().append('rect')
                        .attr('id', (d,i)=>"layer_"+d.i.toString()+"_"+d.y.toString()+"_"+d.x.toString())
                        .attr('width', x.bandwidth()/64*1.5)
                        .attr('height', x.bandwidth()/48*1.5)
                        .attr('x',d=>d.x*x.bandwidth()/64*1.5)
                        .attr('y',d=>d.y*x.bandwidth()/48*1.5)
                        .style("fill","grey");
            
            var finalLayerInput = [
                {'index':0,'value':0},
                {'index':1,'value':0},
                {'index':2,'value':0},
                {'index':3,'value':0},
            ]
            svg.append("g")
                .selectAll(".rect")
                .data(finalLayerInput)
                .enter()
                .append("rect")
                .attr("id",d=>"pred_"+d.index.toString())
                .attr("x", x(5))
                .attr("y", d=>d.index*75)
                .attr('width', 30)
                .attr('height', 30)
                .style("fill","grey");
            
            var layerNames = svg.append("g")
                .selectAll(".text")
                .data([0,1,2,3,4,5])
                .enter()
                .append("text")
                .attr("transform",d=>"translate("+x(d)+",-5)")
                .attr("font-size",30)
                .text(d=>{
                    switch (d){
                        case 0:
                            return "input";
                        case 1:
                            return "conv2d";
                        case 2:
                            return "maxpool2d";
                        case 3:
                            return "conv2d";
                        case 4:
                            return "maxpool2d";
                        case 5:
                            return "dense";
                    }
                })
        }
    })
}

function nameNeuron(d,modelSelected,datasetSelected){
    if (modelSelected == 'lin'){
        switch (d.depth){
            case 0:
                return "lin_input_" + d.index.toString();
            case 1:
                return "lin_dense1_" + d.index.toString();
            case 2:
                return "lin_dense2_" + d.index.toString();
            case 3:
                return "lin_dense3_" + d.index.toString();
        }
    }
    if (modelSelected == 'mlp'){
        switch (d.depth){
            case 0:
                return "mlp_input_" + d.index.toString();
            case 1:
                return "mlp_dense1_" + d.index.toString();
            case 2:
                return "mlp_dense2_" + d.index.toString();
            case 3:
                return "mlp_dense3_" + d.index.toString();
        }
    }
    
}