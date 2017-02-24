
var all_data_points = []; // all_data_points = [ [[x1,y1],[x2,y2],[another point]], [another chart] ]

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

    // prepare scales
    var xscale = d3.scaleLinear().
    // set domain with an immediately invoked function
    domain(function (arr_point) {
        var max_val = d3.max(arr_point,function (point) {
            return point[0];
        })
        var min_val = 0;
        return [min_val,max_val];
    }(data_chart)).
    // set region to svg width and height
    range([0,parent_width])

    var yscale = d3.scaleLinear().
    // set domain with an immediately invoked function
    domain(function (arr_point) {
        var max_val = d3.max(arr_point,function (point) {
            return point[1];
        })
        var min_val = 0;
        return [min_val,max_val];
    }(data_chart)).
    // set region to svg width and height
    range([parent_height,0])

	var ele_svg = ele_chart.append("svg");
    
    ele_svg.attr("width",parent_width).attr("height",parent_height).
    selectAll("circle").data(function(d) {return d;}).enter().append("circle").
        attr("r",5).
        attr("cx",function (d) {return xscale(d[0]);}).
        attr("cy",function (d) {return yscale(d[1]);})

    ele_svg.selectAll("line").data(function(d){
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

})