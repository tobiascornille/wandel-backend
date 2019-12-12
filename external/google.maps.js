const axios = require('axios');
const Promise = require('promise');
const key = require('../key');
const gMapsClient = require('@google/maps').createClient({
    key: key.getKey(),
    Promise: Promise
});

//TODO: Change API calls to build valid url and use axios.get(), and add argument typechecking

function asArray(arg) {
    return Array.isArray(arg) ? arg : [arg];
}

function latLng(arg) {
    if (!arg) {
        return -1;
    } else if (arg.lat != undefined && arg.lng != undefined) {
        arg = [arg.lat, arg.lng];
    } else if (arg.latitude != undefined && arg.longitude != undefined) {
        arg = [arg.latitude, arg.longitude];
    }
    return asArray(arg).join(',');
}

exports.getCoordinates = function(req) {
    //https://maps.googleapis.com/maps/api/place/findplacefromtext/output?parameters
    var requestJSON = {
        input: req,
        inputtype: 'textquery',
        language: 'pt',
        fields: [
            'geometry', 'geometry/location', 'geometry/location/lat',
            'geometry/location/lng', 'name', 'place_id'
        ]
    };
    var url = 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input='+ requestJSON.input + '&inputtype=' + requestJSON.inputtype + '&language=' + requestJSON.language + '&fields=' + requestJSON.fields.toString() + '&key=' + key.getKey();
    console.log('Request URL:\n' + url);
    return url;
    /*console.log('pre-request\n');
    axios.get(url)
        .then((response) => {
            console.log('post-response\n');
            console.log(response.json.results[0]['location']);
            return response.json.results[0]['location'];
        })
        .catch((err) => {
            console.log(err);
        });*/

    /*gMapsClient.findPlace({
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
        });*/
};
exports.getRoute = function(origin, destination, stops) {
    //https://maps.googleapis.com/maps/api/directions/json?destination=38.736843%2C-9.13075&mode=walking&origin=38.7377939%2C-9.1380037&un%20its=metric&waypoints=38.7367036%2C-9.1383635%7C38.736988%2C-9.135464&optimize=true&key=AIzaSyD6h_ZyaegKrsj5GnVfkyO41Ax4DuAzMho
    const originString = `${origin.lat},${origin.lng}`;
    const destinationString = `${destination.lat},${destination.lng}`;
    const mode = "walking";
    const units = "metric";
    const waypointLocations = stops.map(stop => latLng(stop.location));
    const optimize = true;
    const baseUrl = `https://maps.googleapis.com/maps/api/directions/json?destination=${destinationString}&mode=${mode}&origin=${originString}&un%20its=${units}`;
    const url =
    stops > 0
      ? `${baseUrl}&waypoints=${waypointLocations}&optimize=${optimize}`
      : baseUrl;
    return url;

    //console.log('\nRoute Request:\n');
    //console.log(requestJSON);
    /*gMapsClient.directions(requestJSON)
    .asPromise()
    .then((response) => {
        console.log('\nRoute Response:\n');
        console.log(response.json.results);
        return response.json.results;
    })
    .catch((err) => {
        console.log(err);
    });*/
};


//Receives a Point of Interest and returns the place detail
// https://maps.googleapis.com/maps/api/place/nearbysearch/json?parameters
exports.getDetail = function (req) {
    var requestJSON = {
        location: {
            latitude: req.location.lat,
                longitude: req.location.lng
        },
        //radius: 10,
        rankby: 'distance',
        keyword: req.name,
    };
    var url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location='+ requestJSON.location.latitude.toString() + ',' + requestJSON.location.longitude.toString() + '&rankby=' + requestJSON.rankby.toString() + '&keyword=' + requestJSON.keyword.toString() + '&key=' + key.getKey();
    console.log(url);
    /*
    gMapsClient.placesNearby({
        location: {
            latitude: req.location.lat,
            longitude: req.location.lng
        },
        //radius: 10,
        rankby: 'distance',
        keyword: req.name,
    })
        .asPromise()
        .then((response) => {
            //console.log('\nDetail Response:\n');
            console.log(response.json.results[0]);
            return response.json.results[0];
        })
        .catch((err) => {
            console.log(err);
        });
     */
};
