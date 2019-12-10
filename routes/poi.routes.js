module.exports = function(app) {

    const poi = require('../controllers/poi.controller.js');
    app.post('/routes', poi.getRoutes);
    app.get('/test', poi.test);

};