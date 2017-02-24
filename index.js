
var all_data_points = []; // all_data_points = [ [[x1,y1],[x2,y2],[another point]], [another chart] ]

var axisTickPadding = 25;
var axisLabelPadding = 25;
var axisPadding = axisTickPadding + axisLabelPadding;

// gather all data
d3.selectAll("line-chart").each( function () {
    var ele = d3.select(this)
    all_data_points.push(JSON.parse(ele.attr("data-points")))
})

var list_line_chart = d3.selectAll("line-chart").data(all_data_points)

// create each chart
list_line_chart.each( function (data_chart, index_chart) {
	var ele_chart = d3.select(this);

    // decide height to set
	var parent_bbox = this.parentNode.getBoundingClientRect();
    var parent_width = parent_bbox.width;
    var parent_height = parent_bbox.height;
    if (parent_width === 0 && parent_height === 0)
    {
        parent_width = 450
        parent_height = 300
    }
    else
    {
        if (parent_width === 0)
        {
            parent_width = parent_height*1.5;   
        }
        if (parent_height === 0)
        {
            parent_height = parent_width/1.5;   
        }
    }

    var drawing_width = parent_width - axisPadding;
    var drawing_height =  parent_height - axisPadding;

    // prepare scales
    var xscale = d3.scaleLinear().
    // set domain with an immediately invoked function
    domain(function (arr_point) {
        var max_val = d3.max(arr_point,function (point) {
            return point[0];
        }) * 1.1;
        var min_val = 0;
        return [min_val,max_val];
    }(data_chart)).
    range([0,drawing_width])

    var yscale = d3.scaleLinear().
    domain(function (arr_point) {
        var max_val = d3.max(arr_point,function (point) {
            return point[1];
        }) * 1.1;
        var min_val = 0;
        return [min_val,max_val];
    }(data_chart)).
    range([drawing_height,0])

	var ele_svg = ele_chart.append("svg").attr("width",parent_width).attr("height",parent_height);

	var ele_drawingArea = ele_svg.append("g").
		attr("width",drawing_width).attr("height",drawing_height).
		attr("transform","translate("+axisPadding+",0)")

	// draw the lines
    var arr_ele_lines = ele_drawingArea.
    selectAll("line").data(function(d){
        return d.map(function (val,index,arr) {
            if (index < arr.length - 1)
            {
                return [arr[index],arr[index+1]]
            }
            else
            {
                return undefined;
            }
        }).filter(function (val) {
            return (val !== undefined);
        })

    }).
    enter().append("line").
    attrs({
        "x1": function(two_points){return xscale(two_points[0][0]);},
        "y1": function(two_points){return yscale(two_points[0][1]);},
        "x2": function(two_points){return xscale(two_points[1][0]);},
        "y2": function(two_points){return yscale(two_points[1][1]);},
    }).
    attrs({
        "stroke":"black",
        "stroke-width":"2"
    })

    // draw the points
	var arr_ele_points = ele_drawingArea.
    selectAll("circle").data(function(d) {return d;}).enter().append("circle").
        attr("r",5).
        attr("cx",function (d) {return xscale(d[0]);}).
        attr("cy",function (d) {return yscale(d[1]);})

    // create axis objects
    var xaxis = d3.axisBottom()
		.scale(xscale)
		.ticks(10);
	var yaxis = d3.axisLeft()
		.scale(yscale)
		.ticks(10);

	// add axis to svg
	ele_svg.
	append("g").classed("xaxis",true).
	call(xaxis).
	attr("transform","translate("+axisPadding+","+drawing_height+")")

	ele_svg.
	append("g").classed("yaxis",true).
	call(yaxis).
	attr("transform","translate("+axisPadding+","+"0)")

	// create, add and show tip on mouseover
	var tip_points = d3.tip()
	  .attr('class', 'd3-tip')
	  .html(function(d) { return "("+d[0]+","+d[1]+")"; })

	var vis = ele_drawingArea
	  // REQUIRED:  Call the tooltip on the context of the visualization
	  .call(tip_points)

	 arr_ele_points.
	 on('mouseover', function () {
	 	tip_points.show.apply(this,arguments);

	 	var ele_point = d3.select(this);
	 	ele_point.
	 	transition().
	 	duration(.5).
	 	attrs({
	 		"fill":"rgb(128,128,128)",
	 		"r":7
	 	})
	 }).
	 on('mouseout', function () {
	 	tip_points.hide.apply(this,arguments);

	 	var ele_point = d3.select(this);
	 	ele_point.
	 	transition().
	 	duration(.5).
	 	attrs({
	 		"fill":"black",
	 		"r":5
	 	})
	 })

	 arr_ele_lines.
	 on('mouseover', function () {
	 	var ele_line = d3.select(this);
	 	ele_line.
	 	transition().
	 	duration(.5).
	 	attrs({
	 		"stroke":"rgb(128,128,128)",
	 		"stroke-width":4
	 	})
	 }).
	 on('mouseout', function () {
	 	var ele_line = d3.select(this);
	 	ele_line.
	 	transition().
	 	duration(.5).
	 	attrs({
	 		"stroke":"black",
	 		"stroke-width":2
	 	})
	 })

	// axis legend
	ele_svg
    .append('g').classed("x-label",true)
    .attr('transform', 'translate(' + (axisPadding+(parent_width - axisPadding)/2) + ', ' + (parent_height - axisLabelPadding/2) + ')')
    .append('text')
    .attr('text-anchor', 'middle')
    // .attr('transform', 'rotate(-90)')
    .text('X Axis Label')
    ;
    ele_svg
    .append('g').classed("y-label",true)
    .attr('transform', 'translate(' + (axisLabelPadding) + ', ' + (parent_height - axisPadding)/2 + ')')
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('transform', 'rotate(-90)')
    .attr("shape-rendering","crispEdges")
    .text('Y Axis Label')
    ;

})