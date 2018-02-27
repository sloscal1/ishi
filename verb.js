var width = 480;
var height = 500;
var center = width/2;

var x = d3.scaleLinear().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

var chart = d3.select(".chart")
							.attr("width", width)
							.attr("height", height);
var menuItems = [];


function addLabel(srcId, x, y){
	style = {
    'rect': {
        'mouseout': {
            'fill': 'rgb(244,244,244)',
            'stroke': 'white',
            'stroke-width': '1px'
        },
        'mouseover': {
            'fill': 'rgb(200,200,200)'
        }
    },
    'text': {
        'fill': 'steelblue',
        'font-size': '13'
    }
  };

	if(window.getSelection){
		var text = window.getSelection().toString();
		// Really helpful to do this: http://bl.ocks.org/jakosz/ce1e63d5149f64ac7ee9
		d3.select('.context-menu').remove();
		d3.event.preventDefault();
		d3.select("svg")
		  .append("g").attr('class', 'context-menu')
			.selectAll("tmp")
			.data(menuItems).enter()
			.append("g").attr('class', 'menu-entry')
			.style("cursor", "pointer")
			.on("mouseover", function(){
				d3.select(this).select("rect").style("fill", "darkgray")})
			.on("mouseout", function(){
				d3.select(this).select("rect").style("fill", "gray")});

		d3.selectAll(".menu-entry")
		  .append("rect")
			.attr('x', x)
			.attr('y', function(d, i){ return y + i*20;})
			.attr('width', 40)
			.attr('height', 20)
			.style("fill", "gray");
		d3.selectAll(".menu-entry")
			  .append("text")
				.text(function(d){return d;})
				.attr('x', x)
				.attr('y', function(d, i){ return y + i*20+10;})
				.attr('width', 40)
				.attr('height', 20)
				// .style(style.text)
				.on("click", function(d){
					console.log(JSON.stringify({
						"id":srcId,
						"tag_name":d,
						"words": text}));
				  d3.select(".context-menu").remove();});

		// Blow away the menu on a non-selection
    d3.select('body')
        .on('click', function() {
					  var el = d3.select('.context-menu');
						console.log("removing...")
						if(el.length > 1){
							console.log(el);
							el.remove();
						}
        });
		//Pop up list of topics (or create)
	}

	return 0;
}

d3.json("verbatim.json", function(error, data){
	if(error) console.warn(error);

	// Get all possible menu items
	data.forEach(function(d){menuItems = menuItems.concat(d.tags)});
	menuItems = Array.from(new Set(menuItems)).sort();

	x.domain([0, d3.max(data, function(d) { return d.verbatim.length; })]);
	y.domain([0, data.length-1]);

	var topic_width = 10*d3.max(data, function(d) {
		return d3.max(d.tags, function(t){return t.length;});
	});

	var row_cont = chart.selectAll("g")
								 .data(data, function(d, i){return d[i];})
								 .enter()
								 .append("g")
								 .attr("class", "row")
								 .attr("transform", function(d, i){return "translate(0, "+(i*25)+")";});
	verb_cont = row_cont.selectAll("g")
		  								.data(function(d){return [d];})
											.enter();
	verb_cont.append("rect")
					 .attr("class", "verb")
			     .attr("x", center)
				 	 .attr("y", 0)
					 .attr("width", x.domain()[1]+"ex")
					 .attr("height", 20)
					 .style("fill", "steelblue");
	verb_cont.append("text")
				   .attr("x", center+10)
				   .attr("y", 13)
				   .text(function(d){return d.verbatim;})
					 .on("mouseup", function(d){
						 d3.event.preventDefault();
						 addLabel(d.id, d3.mouse(this)[0], d3.mouse(this)[1]);});

	var tag_cont = row_cont.selectAll("g")
										 		 .data(function(d){return [d];})
										     .enter()
												 .append("g").attr("class", "tag");

  tag_cont.selectAll(".tag")
					.data(function(d){return d.tags;})
					.enter()
					.append("rect")
 				  .classed("topic_selected", true)
				  .attr("x", function(d, i){return center-(i+1)*topic_width-5*(i+1);})
				  .attr("y", 0)
				  .attr("width", topic_width)
					.attr("height", 20)
					.on("click", function(d){
						json_data = JSON.stringify({
							"tag_name":d,
							"id": d3.select(this).node().parentNode.__data__.id});
						if(d3.select(this).classed("topic_selected"))
							console.log("Lambda remove "+json_data);
						else
							console.log("Lambda add "+json_data);
						d3.select(this).classed("topic_selected",
							!d3.select(this).classed("topic_selected"));
						d3.select(this).classed("topic_unselected",
							!d3.select(this).classed("topic_unselected"));
					});
	tag_cont.selectAll(".tag")
					.data(function(d){return d.tags;})
					.enter()
					.append("text")
					.attr("x", function(d, i){return center-(i+1)*topic_width;})
					.attr("y", 13)
					.attr("width", x.domain()[1]+"ex")
					.style("fill", "black")
					.text(function(d){return d;});
});
