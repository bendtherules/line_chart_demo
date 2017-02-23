
var all_data_points = []

// all_data_points = [ [[x1,y1],[x2,y2],[another point]], [another chart] ]

// gather all data
d3.selectAll("line-chart").each( function () {
    var ele = d3.select(this)
    all_data_points.push(JSON.parse(ele.attr("data-points")))
})


// ele_line_chart.append(".chart-clean-box").style({"padding":0}).node().getBoundingClientRect()

var list_ele_clean_box = d3.selectAll("line-chart").append("div").classed("chart-clean-box",true).attr("padding",0).data(all_data_points)

list_ele_clean_box.each( function (data_chart, index_chart) {
	var ele_chart = d3.select(this);
	var bbox = this.getBoundingClientRect();

	ele_chart.data(data_chart).append("svg").width(bbox.width).height(bbox.height)
})