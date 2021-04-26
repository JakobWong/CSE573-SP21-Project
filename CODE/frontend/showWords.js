function showWords(data, modelSelected, isRenderCorrectness){
    data.forEach(d=>{
        d.value = (isRenderCorrectness)? ((d.label==d.pred)?1:0):d.label;
    })

    var len_data = d3.map(data, d=>d.word).keys().length;
    var height = len_data * 40;
    var margin = {top: 0, right: 0, bottom: 50, left: 10};
    var width = 250 - margin.left - margin.right;
    height = (height>400)? height - margin.top - margin.bottom: 400-margin.top - margin.bottom;

    d3.select("#word_list").selectAll("svg").remove()
    var svg = d3.select("#word_list")
                .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                .append("g")
                    .attr("transform",
                        "translate(" + margin.left + "," + margin.top + ")");

    if (isRenderCorrectness){
        var color = d3.scaleOrdinal()
                      .domain([0,1])
                      .range([d3.schemeCategory10[3],d3.schemeCategory10[2]]);
    }
    else{
        var color = d3.scaleOrdinal(["#1f77b4","#ff7f0e","#9467bd","#E56AB3"])
                        .domain([0,1,2,3]);
    }

    var words = data.map(d=>d.word);
    var wordFreq = wordFrequency(words);
    let wordsUnique = [...new Set(words)];
    
    var y = d3.scaleBand()
            //   .domain(wordFreq.map(d=>d.key))     // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
            .domain(wordFreq.map(d=>d.key))  
            .range([height, 0])
            .padding(0.2);

    var x = d3.scaleBand()
              .domain([...Array(d3.max(wordFreq,d=>d.value)).keys()])
              .range([0, width])
              .padding(0.05);

    
    // x.domain([0, d3.max(wordFreq, d=>d.value)]);   // d3.hist has to be called before the Y axis obviously

    var wordMatrix = {};
    wordsUnique.forEach(word=>{
        wordMatrix[word] = [];
    })  
    data.forEach(d=>{  
        wordMatrix[d.word].push(d);
    })
    var inputData = [];

    wordsUnique.forEach(word=>{
        wordMatrix[word] = wordMatrix[word].sort((a,b)=>a.value - b.value); 
        wordMatrix[word].forEach((d,i)=>{
            inputData.push({"value":d.value,"word":d.word,"i":i});
        })
    });
    inputData = inputData.sort((a,b)=>a.value-b.value);

    svg.append("g")
       .selectAll(".rect")
       .data(inputData)
       .enter().append("rect")
       .attr("height",y.bandwidth())
       .attr("width",x.bandwidth())
       .attr("y",d=>y(d.word))
       .attr('x',d=>x(d.i))
       .style('fill',d=>color(d.value))
       .attr('opacity',.3)

    var yAxis = svg.append("g")
            .attr("transform","translate(-7,0)")
            .call(d3.axisRight(y));
    yAxis.select(".domain").remove();
    yAxis.attr("font-size", "20px");
    
    
}

function wordFrequency(words){
    let uniqueWords = [...new Set(words)];
    var wordFrequency = {};
    uniqueWords.forEach(word =>{
        wordFrequency[word] = 0;
    })
    words.forEach(word => {
        wordFrequency[word] += 1;
    })
    wordFrequency = d3.entries(wordFrequency);
    wordFrequency.sort((a,b) => a.value - b.value);
    return wordFrequency;
}