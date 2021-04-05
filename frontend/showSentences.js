function showSentences(data, modelSelected, isRenderCorrectness){
    
    const WORD_HEIGHT = 30;
    const WORD_LENGTH = 100;
    console.log(datasetSelected)

    d3.json('sentences_'+datasetSelected+'.json',(dataset)=>{

            
        console.log(dataset);
        var sentenceIndices = data.map(d=>d.s_i);
        sentenceIndices = [...new Set(sentenceIndices)];

        var dataPointsLinked = dataset.filter(d=>sentenceIndices.includes(d.s_i));

        var maxJ = d3.max(dataPointsLinked, d=>d.s_j);

        var numSentences = sentenceIndices.length;
        var height = numSentences * WORD_HEIGHT;
        var width = maxJ * WORD_LENGTH;

        var margin = {top: 10, right: 10, bottom: 10, left: 10};
        width = (width>2000)? width - margin.left - margin.right: 2000 -margin.left - margin.right;
        height = (height>400)? height - margin.top - margin.bottom: 400-margin.top - margin.bottom;

        var x = d3.scaleBand()
                .domain([...Array(maxJ).keys()])
                .range([0,width])
                .padding(0.2);
        
        dataPointsLinked.forEach(d=>{
            // console.log(d.label, d[modelSelected],d);
            d.value = (isRenderCorrectness)? ((d.label==d[modelSelected])?1:0):d.label;
            d.row = sentenceIndices.filter(i=>i==d.s_i)[0];
        })

        var y = d3.scaleBand()
                .domain(sentenceIndices.sort())
                .range([height, 0])
                .padding(0.2);

        // console.log(dataPointsLinked);
        
        d3.select("#sentence_view").selectAll("svg").remove();

        var svg = d3.select("#sentence_view")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform","translate(" + margin.left + "," + margin.top + ")");
        
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

    // console.log(dataPointsLinked);
    var cells = svg.append('g')
                .selectAll()
                .data(dataPointsLinked)
                .enter()
                .append('g');

    cells.append("rect")
                // .attr("x", d=>x(d.s_j))
                .attr("x", d=>x(d.s_j))
                .attr("y", d=>y(d.row))
                .attr("width", x.bandwidth())
                .attr('height',y.bandwidth())
                .style("fill", d => color(d.value))
                .style("opacity",0.5) 
        
    cells.append("text")
        .attr("x", d=>x(d.s_j))
        .attr("y", d=>y(d.row)+y.bandwidth()/2)
        .attr("dy", ".35em")
        .text(d=>d.word);

    })
    
}