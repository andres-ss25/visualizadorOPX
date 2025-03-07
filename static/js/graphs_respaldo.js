queue()
    .defer(d3.json, "/data")
    .defer(d3.json, "static/geojson/comunas.json")
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

	//Define Dimensions
	var dateDim = ndx.dimension(function(d) { return d["fecha_formato"]; });
	var genderDim = ndx.dimension(function(d) { return d["sexo"]; });
	var ageSegmentDim = ndx.dimension(function(d) { return d["edad_9x"]; });
	var phoneBrandDim = ndx.dimension(function(d) { return d["conflictividad"]; });
	var locationdDim = ndx.dimension(function(d) { return d["comuna"]; });
	var allDim = ndx.dimension(function(d) {return d;});


	//Group Data
	var numRecordsByDate = dateDim.group();
	var genderGroup = genderDim.group();
	var ageSegmentGroup = ageSegmentDim.group();
	var phoneBrandGroup = phoneBrandDim.group();
	var locationGroup = locationdDim.group();
	var all = ndx.groupAll();


	//Define values (to be used in charts)
	var minDate = dateDim.bottom(1)[0]["fecha_formato"];
	var maxDate = dateDim.top(1)[0]["fecha_formato"];
    
    //Charts
    var numberRecordsND = dc.numberDisplay("#number-records-nd");
	var timeChart = dc.barChart("#time-chart");
	var genderChart = dc.rowChart("#gender-row-chart");
	var ageSegmentChart = dc.rowChart("#age-segment-row-chart");
	var phoneBrandChart = dc.rowChart("#phone-brand-row-chart");
	var locationChart = dc.rowChart("#location-row-chart");
    
    #var caliChart = dc.geoChoroplethChart("#cali-chart") //AFS
    
    
    var totalCasosByComuna = locationdDim.group().reduceCount(function(d) { return d["comuna"];});
    //var max_state = totalCasosByComuna.top(23);
    
    var max_state = totalCasosByComuna.top(1)[0].value;
    
    numberRecordsND
		.formatNumber(d3.format("d"))
		.valueAccessor(function(d){return d; })
		.group(all);


	timeChart
		.width(650)
		.height(200)
		.margins({top: 10, right: 50, bottom: 20, left: 50})
		.dimension(dateDim)
		.group(numRecordsByDate)
		.transitionDuration(500)
		.x(d3.time.scale().domain([minDate, maxDate]))
		.elasticY(true)
		.yAxis().ticks(4);

	genderChart
        .width(300)
        .height(150)
        .dimension(genderDim)
        .group(genderGroup)
        .ordering(function(d) { return -d.value })
        .colors(['#6baed6'])
        .elasticX(true)
        .xAxis().ticks(4);

	ageSegmentChart
		.width(300)
		.height(250)
        .dimension(ageSegmentDim)
        .group(ageSegmentGroup)
        .colors(['#6baed6'])
        .elasticX(true)
        .labelOffsetY(10)
        .xAxis().ticks(4);

	phoneBrandChart
		.width(300)
		.height(310)
        .dimension(phoneBrandDim)
        .group(phoneBrandGroup)
        .ordering(function(d) { return -d.value })
        .colors(['#6baed6'])
        .elasticX(true)
        .xAxis().ticks(4);

    locationChart
    	.width(200)
		.height(510)
        .dimension(locationdDim)
        .group(locationGroup)
        .ordering(function(d) { return -d.value })
        .colors(['#6baed6'])
        .elasticX(true)
        .labelOffsetY(10)
        .xAxis().ticks(4);
    
        
//    caliChart
//        .width(width)
//        .height(height)
//        .dimension(locationdDim)
//        .group(locationGroup)
//        .colors(["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"])
//        .colorDomain([0, 15000])
//        .overlayGeoJson(statesJson["features"], "comuna", function (d) {
//            return d.properties.COMUNA;
//        })
//        .projection(projection)
//        .title(function (p) {return "Comuna: " + p["key"];})

        
    

    
    //---- Manejo de Leaftlet MAPA -----
    
    var map = L.map('map');

    function getColor(d) {
        return  d > 75000   ? '#FED976' : 
                                '#6baed6' ; 
     };
    
    
    function style(all) {
        
    return {
        fillColor: getColor(all),
        weight: 2,
        opacity: 1,
        color: 'blue',
        dashArray: '3',
        fillOpacity: 0.5
        };
    }
    

	var drawMap = function(){
        
//        var totalCasosByComuna = locationdDim.group().reduceCount(function(d) { return d["comuna"];});
//        
//        var max_state = totalCasosByComuna.top(23);
//        console.log(max_state);
//        //console.log(max_state[1].key, max_state[1].value);
//        console.log("_________");
//        
//        function bebe(d, g){
//            var j;
//            for (j = 0; j < d.length-1; j++) {
//            console.log(d[j].key, d[j].value);
//                }
//        }    
// 
//        bebe(max_state, statesJson);
/*
    var totalComuna = allDim.group().reduceCount(function(d) {
        return d["comuna"];
    });
    var totalxcomuna = totalComuna.top(22);
    
    console.log(totalxcomuna[1]);
    
  */       
        
            
	    map.setView([3.4, -76.5], 12);
		mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
		L.tileLayer(
			'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '&copy; ' + mapLink + ' Contributors',
				maxZoom: 50,
			}).addTo(map);
        
        L.geoJson(statesJson).addTo(map);
        
		var geoData = [];
//		_.each(allDim.top(Infinity), function (d) {
//			geoData.push([d["latitude"], d["longitude"], 1]);
//	      });
//		var heat = L.heatLayer(geoData,{
//			radius: 10,
//			blur: 20, 
//			maxZoom: 1,
//		}).addTo(map);

	};
    
 
    //Draw Map
	drawMap();

	//Update the heatmap if any dc chart get filtered
	dcCharts = [timeChart, genderChart, ageSegmentChart, phoneBrandChart, locationChart];

	_.each(dcCharts, function (dcChart) {
		dcChart.on("filtered", function (chart, filter) {
			map.eachLayer(function (layer) {
				map.removeLayer(layer)
			}); 
			drawMap();
		});
	});


	dc.renderAll();

};