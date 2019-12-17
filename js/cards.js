var CITY_LIST = ['beijing','guangzhou','shanghai','haikou'];
var remove_city_line = [];
function deepclone(obj) {
  var _obj = JSON.stringify(obj),
      objClone = JSON.parse(_obj);
  return objClone;
}
function getAQIlevel(AQI){
    if (AQI <= 50) {
        return 1;
    }
    else if (AQI <= 100){
        return 2;
    }
    else if (AQI <= 150) {
        return 3;
    }
    else if (AQI <= 200) {
        return 4;
    }
    else if (AQI <= 300) {
        return 5;
    }
    else
        return 6;
}
function getHeatMapData(origin_data){
    data = deepclone(origin_data);
    for (var i = 0; i < data.length; i++) {
      if (data[i].price == 0) {
        data[i].AQI = data[i - 1].AQI;
      }
    }
    for (var i = 0; i < data.length; i++) {
        var tmp = data[i].date.split("-");
        data[i].month = (parseInt(tmp[0]) - 2018) * 12 + parseInt(tmp[1]);
        data[i].day = parseInt(tmp[2]);
        data[i].level = getAQIlevel(data[i].AQI);
    }
    // console.log(data);
    // 加个头，方便显示
    // console.log(data);
    return data;
}
function heatmap(dataset_path="data/guangzhou.csv",svg_id = "svg2", class_id = "guangzhou_card",city_color='steelblue',city_name='广州')
{
    var margin = { top: 30, right: 0, bottom: 100, left: 50 },
    width = 300 - margin.left - margin.right,
    height = 320 - margin.top - margin.bottom,
    gridSize = 8,
    legendElementWidth = gridSize*2,
    buckets = 6,
    // colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"], // alternatively colorbrewer.YlGnBu[9]
    colors = ["rgb(67,206,23)","rgb(239,220,49)","rgb(255,170,0)","rgb(255,64,26)","rgb(210,0,64)","rgb(109,51,113)"]
    colors_white = "white";
    months = ["2018-01","2018-02","2018-03","2018-04","2018-05","2018-06","2018-07","2018-08","2018-09","2018-10","2018-11","2018-12","2019-01","2019-02","2019-03","2019-04","2019-05","2019-06","2019-07","2019-08","2019-09","2019-10","2019-11","2019-12"],
    days = ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31"];
    datasets = [dataset_path];
    var svg = d3.select("#"+svg_id).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var dayLabels = svg.selectAll(".dayLabel")
    .data(months)
    .enter().append("text")
    .text(function (d) { return d; })
    .attr("x", 0)
    .attr("y", function (d, i) { return i * gridSize; })
    .attr("font-size", "7.5px")
    .style("text-anchor", "end")
    .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
    // .attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"); });

    var timeLabels = svg.selectAll(".timeLabel")
    .data(days)
    .enter().append("text")
    .text(function(d) { return d; })
    .attr("x", function(d, i) { return i * gridSize; })
    .attr("y", 0)
    .style("text-anchor", "middle")
    .attr("font-size", "5px")
    .attr("transform", "translate(" + gridSize / 2 + ", -6)")
    // .attr("class", function(d, i) { return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });

    var heatmapChart = function(csvFile) {
        d3.csv(csvFile).then(
            function(origin_data) {
                data = getHeatMapData(origin_data);

                console.log(data);
                var colorScale = d3.scaleQuantile()
                .domain([0, buckets - 1, d3.max(data, function (d) { return d.level; })])
                .range(colors);
                

                var cards = svg.selectAll(".hour")
                .data(data, function(d) {return d.month+':'+d.day;})
                .enter().append("rect")
                .attr("x", function(d) { return (d.day - 1) * gridSize; })
                .attr("y", function(d) { return (d.month - 1) * gridSize; })
                .attr("rx", 4)
                .attr("ry", 4)
                .attr("class", class_id)
                .attr("width", gridSize)
                .attr("height", gridSize)
                .style("fill", colors_white);

                cards.append("title");


    cards.transition().duration(1000)
    .style("fill", function(d) { return colors[d.level - 1]; });

    cards.select("title").text(function(d) { return d.AQI; });

    var rect = svg.append("rect")
            .attr("x",36)
            .attr("y",200)
            .attr("rx", 10)
            .attr("ry", 10)
            .attr("class", class_id)
            // .attr("class", class_id)
            .attr("width", gridSize * 5)
            .attr("height", gridSize * 5)
            .attr("opacity",1)
            .style("fill", city_color);
    svg.append("text").text(city_name)
        .attr("x", 150)
        .attr("y", 235)
        .style("text-anchor", "middle")
        .attr("font-size", "40px")

    rect.on("click",function(){
        console.log(d3.select(this).attr("opacity"));
        class_name = d3.select(this).attr('class');
        if (d3.select(this).attr("opacity") == 1) {
            d3.select(this).attr("opacity",0.2);
            remove_city_line.push(class_name.split('_')[0] + "_line");
        }
        else{
            d3.select(this).attr("opacity",1);
            for (var i = 0; i < remove_city_line.length; i++) {
                if (remove_city_line[i] == class_name.split('_')[0] + "_line") {
                    remove_city_line.splice(i,1);
                }
            }
        }
        d3.selectAll('.line')
            .attr("opacity",0.5);
        for (var i = 0; i < remove_city_line.length; i++) {
            d3.selectAll("#" + remove_city_line[i])
                .attr("opacity",0);
        }
    })



    svg.selectAll("rect").on("mouseover", function (){
        class_name = d3.select(this).attr('class');
        // console.log();
        d3.selectAll('.line')
            .attr("opacity",0.2);

        for (var i = 0; i < remove_city_line.length; i++) {
            d3.selectAll("#" + remove_city_line[i])
                .attr("opacity",0);
        }

        d3.selectAll("#" + class_name.split('_')[0] + "_line")
        .attr("opacity",1);
        // console.log(d3.selectAll("#haikou_line"))
    })
    .on("mouseout", function () {
        d3.selectAll('.line')
            .attr("opacity",0.5);
        for (var i = 0; i < remove_city_line.length; i++) {
            d3.selectAll("#" + remove_city_line[i])
                .attr("opacity",0);
        }
        // d3.selectAll("#" + class_name.split('_')[0] + "_line")
        // .attr("opacity",0.5);
    })

    cards.exit().remove();
        // console.log(rect);
    // var legend = svg.selectAll(".legend")
    // .data([0].concat(colorScale.quantiles()), function(d) { return d; });

    // legend.enter().append("g")
    // .attr("class", "legend");

    // legend.append("rect")
    // .attr("x", function(d, i) { return legendElementWidth * i; })
    // .attr("y", height)
    // .attr("width", legendElementWidth)
    // .attr("height", gridSize / 2)
    // .style("fill", function(d, i) { return colors[i]; });

    // legend.append("text")
    // .attr("class", "mono")
    // .text(function(d) { return "≥ " + Math.round(d); })
    // .attr("x", function(d, i) { return legendElementWidth * i; })
    // .attr("y", height + gridSize);

    // legend.exit().remove();

    });  
    };

    heatmapChart(datasets[0]);

    // var datasetpicker = d3.select("#dataset-picker").selectAll(".dataset-button")
    // .data(datasets);

    // datasetpicker.enter()
    // .append("input")
    // .attr("value", function(d){ return "Dataset " + d })
    // .attr("type", "button")
    // .attr("class", "dataset-button")
    // .on("click", function(d) {
    // heatmapChart(d);
    // });

}


heatmap("data/beijing.csv","svg2","beijing_card","steelblue","北京");
heatmap("data/shanghai.csv","svg3","shanghai_card","green","上海");
heatmap("data/guangzhou.csv","svg4","guangzhou_card","purple","广州");
heatmap("data/haikou.csv","svg5","haikou_card","orange","海口");
