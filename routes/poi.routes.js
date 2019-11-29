module.exports = function(app) {

    const poi = require('../controllers/poi.controller.js');

    app.post('/routes', poi.routes);
    app.get('/test', poi.test);

};