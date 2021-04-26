function showCellDetail(data, modelSelected, isRenderCorrectness){
    var margin = {top: 20, right: 20, bottom: 20, left: 20},
    width = 250 - margin.left - margin.right,
    height = 250 - margin.top - margin.bottom;

    console.log(data);
    data.forEach(d=>{
        d.value = (isRenderCorrectness)? ((d.label==d.pred)?1:0):d.label;
    })

    d3.select("#cell_detail").selectAll("svg").remove();
    d3.select("#cell_tooltip").remove();


    var svg = d3.select("#cell_detail")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform","translate(" + margin.left + "," + margin.top + ")");
    
    var div = d3.select("#cell_detail")
                .append("div")	
                .attr("class", "tooltip")			
                .attr("id","cell_tooltip")	
                .style("opacity", 0)

    // Add X axis
    var x = d3.scaleLinear()
            .domain(d3.extent(data, d=>d.x))
            .range([ 0, width]);
    var y = d3.scaleLinear()
            .domain(d3.extent(data, d=>d.y))
            .range([ height, 0]);
    // Add dots
    if (isRenderCorrectness){
        var color = d3.scaleOrdinal()
                        .domain([0,1])
                        .range([d3.schemeCategory10[3],d3.schemeCategory10[2]]);
    }
    else{
        var color = d3.scaleOrdinal(["#1f77b4","#ff7f0e","#9467bd","#E56AB3"])
                        .domain([0,1,2,3]);
    }

    svg.append('g')
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("id",d=>"c_"+d.id)
        .attr("cx", d=>x(d.x))
        .attr("cy", d=>y(d.y))
        .attr("r", 4)
        .style("fill", d => color(d.value))
        .style("opacity",0.5)
        .on("mouseover",(d)=>{
            d3.select("#c_"+d.id)
              .attr("r",8);
              
            div.transition().duration(200).style('opacity', 1)
                .style('left', (d3.event.pageX) + 'px')
                .style('top', (d3.event.pageY-550) + 'px');

            div.html(
                `<h5>${d.word}</h5>`
            )
        })
        .on("mouseout",(d)=>{
            d3.select("#c_"+d.id)
                .attr("r",4);
        })
        .on("click",d=>{
            renderNeuronActivations(d, datasetSelected, 'cnn', isRenderCorrectness);
            renderNeuronActivations(d, datasetSelected, 'mlp', isRenderCorrectness);

        })
}