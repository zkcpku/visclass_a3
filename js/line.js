var svg = d3.select("#svg1");
var margin = {top: 20, right: 20, bottom: 110, left: 40};
var margin2 = {top: 330, right: 20, bottom: 30, left: 40};
var default_opacity = 0.5;
console.log(svg.attr("width"));
var width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    height2 = +svg.attr("height") - margin2.top - margin2.bottom;

var parseDate = d3.timeParse("%b %Y");

var x = d3.scaleTime().range([0, width]),
    x2 = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    y2 = d3.scaleLinear().range([height2, 0]);

var xAxis = d3.axisBottom(x),
    xAxis2 = d3.axisBottom(x2),
    yAxis = d3.axisLeft(y);

var brush = d3.brushX()
    .extent([[0, 0], [width, height2]])
    .on("brush end", brushed);

var zoom = d3.zoom()
    .scaleExtent([1, Infinity])
    .translateExtent([[0, 0], [width, height]])
    .extent([[0, 0], [width, height]])
    .on("zoom", zoomed);

var line = d3.line()
    // .interpolate("linear")
    .x(function(d) { return x(new Date(d.date)); })
    .y(function(d) { return y(parseFloat(d.price)); })
    // .curve(d3.curveStep);

var line2 = d3.line()
    // .interpolate("linear")
    .x(function(d) { return x2(new Date(d.date)); })
    .y(function(d) { return y2(parseFloat(d.price)); })

// var area = d3.area()
//     .curve(d3.curveMonotoneX)
//     .x(function(d) { return x(new Date(d.date)); })
//     .y0(function(d) { return y(parseFloat(d.price)) - 1; })
//     .y1(function(d) { return y(parseFloat(d.price)); });

// var area2 = d3.area()
//     .curve(d3.curveMonotoneX)
//     .x(function(d) { return x2(new Date(d.date)); })
//     .y0(function(d) { return y2(parseFloat(d.price)) - 1; })
//     .y1(function(d) { return y2(parseFloat(d.price)); });

svg.append("defs").append("clipPath")
    .attr("id", "clip")
  .append("rect")
    .attr("width", width)
    .attr("height", height);

var focus = svg.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var context = svg.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

// d3.csv("data/test_data.csv", type, function(error, data) {
function brushed() {
  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
  var s = d3.event.selection || x2.range();
  x.domain(s.map(x2.invert, x2));
  focus.selectAll(".line").attr("d", line);
  focus.select(".axis--x").call(xAxis);
  svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
      .scale(width / (s[1] - s[0]))
      .translate(-s[0], 0));
}

function zoomed() {
  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
  var t = d3.event.transform;
  x.domain(t.rescaleX(x2).domain());
  focus.selectAll(".line").attr("d", line);
  focus.select(".axis--x").call(xAxis);
  context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
}

function type(d) {
  d.date = parseDate(d.date);
  d.price = +d.price;
  return d;
}


function add_data(data, data_index, color = "rgb(23,118,182)"){
  focus.append("path")
      .attr("id",String(data_index))
      .datum(data)
      .attr("class", "line")
      .attr("d", line)
      .attr("opacity",function(){
        if (remove_city_line.indexOf(data_index) != -1) {
          return 0;
        }
        else
          return default_opacity;
      })
      .attr("stroke",color);

  context.append("path")
      .attr("id",String(data_index))
      .datum(data)
      .attr("class", "line")
      .attr("d", line2)
      .attr("opacity",function(){
        if (remove_city_line.indexOf(data_index) != -1) {
          return 0;
        }
        else
          return default_opacity;
      })
      .attr("stroke",color);
}
function init_data(data, data_index, color = "rgb(23,118,182)"){
  x.domain(d3.extent(data, function(d) { return new Date(d.date); }));

  y.domain([0, d3.max(data, function(d) { return parseFloat(d.price); })]);
  x2.domain(x.domain());
  y2.domain(y.domain());

  focus.append("path")
      .attr("id",String(data_index))
      .datum(data)
      .attr("class", "line")
      .attr("d", line)
      .attr("opacity",default_opacity)
      .attr("stroke",color);

  context.append("path")
      .attr("id",String(data_index))
      .datum(data)
      .attr("class", "line")
      .attr("d", line2)
      .attr("opacity",default_opacity)
      .attr("stroke",color);

  focus.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  focus.append("g")
      .attr("class", "axis axis--y")
      .call(yAxis);

  context.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height2 + ")")
      .call(xAxis2);

  context.append("g")
      .attr("class", "brush")
      .call(brush)
      .call(brush.move, x.range());

  svg.append("rect")
      .attr("class", "zoom")
      .attr("width", width)
      .attr("height", height)
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .call(zoom);
}
function remove_data(data_index){
  context.selectAll("#" + data_index).remove();
  focus.selectAll("#" + data_index).remove();
}
function deepclone(obj) {
  var _obj = JSON.stringify(obj),
      objClone = JSON.parse(_obj);
  return objClone;
}
function getData(origin_data,smooth = 0,type = "AQI") {
  console.log(type);
  if (type == "AQI") {
    data = deepclone(origin_data);
    for (var i = 0; i < data.length; i++) {
      data[i].price = data[i].AQI;
    }
    // 加个头，方便显示
    head = deepclone(data[0]);
    head.date = new Date(head.date) - 24*60*60*1000;
    data.unshift(head);
    // console.log(data);
    for (var i = 0; i < data.length; i++) {
      if (data[i].price == 0) {
        data[i].price = data[i - 1].price;
      }
    }
    var last_v = parseFloat(data[0].price);
    for (var i = 0; i < data.length; i++) {
      data[i].price = last_v * smooth + (1 - smooth) * parseFloat(data[i].price);
      last_v = data[i].price;
    }
    return data;
  }
  
}
function main(smooth = 0){
  d3.csv("data/beijing.csv").then(function(origin_data)  {

    data = getData(origin_data,smooth);

    init_data(data, "beijing_line","rgb(23,118,182)");
  });

  d3.csv("data/guangzhou.csv").then(function(origin_data)  {
    data = getData(origin_data,smooth);
    add_data(data, "guangzhou_line","rgb(149,100,191)");
  });

  d3.csv("data/shanghai.csv").then(function(origin_data)  {
    data = getData(origin_data,smooth);
    add_data(data, "shanghai_line","rgb(36,162,33)");
  });
  d3.csv("data/haikou.csv").then(function(origin_data)  {
    data = getData(origin_data,smooth);
    add_data(data, "haikou_line","rgb(115,67,9)");
  });
}

main();

function change_smooth(smooth){
  remove_data("beijing_line");
  remove_data("guangzhou_line");
  remove_data("shanghai_line");
  remove_data("haikou_line");
  d3.csv("data/beijing.csv").then(function(origin_data)  {
    data = getData(origin_data,smooth);
    add_data(data, "beijing_line","rgb(23,118,182)");
  });
  d3.csv("data/guangzhou.csv").then(function(origin_data)  {
    data = getData(origin_data,smooth);
    add_data(data, "guangzhou_line","rgb(149,100,191)");
  });

  d3.csv("data/shanghai.csv").then(function(origin_data)  {
    data = getData(origin_data,smooth);
    add_data(data, "shanghai_line","rgb(36,162,33)");
  });
  d3.csv("data/haikou.csv").then(function(origin_data)  {
    data = getData(origin_data,smooth);
    add_data(data, "haikou_line","rgb(115,67,9)");
  });

}