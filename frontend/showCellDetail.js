function showCellDetail(data, modelSelected, isRenderCorrectness){
    var margin = {top: 20, right: 20, bottom: 20, left: 20},
    width = 250 - margin.left - margin.right,
    height = 250 - margin.top - margin.bottom;

    data.forEach(d=>{
        d.value = (isRenderCorrectness)? ((d.label==d[modelSelected])?1:0):d.label;
    })

    d3.select("#cell_detail").selectAll("svg").remove();

    var svg = d3.select("#cell_detail")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform","translate(" + margin.left + "," + margin.top + ")");
    
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
        var color = d3.scaleOrdinal(d3.schemeCategory10)
                        .domain([0,1,2,3]);
    }

    svg.append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d=>x(d.x))
        .attr("cy", d=>y(d.y))
        .attr("r", 4)
        .style("fill", d => color(d.value))
        .style("opacity",0.5)
        .on("click",d=>renderNeuronActivations(d, datasetSelected, modelSelected, isRenderCorrectness))
}