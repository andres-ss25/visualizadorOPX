queue()
    .defer(d3.json, "/data")
    .defer(d3.json, "static/geojson/barrios.json")
    .await(makeGraphs);


function makeGraphs(error, recordsJson, statesJson) {
	
	//Clean data
	var records = recordsJson;
	var dateFormat = d3.time.format("%Y-%m-%d");
	
	records.forEach(function(d) {
		d["fecha_formato"] = dateFormat.parse(d["fecha_formato"]);
		d["fecha_formato"].setDate(1);
		});


	//Create a Crossfilter instance
	var ndx = crossfilter(records);

	//Define Dimensions (x-axis values)
	var dateDim = ndx.dimension(function(d) { return d["fecha_formato"]; });
	var yearDim = ndx.dimension(function(d) {return d["anio"]});
	var monthDim = ndx.dimension(function(d) {return d["mes"]});
	var dayDim = ndx.dimension(function(d) {return d["dia"]});
	var hourDim = ndx.dimension(function(d) {return d["hora_24x"]});
	var genderDim = ndx.dimension(function(d) { return d["sexo"]; });
	var ageSegmentDim = ndx.dimension(function(d) { return d["edad_9x"]; });
	var unrestDim = ndx.dimension(function(d) { return d["conflictividad"]; });
	var comunaDim = ndx.dimension(function(d) {return d["comuna"]});
	var locationdDim = ndx.dimension(function(d) { return d["barrio_nombre"]; });
	var allDim = ndx.dimension(function(d) {return d;});

	//Group Data
	var numRecordsByDate = dateDim.group();
	var yearGroup = yearDim.group();
	var monthGroup = monthDim.group();
	var dayGroup = dayDim.group();
	var hourGroup = hourDim.group();
	var genderGroup = genderDim.group();
	var ageSegmentGroup = ageSegmentDim.group();
	var unrestGroup = unrestDim.group();
	var comunaGroup = comunaDim.group();
	var locationGroup = locationdDim.group();
	var all = ndx.groupAll();


	//Define values (to be used in charts)
	var minDate = dateDim.bottom(1)[0]["fecha_formato"];
	var maxDate = dateDim.top(1)[0]["fecha_formato"];

	var minAnio = yearDim.bottom(1)[0]["anio"];
	var maxAnio = yearDim.top(1)[0]["anio"];

	var minComuna = comunaDim.bottom(1)[0]["comuna"]
	var maxComuna = comunaDim.top(1)[0]["comuna"]
    
    //Charts
    var groupname = "Choropleth"

	//var timeChart = dc.barChart("#time-chart", groupname);
	var yearChart = dc.barChart("#year-bar-chart", groupname);
	var monthChart = dc.pieChart("#month-ring-chart", groupname);
	var dayChart = dc.pieChart("#day-ring-chart", groupname);
	var hourChart = dc.barChart("#hour-bar-chart", groupname);
	var genderChart = dc.rowChart("#gender-row-chart", groupname);
	var ageSegmentChart = dc.rowChart("#age-segment-row-chart", groupname);
	var unrestChart = dc.rowChart("#unrest-row-chart", groupname);
	var comunaChart = dc.barChart("#comuna-bar-chart", groupname);
	var locationChart = dc.rowChart("#location-row-chart", groupname);
	var numberRecordsND = dc.numberDisplay("#number-records-nd", groupname);
	var choropletMap = dc.leafletChoroplethChart("#cali-chart", groupname);
    
    var totalCasosByComuna = locationdDim.group().reduceCount(function(d) { return d["comuna"];});
	
	var barriosTop5 = locationGroup.top(4);
	console.log('top 5 de barrios');
	console.log(barriosTop5);

    var max_state_ = totalCasosByComuna.top(23);
    console.log(max_state_);
    
    var max_state = totalCasosByComuna.top(1)[0].value;
    console.log(max_state)
    
    //console.log(locationdDim);

    console.log(locationGroup.top(20));
    
    // Aqui va lo respectivo al chart 
    function drawCharts(){
    	//var groupname = "Choropleth"

    numberRecordsND
		.formatNumber(d3.format("d"))
		.valueAccessor(function(d){return d; })
		.group(all);

//Se bloquea para remplazar por yearChart
/* 	timeChart
		.width(700)
		.height(205)
		.margins({top: 10, right: 50, bottom: 20, left: 50})
		.dimension(dateDim)
		.group(numRecordsByDate)
		.transitionDuration(500)
		.x(d3.time.scale().domain([minAnio, maxAnio]))
		.elasticY(true)
		.yAxis().ticks(4);
		.x(d3.scale.ordinal())
		.xUnits(dc.units.ordinal)
		.elasticY(true)
		.yAxis().ticks(5); */
		

	yearChart
	    .width(700)
		.height(200)
		.margins({top: 10, right: 50, bottom: 20, left: 50})
		.dimension(yearDim)
		.group(yearGroup)
		.x(d3.scale.ordinal())
		.xUnits(dc.units.ordinal)
		.elasticY(true)
		.yAxis().ticks(5);
     
	monthChart
	 	.width(300)
     	.height(300)
     	.dimension(monthDim)
     	.group(monthGroup)
		.innerRadius(50)
		.label(function (d) {
			return d.data.key + ":" + (d.data.value / all.value() * 100).toFixed(1) + "%"
		})
     	.ordering(function (d) {
	 		var order = {
	 		  'Ene': 1, 'Feb': 2, 'Mar': 3, 'Abr': 4,
	 		  'May': 5, 'Jun': 6, 'Jul': 7, 'Ago': 8,
	 		  'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dic': 12
	 		};
	 		return order[d.key];
		   })
		;
	
	 dayChart
	 	.width(300)
     	.height(300)
     	.dimension(dayDim)
     	.group(dayGroup)
		.innerRadius(50)
		.label(function (d) {
			return d.data.key + ":" + (d.data.value / all.value() * 100).toFixed(1) + "%"
		})
		.ordering(function (d) {
			var order = {
			  'Lunes' : 1, 'Martes': 2, 'Miércoles': 3, 'Jueves': 4, 'Viernes': 5, 'Sábado': 6, 'Domingo' : 7
			};
			return order[d.key];
		});

	 hourChart
		.width(750)
		.height(205)
		.margins({top: 10, right: 50, bottom: 20, left: 50})
	 	.dimension(hourDim)
		.group(hourGroup)
		.x(d3.scale.ordinal())
		.xUnits(dc.units.ordinal)
		.elasticY(true)
		.colors([ '#3498d8', '#5dade2', '#85c1e9', '#aed6f1', 
				  '#e67e22', '#eb984e', '#f0b271', '#f5cba7', 
				  '#27ae60', '#52be80', '#7dcea0', '#a9dfbf', 
				  '#c0392b', '#cd6155', '#d98880', '#e6b0aa', 
				  '#8e44ad', '#a559bd', '#bb8fce', '#d2b4de', 
				  '#34495e', '#5d6d7e', '#85929e', '#aeb6bf'])
	 	.ordering(function (d) {
		 var order = {
		   1 : 1, 2 : 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10, 11: 11, 12: 12,
		   13 : 13, 14 : 14, 15: 15, 16: 16, 17: 17, 18: 18, 19: 19, 20: 20, 21: 21, 22: 22, 23: 23, 24: 24 
		 };
		 return order[d.key];
		});
	

	genderChart
        .width(320)
		.height(205)
		.dimension(genderDim)
        .group(genderGroup)
        .ordering(function(d) { return -d.value })
        .colors(['#6baed6'])
        .elasticX(true)
        .xAxis().ticks(4);

	ageSegmentChart
		.width(320)
		.height(230)
		.dimension(ageSegmentDim)
		.group(ageSegmentGroup)
		.colors(['#6baed6'])
        .elasticX(true)
        .labelOffsetY(10)
        .xAxis().ticks(4);

	unrestChart
		.width(320)
		.height(205)
		.dimension(unrestDim)
		.group(unrestGroup)
        .ordering(function(d) { return -d.value })
		.colors(['#6baed6'])
        .elasticX(true)
        .xAxis().ticks(4);

	comunaChart
	 	.width(450) 
		.height(200)
		.margins({top: 10, right: 40, bottom: 20, left: 40})
		.dimension(comunaDim)
		.group(comunaGroup) 
		.x(d3.scale.ordinal())
		.xUnits(dc.units.ordinal)
		.elasticY(true)
		//.ordering(function(d) { return -d.value })
		.ordering(function (d) {
			var order = {
			  1 : 1, 2 : 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10, 11: 11, 12: 12,
			  13 : 13, 14 : 14, 15: 15, 16: 16, 17: 17, 18: 18, 19: 19, 20: 20, 21: 21, 22: 22 
			};
			return order[d.key];})
		.colors(['#6baed6'])
		.xAxis().ticks(4);
	
	
	//Para pruebas
	var locationdDim_ = ndx.dimension(function(d) { return d["barrio_nombre"]; });
	var locationGroupTop5 = locationdDim_.group().top(5);
	console.log('all.value() '+ all.value());

    // var filteredGroup = (function (source_group) {return {
	// 	all:function () {
	// 	  return source_group.top(5).filter(function(d) {
			
	// 		console.log(d.key);
			
	// 		return d.key;
	// 	   });
	// 	}
	//   };})(locationGroup);


	function getTops(source_group){
		return {
			all: function () {
                console.log('Top selección');
				console.log(source_group.top(5));
				return source_group.top(5);
			}
		};
	}

	var fakeGroup = getTops(locationGroup);

	
	function remove_empty_bins(source_group){
		return {
			all:function(){
				return source_group.all().filter(function (d){
					return d.value !=0;
				});
			}
		};
	}

	var group_ =remove_empty_bins(fakeGroup);
	

	// locationChart
	//     .width(750).height(210)
	// 	.margins({top: 10, right: 50, bottom: 20, left: 50})
	// 	.dimension(locationdDim)
	// 	.group(group_)
	// 	.elasticX(true)
	// 	.x(d3.scale.ordinal())
	// 	.xUnits(dc.units.ordinal)
	// 	.brushOn(false)
	// 	.elasticY(true)
	// 	.colors(['#6baed6'])
	// 	.ordering(function(d) { return -d.value });
	// 	//.xAxis().tick(4)

	locationChart
	    .width(180).height(200)
		.margins({top: 10, right: 5, bottom: 20, left: 5})
		.dimension(locationdDim)
		.group(fakeGroup)
		.ordering(function(d) { return -d.value })
		.colors(['#6baed6'])
		.elasticX(true)
		.xAxis().ticks(4);	
	
	
		//var locationdDim_ = ndx.dimension(function(d) { return d["barrio_nombre"]; });
	
	
	choropletMap
    	.dimension(locationdDim)
    	.group(locationGroup)
    	.geojson(statesJson)
        .center([3.42, -76.5])
        .zoom(12)
        .colors(["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"])
        .colorDomain(function() {
        	return [dc.utils.groupMin(this.group(), 
        		    this.valueAccessor()),
        	        dc.utils.groupMax(this.group(), 
        	        this.valueAccessor())];
        	})
        .colorAccessor(function(d,i) {
        	//console.log(d.value);
        	return d.value;
        	})
        .featureKeyAccessor(function(feature) {
			//console.log(feature.properties.BARRIO);
        	return feature.properties.BARRIO;
            })
        .popup(function(d,feature) {
        	console.log( feature.properties.BARRIO + ":" + d.value);
        	return (feature.properties.BARRIO + ":" + d.value);
		})
		.renderPopup(true);


    dc.renderAll(groupname);

    };
    
    drawCharts();
	dc.renderAll();

};





