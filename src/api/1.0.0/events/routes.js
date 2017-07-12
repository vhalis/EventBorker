var express = require('express');

var {
    deleteEventById,
    getEventById,
    getEventsByParams,
    postEvent
} = require('./handlers.js');

var router = express.Router();


router.delete('/id/:id(\\d+)', function(req, res) {
    deleteEventById(req.params.id);
    res.sendStatus(202);
});

// Get everything
router.get('/', function(req, res) {
    getEventsByParams({}, res);
});

// Get by ID
router.get('/id/:id(\\d+)', function(req, res) {
    getEventById(req.params.id, res);
});

// Get by Service ID
router.get('/service/:serviceId', function(req, res) {
    getEventsByParams({serviceId: req.params.serviceId}, res);
});

// Get by Service ID and Type
router.get('/service/:serviceId/type/:type', function(req, res) {
    getEventsByParams(
        {serviceId: req.params.serviceId, type: req.params.type},
        res);
});

router.post('/', function(req, res) {
    postEvent(req.body, res);
});

module.exports = router;
