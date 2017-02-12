var dataset;
var col_names, bins = 8, no_bins = 8;
var data, x, histogram, pie;
var pady = 50, tip;
var padx = 50;
var margin = {top: 20, right: 30, bottom: 30, left: 30};
var width = 900 - margin.left - margin.right;
var height = 550 - margin.top - margin.bottom;
var color = "steelblue";
var radius = Math.min(width, height) / 2;

function draw_histogram(no_bins) {
	var y_max = d3.max(data.map(function(d){return d.length}));
	var y_min = d3.min(data.map(function(d){return d.length}));

	var xScale = d3.scale.linear()
		.domain([0,d3.max(data.map(function(d) {return d.x}))])
		.range([padx/2,width-(padx/2)]);

	var yScale = d3.scale.linear()
		.domain([0,d3.max(data.map(function(d) {return d.length}))])
		.range([height-pady*2,0]);

	var heightScale = d3.scale.linear()
		.domain([0,d3.max(data.map(function(d) {return d.length}))])
		.range([0,height-pady*2]);

	var xAxis = d3.svg.axis()
		.scale(xScale)
		.orient("bottom")
		.ticks(no_bins);

	var colorScale = d3.scale.category20c();

	var xPos = d3.scale.linear()
		.domain([0,d3.max(data.map(function(d) {return d.x}))])
		.range([padx/2,width-padx]);

	tip = d3.tip()
		.attr('class', 'd3-tip')
	 	.offset([-10, 0])
	 	.html(function(d) {
	 	return "<span style='color:#800000'>" + d.length + "</span>";
	  })
	svg.call(tip);

	var bar = svg.selectAll("rect")
		.data(histogram)
		.enter()
		.append("rect")
		.on('mouseover', function(d) {
			d3.select(this)
			.attr("height", function(d) {return heightScale(d.y) + 15})
			.attr("width", 80)
			.attr("transform", "translate(0,-15)");
		tip.show(d);
	})
	.on('mouseout', function(d, i) {
		d3.select(this)
			.attr("fill", function(d, i) {return colorScale(d.x)})
			.attr("height", function(d) {return heightScale(d.y)})
			.attr("width", 65)
			.attr("transform", "translate(7.5, 0)");
		tip.hide(d);
	})
	.attr("class", "bar")
	.attr("fill", function(d,i) { return colorScale(d.x) })
	.attr("x", function(d) { return xPos(d.x)})
	.attr("height", 0)
	.attr("y", function(d,i) { return height-pady })
	.attr("width", 65)
	.attr("transform", "translate(5,0)")
	.transition()
	.duration(800)
	.delay(function (d,i) { return i*50 })
		.attr("y", function(d) { return yScale(d.y) +pady})
		.attr("height", function(d) { return heightScale(d.y) });
	
	svg.append("g")
		.attr("class","axis")
		.attr("transform", "translate(35, "+ (height - pady + 15) +")")
		.call(xAxis);

}


function init_histogram(column, bins) {
	svg.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	var index = col_names.indexOf(column);
	var col_data = dataset.map(function(d) {return parseInt(d[column]);});
	histogram = d3.layout.histogram()
		.bins(bins)
		(col_data);
	data = histogram;
	svg.selectAll("*").remove();
	draw_histogram(bins);
}


var svg = d3.select("div")
	.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


function process_data(arr) {
	var max = Math.max.apply(null, arr);
	var min = Math.min.apply(null, arr);
	var dict = {};
	var start_of_range = {};
	var end_of_range = {};
	var method = {};
	var range = {};
	var n = 8;
	var count = {};
	var len = Object.keys(start_of_range).length;
	var length_of_range = (max - min + 1) / n;

	for (var i = 1; i <= n; i++) {
		count[i] = 0;
	}

	for (var i = 1; i <= n; i++) {
		start_of_range[i] = Math.ceil(length_of_range * (i-1) + min);
		if ( i != 1 && start_of_range[i] == end_of_range[i-1])
			start_of_range[i] += 1;
		if ( i != 1 && start_of_range[i] == end_of_range[i-1] - 1)
			start_of_range[i] += 2;
		if ( i != 1 && start_of_range[i] == end_of_range[i-1] - 2)
			start_of_range[i] += 3;
		end_of_range[i] = Math.ceil(start_of_range[i] + length_of_range - 1); 
	}

	for (var i = 1; i < arr.length; i++) {
		method[arr[i]] = Math.floor((arr[i] - min) / length_of_range + 1);
		count[method[arr[i]]] += 1;
	}

	var array = [];
	for (var i = 1; i <= n; i++) {
		array.push({
			key: start_of_range[i].toString() + '-' + end_of_range[i].toString(),
			value: count[i]
		});
	}

	return array;
}


function draw_pie(data) {

	var color = d3.scale.category20c();  

	var arc = d3.svg.arc()
		.outerRadius(radius - 10)
		.innerRadius(25);

	pie = d3.layout.pie()
		.sort(null)
		.value(function(d) { return d.value; });

	tip = d3.tip()
		.attr('class', 'd3-tip')
	 	.offset([-10, 0])
	 	.html(function(d) {
	 	return "<span style='color:#800000'>" + d.data.key + "</span>";
	  })
	svg.call(tip);

	var path = svg.selectAll("path")
		.data(pie(data))
		.enter()
		.append("path")
		.on("mouseover", function (d) {
			d3.select(this)
				.attr("width", d3.event.pageX)
				.attr("height", d3.event.pageY)
			tip.show(d);
		})			
		.on("mouseout", function (d) {
			tip.hide(d);
		})
		.attr("fill", function(d, i) { return color(i); })
		.transition()
	    .delay(function(d, i) {
	    	return i * 500;
		})
		.attrTween('d', function(d) {
			var i = d3.interpolate(d.startAngle+0.1, d.endAngle);
			return function(t) {
				d.endAngle = i(t);
				return arc(d);
				}
			});


	svg.selectAll("path").append("text")
		.attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
		.attr("dy", ".35em")
		.text(function(d) { return d.data.key; });

	function type(d) {
		d.value = +d.value;
		return d;
	}
}


function init_pie(column) {
	svg.attr("transform", "translate(" + (width / 2 + margin.left) + "," + (height / 2 + margin.top) + ")");
	var index = col_names.indexOf(column);
	var col_data = dataset.map(function(d) {return parseInt(d[column]);});
	var processed_data = process_data(col_data);
	svg.selectAll("*").remove();
	draw_pie(processed_data);
}


d3.csv("data/winter.csv", function(error, data) {
	var isPie = false;
	dataset = data;
	col_names = Object.keys(d3.values(data)[0]);
	d3.select("select").selectAll("option")
		.data(col_names)
		.enter()
		.append("option")
		.attr("value", function(d) {return d})
		.text(function(d) {return d});
	
	init_histogram(col_names[0], bins);

	svg.on("click", function(d, i) {
		var selected = $('#my-dropdown option:selected');
		tip.hide(d);
		if (isPie) {
			isPie = false;
			init_histogram(selected.html(), bins);
		}
		else {
			isPie = true;
			init_pie(selected.html())
		}
	});
});


function reset() {
	var selected = $('#my-dropdown option:selected');
	init_histogram(selected.html(), bins);
}


/* Adding event listener for leftward and rightward movement detection */
var direction = "",
oldx = 0,

mousemovemethod = function (e) {
	var selected = $('#my-dropdown option:selected');
	if (e.pageX < oldx) {
		direction = "left";
		no_bins = no_bins + 1;

	} else if (e.pageX > oldx) {
		direction = "right";
		no_bins = no_bins - 1;
	}
	console.log(direction);
	init_histogram(selected.html(), no_bins);
	oldx = e.pageX;
}

var drag_area = document.getElementById("navigator");
drag_area.addEventListener("click", mousemovemethod, true);
