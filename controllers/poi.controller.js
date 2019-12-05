const gMaps = require('../external/google.maps');
var fs = require('fs');

//This module implements all logic of choosing which POI(s) to visit
var data = fs.readFileSync('poi.json', 'utf-8');
const poi = JSON.parse(data);

exports.routes = function(req, res) {
    var json_request = req.body;
    //resolve destination coordinates
    json_request['destination'] = gMaps.getCoordinates(json_request['destination']);

    var stops = stopList(json_request);
    var route1 = gMaps.getRoute(stops[0]);
    var route2 = gMaps.getRoute(stops[1]);
    var route3 = gMaps.getRoute(stops[2]);

    res = [
        {
            "routeName": "Route 1",
            "route": route1,
            "spots":
                    []
        },
        {
            "routeName": "Route 2",
            "route": route2,
            "spots":
                []
        },
        {
            "routeName": "Route 3",
            "route": route3,
            "spots":
                []
        }
    ];

    var spotsContent = [];
    for (let i=1; i<(stops[0].length-1); i++) {
        spotsContent.push(stops[0][i]);
    }
    res[0].spots = spotsContent;

    spotsContent = [];
    for (let i=1; i<(stops[1].length-1); i++) {
        spotsContent.push(stops[1][i]);
    }
    res[1].spots = spotsContent;

    spotsContent = [];
    for (let i=1; i<(stops[2].length-1); i++) {
        spotsContent.push(stops[2][i]);
    }
    res[2].spots = spotsContent;

    return res;
};


/*
stopList receives a request of structure:
{
   "origin": {
             "lat": float,
             "lng": float
   },
   "destination": {
             "lat": float,
             "lng": float
   },
   "preferences": {
     "Street Art": boolean,
     "Architecture": boolean,
     "Museums": boolean,
     "Viewpoints": boolean,
     "Local Cuisine": boolean,
     "Parks": boolean
   }
}

and returns a set of 3 lists of poi,
each set is bigger than the previous one and each set is contained by the following set.
*/
function stopList(req, res) {
    //TODO: poi selection logic
    //return list;
}

/* AUX functions*/

/*Distance, as the crow flies, in m, between two points.
This will be used as an estimate of walking distance
to reduce the number of calls to the google maps API.
point should be of structure:
{
  "lat": 41.43206,
  "lng": -81.38992
}
*/
function rawDistance(p1, p2) {
    var R = 6371000; // Radius of the earth in m
    var lat1 = p1['lat'];
    var lng1 = p1['lng'];
    var lat2 = p2['lat'];
    var lng2 = p2['lng'];
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLng = deg2rad(lng2-lng1);
    var a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLng/2) * Math.sin(dLng/2)
    ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in m
}

function deg2rad(deg) {
    return deg * (Math.PI/180)
}



/*-------------------------TEST-------------------------*/


function populateDetail() {
    var temp = fs.readFile("poi.json");
    for (let i=0; i<temp.length; i++) {
        temp[i]['gDetail'] = gMaps.getDetail(poi[i]);
    }
    var poiData = JSON.stringify(temp);
    fs.writeFile("poi.json", poiData, function(err) {
        if (err) {
            console.log(err);
        }
    });

}

exports.test = function () {
    //populateDetail();

    /*var stops = [
        {
            location: { //38.7377939,-9.1380037
                lat: 38.7377939,
                lng: -9.1380037
            }
        },
        poi[0],
        poi[1],
        {
            location: {
                lat: 38.736843,
                lng: -9.130750
            }
        }
    ];

    var response = [
        {
            routeName: "Route 1",
            route: null,
            spots:
                []
        }
    ];

    response.route = gMaps.getRoute(stops);

    if (response.spots === undefined) {       //if t=undefined, call tt
        console.log(response.spots)      //call t
    }

    response.spots = [{
        category: poi[0].category,
        place: poi[0].gDetail,
        description: poi[0].description
    }];

    response.spots.push({
        category: poi[1].category,
        place: poi[1].gDetail,
        description: poi[1].description
    });

    var jsonData = JSON.stringify(response);
    fs.writeFile("test.txt", jsonData, function(err) {
        if (err) {
            console.log(err);
        }
    });
    //return response;*/
};
