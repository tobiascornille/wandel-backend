//This module implements all logic of choosing which POI(s) to visit

/*
poiList receives a request of structure:
{
   "origin": {
             "lat": 41.43206,
             "lng": -81.38992
   },
   "destination": {
             "lat": 56.43206,
             "lng": -85.38992
   },
   "preferences": {
     "Street Art": true,
     "Architecture": true,
     "Museums": false,
     "Viewpoints": false,
     "Local Cuisine": true,
     "Parks": true
   }
}

and returns a set of 3 lists of poi,
each set is bigger than the previous one and each set is contained by the following set.
*/
exports.poiList = function (request) {
    //TODO: poi selection logic
    //return list;
};

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