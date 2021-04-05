function showCellPredictions(data, modelName){
    var margin = {top: 20, right: 20, bottom: 30, left: 20},
    width = 250 - margin.left - margin.right,
    height = 250 - margin.top - margin.bottom;

    var resultsByLabel = {};
    data.forEach(d=>{
        var label = d.label;
        if (resultsByLabel[label] == undefined){
            resultsByLabel[label] = {"correct":0,"incorrect":0};
        }
        if (d.label == d[modelName]){
            resultsByLabel[label]['correct'] += 1;
        }
        else{
            resultsByLabel[label]['incorrect'] -= 1;
        }
    })

    resultsByLabel = d3.entries(resultsByLabel);
    resultsByLabel = resultsByLabel.sort((a,b)=> parseInt(a.key) - parseInt(b.key));
    var inputData = [];
    resultsByLabel.forEach(d=>{
        inputData.push({"label":d.key,"correct":d.value.correct,"incorrect":d.value.incorrect})
    })

    //stack the data? --> stack per subgroup
    var stackedData = d3.stack()
                        .keys(['correct','incorrect'])
                        .offset(d3.stackOffsetDiverging)
                        (inputData)

    d3.select("#cell_prediction").selectAll("svg").remove();

    var svg = d3.select("#cell_prediction")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform","translate(" + margin.left + "," + margin.top + ")");
    
    // Add X axis
    var x = d3.scaleBand()
            .domain(d3.map(data,d=>d.label).keys())
            .range([ 0, width])
            .padding(.4);
    
    var y = d3.scaleLinear()
            .range([ height, 0]);

    y.domain([
        d3.min(stackedData, stackMin), 
        d3.max(stackedData, stackMax)
    ]).nice();

    // Add dots
    var color = d3.scaleOrdinal(d3.schemeCategory10)
                  .domain([0,1,2,3]);

    // Show the bars
    svg.append("g")
        .selectAll("g")
        // Enter in the stack data = loop key per key = group per group
        .data(stackedData)
        .enter().append("g")
        // .style("transform", "translate("+x.bandwidth()+",0)")
        .selectAll("rect")
        // enter a second time = loop subgroup per subgroup to add all rectangles
        .data(function(d) { return d; })
        .enter().append("rect")
        .attr("x", function(d) { return x(d.data.label); })
        .attr("y", function(d) { return y(d[1]); })
        .attr("fill", function(d) { return color(d.data.label); })
        .attr("height", function(d) { return y(d[0]) - y(d[1]); })
        .attr("width",x.bandwidth())
        // .attr("transform", "translate("+x.bandwidth()/2+",0)")

    var xAxis = svg.append("g")
                .attr("transform","translate(0,"+y(0)+")")
                // .attr("class","x-axis")
                .call(d3.axisBottom(x));
    xAxis.attr("class","x-axis")
    // svg.append("g")
    //    .call(d3.axisLeft(y));
}

function stackMin(serie) {
	return d3.min(serie, function(d) { return d[0]; });
}

function stackMax(serie) {
	return d3.max(serie, function(d) { return d[1]; });
}