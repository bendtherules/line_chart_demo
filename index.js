
var all_data_points = []

// gather all data
d3.selectAll("line-chart").each( function () {
    var ele = d3.select(this)
    all_data_points.push(JSON.parse(ele.attr("data-points")))
})


// ele_line_chart.append(".chart-clean-box").style({"padding":0}).node().getBoundingClientRect()