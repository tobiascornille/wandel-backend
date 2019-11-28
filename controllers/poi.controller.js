const gMaps = require('../external/google.maps');

//This module implements all logic of choosing which POI(s) to visit

var poi = [
    {
        location:
            {
                lat:  38.7367036,
                lng:  -9.1383635
            },
        name: "Frankie's Hot Dogs",
        category: ['restaurant'],
        description: "",
        gDetail: null
    },
    {
        location:
            {
                lat:  38.736988,
                lng:  -9.135464
            },
        name: "Alameda Park",
        category: ['park'],
        description: "",
        gDetail: null
    }
];

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

    //TODO: add spot information from the poi list to the res object

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

exports.test = function () {
    populateDetail();

    var stops = [
        {},
        poi[0],
        poi[1],
        {}
    ];

    var response = [
        {
            "routeName": "Route 1",
            "route": gMaps.getRoute(stops),
            "spots":
                []
        }
    ];

    response.spots[0] = {
        category: poi[0].category,
        place: poi[0].gDetail,
        description: poi[0].description
    };

    response.spots[1] = {
        category: poi[1].category,
        place: poi[1].gDetail,
        description: poi[1].description
    };

    return response;
};

function populateDetail() {
    for (let i=0; i<poi.length; i++) {
        poi[i]['gDetail'] = gMaps.getDetail(poi[i]);
    }
}