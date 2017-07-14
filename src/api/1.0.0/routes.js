const express = require('express');
const router = express.Router();

const { namespace } = require('../routes.js');
module.exports = {
    namespace: namespace + '/v1.0.0',
};

const eventsRoutes = require('./events/routes.js');


router.use('/events', eventsRoutes.router);

module.exports.router = router;
