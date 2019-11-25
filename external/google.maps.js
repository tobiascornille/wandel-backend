const gMapsClient = require('@google/maps').createClient({
    key: 'AIzaSyBvACQ0omZMX3ey_8WNkAxGrqrHTJOiKNE'
});

exports.getCoordinates = function (req, res) {
    //TODO: Implement google maps api call
    /*gMapsClient.findPlace({
        input: req,
        inputtype: 'textquery',
        language: 'pt',
        fields: [
            'geometry', 'geometry/location', 'geometry/location/lat',
            'geometry/location/lng', 'icon', 'id', 'name', 'place_id'
        ]
    })
        .then(function (response) {
            //location of the top result
            return response['results'][0]['location'];
        });*/
};

exports.getRoute = function (req, res) {
    //TODO: Implement google maps api call
};

exports.getDetail = function (req, res) {
    //TODO: receive a placeID and return the place detail
}
