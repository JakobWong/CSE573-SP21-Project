var datasetSelected;
function LoadDataset(fileName, isRenderCorrectness){
  datasetSelected = fileName;
  console.log(datasetSelected);
  // set the dimensions and margins of the graph
  var margin = {top: 10, right: 10, bottom: 10, left: 10},
  width = 500 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;


  var zoom = d3.zoom()
  .scaleExtent([1, 10])
  .on("zoom", zoomed);

  d3.select("#assemble_embedding").selectAll("svg").remove();
  // append the svg object to the body of the page
  var svg = d3.select("#assemble_embedding")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
  .call(zoom);

  var rect = svg.append("rect")
  .attr("width", width)
  .attr("height", height)
  .style("fill", "none")
  .style("pointer-events", "all");

  var container = svg.append("g");
        
  var div = d3.select("#assemble_embedding").append("div")	
        .attr("class", "tooltip")			
        .attr("id","embedding_tooltip")	
        .style("opacity", 0)

  var drag = d3.drag()
        .subject(function (d) { return d; })
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
  //Read the data
  d3.json(fileName+".json", function(data) {

    // Add X axis
    var x = d3.scaleBand()
      .domain(d3.map(data, d=>d.j).keys())
      .range([ 0, width ])
      .padding(0.05);

    // Add Y axis
    var y = d3.scaleBand()
      .domain(d3.map(data, d=>d.i).keys())
      .range([ height, 0]);

    // add the squares
    container.selectAll()
            .data(data)
            .enter()
            .append("g")
            .attr("id",d => `cell_${d.i}_${d.j}`)
            .attr("transform", d=>`translate(${x(d.j.toString())},${y(d.i.toString())})`)
            .on("mouseover",d=>mouseOver(d))
            .on("click", d => {
              showCellDetail(d.dataPoints, modelSelected, isRenderCorrectness);
              showCellPredictions(d.dataPoints, modelSelected, isRenderCorrectness);
              showWords(d.dataPoints, modelSelected, isRenderCorrectness);
              showSentences(d.dataPoints,modelSelected, isRenderCorrectness);
            })
            .call(drag);
    
    renderCell(data, modelSelected, isRenderCorrectness,x,y);
  })

  function renderCell(data,modelSelected,isRenderCorrectness,x){
    data.forEach(d => {
      var targetDistribution;
      var color;
      var height_by_num_dps = d3.scaleLinear()
                                .domain(d3.extent(data, d=>d.numberOfDataPoints))
                                .range([0,1]);

      if (isRenderCorrectness){
        if (modelSelected == "cnn"){
          targetDistribution = d.cnnCorrectnessDistribution;
        }
        if (modelSelected == "lin"){
          targetDistribution = d.linCorrectnessDistribution;
        }
        if (modelSelected == "mlp"){
          targetDistribution = d.mlpCorrectnessDistribution;
        }
        color = d3.scaleOrdinal()
                  .domain([0,1])
                  .range([d3.schemeCategory10[3],d3.schemeCategory10[2]]);
      }
      else{
       targetDistribution = d.labelDistribution;
       color = d3.scaleOrdinal(d3.schemeCategory10)
                        .domain([0,1,2,3])
      }

      targetDistribution = targetDistribution.map(dd=>Math.round(dd*100));
      var list_of_rect = [];

      var cnt = 0;
      targetDistribution.forEach((percentile,i)=>{
        for(var j = 0; j < percentile; j++){
          // var index = Math.floor(cnt / 10) + cnt % 10;
          list_of_rect.push({'value':i,'x':cnt % 10,'y':Math.floor(cnt / 10)});
          cnt += 1;
        }
      })
      // console.log(list_of_rect);

      var cell_size = x.bandwidth() * height_by_num_dps(d.numberOfDataPoints);
      var xx = d3.scaleBand()
                .domain(d3.map(list_of_rect,d=>d.x).keys())
                .range([0,cell_size]);
      
      var yy = d3.scaleBand()
                .domain(d3.map(list_of_rect,d=>d.y).keys())
                .range([0,cell_size])

      d3.select(`#cell_${d.i}_${d.j}`)
        .selectAll(".rect")
        .data(list_of_rect)
        .enter()
        .append('rect')
        // .attr("x", dd => x(dd.i.toString()) + (dd.x-5)* cell_size)
        .attr("x", dd => xx(dd.x.toString()))
        .attr("y", dd => yy(dd.y.toString()))
        .attr("rx", 0)
        .attr("ry", 0)
        .attr("width", cell_size/10)
        .attr("height", cell_size/10)
        .style("fill", dd => color(dd.value));

    })
  }


  function zoomed() {
    const currentTransform = d3.event.transform;
    container.attr("transform", currentTransform);
  }

  function dragstarted(d) {
    d3.event.sourceEvent.stopPropagation();
    d3.select(this).classed("dragging", true);
  }

  function dragged(d) {
    d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
  }

  function dragended(d) {
    d3.select(this).classed("dragging", false);
  }

  function mouseOver(d,isRenderCorrectness){
    div
    .transition().duration(200).style('opacity', 1)
    .style('left', (d3.event.pageX+10) + 'px')
    .style('top', (d3.event.pageY+10) + 'px');

    if (!isRenderCorrectness){

      var color = d3.scaleOrdinal(d3.schemeCategory10)
                    .domain([0,1,2,3]);
      div.selectAll("div").remove();
      div.html(
        `<div>`+
        `<div class='box' style="background-color:${color(0)}"></div>`+
        `${d.dataPoints.filter(dd=>dd.label==0).length}(${d.labelDistribution[0].toFixed(1)*100}\%)<br>`+
        `<div class='box' style="background-color:${color(1)}"></div>`+
        `${d.dataPoints.filter(dd=>dd.label==1).length}(${d.labelDistribution[1].toFixed(1)*100}\%)<br>`+
        `<div class='box' style="background-color:${color(2)}"></div>`+
        `${d.dataPoints.filter(dd=>dd.label==2).length}(${d.labelDistribution[2].toFixed(1)*100}\%)<br>`+
        `<div class='box' style="background-color:${color(3)}"></div>`+
        `${d.dataPoints.filter(dd=>dd.label==3).length}(${d.labelDistribution[3].toFixed(1)*100}\%)`+
        `</div>`)
    }
    else{
      div.selectAll("div").remove();
      var numCorrect = d.dataPoints.filter(dd=>dd.label == dd.modelSelected).length;
      var numIncorrect = d.dataPoints.filter(dd=>dd.label != dd.modelSelected).length;
      var numTotal = numCorrect+numIncorrect;
      color = d3.scaleOrdinal()
      .domain([0,1])
      .range([d3.schemeCategory10[2],d3.schemeCategory10[3]]);
      div.html(
        `<div>`+
        `<div class='box' style="background-color:${color(0)}"></div>`+
        `${numCorrect}(${(numCorrect/numTotal).toFixed(1)*100}\%)<br>`+
        `<div class='box' style="background-color:${color(1)}"></div>`+
        `${numIncorrect}(${(numIncorrect/numTotal).toFixed(1)*100}\%)`
        `</div>`)

    }
    
  }
}