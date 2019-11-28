const Promise = require('promise');
const gMapsClient = require('@google/maps').createClient({
    key: 'AIzaSyBvACQ0omZMX3ey_8WNkAxGrqrHTJOiKNE',
    Promise: Promise
});

exports.getCoordinates = function (req) {
    gMapsClient.findPlace({
        input: req,
        inputtype: 'textquery',
        language: 'pt',
        fields: [
            'geometry', 'geometry/location', 'geometry/location/lat',
            'geometry/location/lng', 'icon', 'id', 'name', 'place_id'
        ]
    })
        .asPromise()
        .then((response) => {
            console.log(response.json.results[0]['location']);
            return response.json.results[0]['location'];
        })
        .catch((err) => {
            console.log(err);
        });
};

exports.getRoute = function (req) {
    var nStops = req.length;
    var waypointLocations = [];
    for (let i=1; i<(req.length-1); i++) {
        waypointLocations.push(req[i]['location']);
    }
    gMapsClient.directions({
        origin: req[0].location,
        destination: req[nStops-1].location,
        travelMode: 'WALKING',
        unitSystem: 'METRIC',
        waypoints: waypointLocations,
        optimizeWaypoints: true
    })
        .asPromise()
        .then((response) => {
            console.log(response.json.results);
            return response.json.results.routes[0]
        })
        .catch((err) => {
            console.log(err);
        });
};

//Receives a Point of Interest and returns the place detail
exports.getDetail = function (req) {
    gMapsClient.findPlace({
        location: {
            latitude: req.location.lat,
            longitude: req.location.lng
        },
        keyword: req.name,
        rankby: 'distance',
        fields: [
            'geometry', 'geometry/location', 'geometry/location/lat',
            'geometry/location/lng', 'icon', 'id', 'name', 'place_id'
        ]
    })
        .asPromise()
        .then((response) => {
            console.log(response.json.results[0]);
            return response.json.results[0];
        })
        .catch((err) => {
            console.log(err);
        });
};
