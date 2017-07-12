var express = require('express');
var router = express.Router();

var eventsRoutes = require('./events/routes.js');


router.use('/events', eventsRoutes);

module.exports = router;
