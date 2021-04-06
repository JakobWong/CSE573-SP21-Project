function renderClassificationResults(datasetSelected,modelSelected){
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
    d3.json(datasetSelected+".json", function(data) {
  
      // Add X axis
      var x = d3.scaleBand()
        .domain(d3.map(data, d=>d.j).keys())
        .range([ 0, width ])
        .padding(0.05);
  
      // Add Y axis
      var y = d3.scaleBand()
        .domain(d3.map(data, d=>d.i).keys())
        .range([ height, 0]);
  
      var height_by_num_dps = d3.scaleLinear()
                              .domain(d3.extent(data, d=>d.numberOfDataPoints))
                              .range([0.5,1])
  
      var color = d3.scaleOrdinal(d3.schemeCategory10)
                    .domain([0,1,2,3]);
  
      // add the squares
      container.selectAll()
              .data(data)
              .enter()
              .append("g")
              .attr("id",d => `cell_${d.i}_${d.j}`)
              .attr("transform", d=>`translate(${x(d.j.toString())},${y(d.i.toString())})`)
              .on("mouseover",d=>{
                    div
                    .transition().duration(200).style('opacity', 1)
                    .style('left', (d3.event.pageX+10) + 'px')
                    .style('top', (d3.event.pageY+10) + 'px')
      
                    var numCorrect = d.dataPoints.filter(dd=>dd.label==dd.modelSelected).length;
                    var numIncorrect = d.dataPoints.filter(dd=>dd.label!=dd.modelSelected).length;
                    var percentCorrect = numCorrect / (numIncorrect+numCorrect);
                    var percentIncorrect = numIncorrect / (numIncorrect+numCorrect);

                    
                    div.html(
                      `<div>`+
                      `<div class='box' style="background-color:${color(0)}"></div>`+
                      `${numCorrect}(${percentCorrect.toFixed(1)*100}\%)<br>`+
                      `<div class='box' style="background-color:${color(1)}"></div>`+
                      `${numIncorrect}(${percentIncorrect.toFixed(1)*100}\%)`+
                      `</div>`
              )})
              .on("click", d => {
                showCellDetail(d.dataPoints);
                showCellPredictions(d.dataPoints, modelSelected);
                showWords(d.dataPoints);
              })
              .call(drag);
      
          data.forEach(d => {
            var labelDistribution = d.labelDistribution;
            labelDistribution = labelDistribution.map(dd=>Math.round(dd*100));
            var list_of_rect = [];
            var numberOfClasses = labelDistribution.length;
  
            var cnt = 0;
            labelDistribution.forEach((dd,label)=>{
              for(var j = 0; j < dd; j++){
                var index = Math.floor(cnt / 10) + cnt % 10;
                list_of_rect.push({'label':label,'x':cnt % 10,'y':Math.floor(cnt / 10)});
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
              .style("fill", dd => color(dd.label));
  
          })
    })
  
    function argMax(array) {
      return array.map((x, i) => [x, i]).reduce((r, a) => (a[0] > r[0] ? a : r))[1];
    }
    
    function cellTooltipCalled(cell, tooltipSvg){
    
      tooltipSvg.selectAll("g").remove();
    
      var g = tooltipSvg.append("g")
      var tooltipData = cell.dataPoints;
    
      var labels = tooltipData.map(d=>d.label);
      let classes = [...new Set(labels)];
      classes.sort();
      
      var x = d3.scaleLinear()
                .domain(classes) 
                .range([0, 100]);
    
      var histogram = d3.histogram()
                        .value(d=>d.label.toString())   // I need to give the vector of value
                        .domain(x.domain())  // then the domain of the graphic
                        .thresholds(x.ticks(classes.length)); // then the numbers of bins
    
      tooltipSvg.append("g")
          .attr("transform", "translate(0,30)")
          .call(d3.axisBottom(x));
    
      // And apply this function to data to get the bins
      var bins = histogram(tooltipData);
    
      // Y axis: scale and draw:
      var y = d3.scaleLinear()
                .range([30, 0]);
      y.domain([0, d3.max(bins, d => d.length)]);   // d3.hist has to be called before the Y axis obviously
      tooltipSvg.append("g")
          .call(d3.axisLeft(y));
    
      console.log(bins)
    
      // append the bar rectangles to the svg element
      g.selectAll("rect")
         .data(bins)
         .enter()
          .append("rect")
          .attr("x", 1)
          .attr("transform", d => "translate(" + x(d.x0) + "," + y(d.length) + ")")
          .attr("width", d => x(d.x1) - x(d.x0) -1 )
          .attr("height", d =>  30 - y(d.length))
          .style("fill", "#69b3a2")
      
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
  }