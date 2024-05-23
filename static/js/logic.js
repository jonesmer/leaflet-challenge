// url to retrieve the data
const dataURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"
//   getcolor function from leaflet's choropeleth page:
function pickAColor(depth) {
    return depth >90 ? "#FF0000" :
           depth >70 ? "#FFA500" :
           depth >50 ? "#FFFF00" :
           depth >30 ? "#008000" :
           depth >10 ? "#0000FF" :
                       "#800080";
}
// d3 the data
d3.json(dataURL).then(function (data) {
    // Once we get a response, send the data.features object to the createFeatures function.
    createFeatures(data.features);
  });
  
  function createFeatures(earthquakeData) {
  
    // // Define a function that we want to run once for each feature in the features array.
    // // Give each feature a popup that describes the place and time of the earthquake.
    function onEachFeatureFn(feature, layer) {
      layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><h5>${new Date(feature.properties.time)}</h5><h5>Magnitude: ${(feature.properties.mag)}</h5><h5>Depth: ${(feature.geometry.coordinates[2])}</h5> km`);
    }
    
    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeatureFn,
        pointToLayer: function(geoJsonPoint, latlng){
            var circleMarker=L.circle(latlng, {
                radius: geoJsonPoint.properties.mag*20000,
                color: pickAColor(geoJsonPoint.geometry.coordinates[2])
                });
            return circleMarker;
        }
    });
  
    // Send the earthquakes layer to the createMap function
    createMap(earthquakes);
    }
  
    function createMap(earthquakes) {
  
        // Create the base layer.
        let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        });

        // Create a baseMaps object.
        let baseMaps = {
        "Street Map": street
        };
  
        // Create an overlay object to hold our overlay.
        let overlayMaps = {
        Earthquakes: earthquakes
        };
  
        // Create our map, giving it the streetmap and earthquakes layers to display on load.
        let myMap = L.map("map", {
            center: [34.0549, -118.2426],
            zoom: 4,
            layers: [street, earthquakes]
        });
  
        // Create a layer control.
        // Pass it our baseMaps and overlayMaps.
        // Add the layer control to the map.
        L.control.layers(baseMaps, overlayMaps, {
            collapsed: false
        }).addTo(myMap);
        // legend (also from leaflet's choropleth page)
        let legend = L.control({position: 'bottomright'});

        legend.onAdd = function (myMap) {
    
            const div = L.DomUtil.create('div', 'legend');
            const depths = [0, 10, 30, 50, 70, 90];
            const labels = ["Depth"];
            let from, to;
    
            for (let i = 0; i < depths.length; i++) {
                from = depths[i];
                to = depths[i + 1];
    
                labels.push(`<i style="background:${pickAColor(from + 1)}"></i> ${from}${to ? `&ndash;${to}` : '+'} km`);
            }
    
            div.innerHTML = labels.join('<br>');
            return div;
        };
        legend.addTo(myMap);
}
