module.exports = function(app) {

    const poi = require('../controllers/poi.controller.js');

    // Get the poi lists
    app.post('/routes', poi.routes);

};