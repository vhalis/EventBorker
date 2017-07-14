var express = require('express');

var {
    deleteEventById,
    getEventById,
    getEventsByParams,
    postEvent
} = require('./handlers.js');

var router = express.Router();


// Get and Delete by event ID
router.route('/id/:id(\\d+)')
    .get(function(req, res) {
        getEventById(req.params.id, res);
    })
    .delete(function(req, res) {
        deleteEventById(req.params.id);
        res.sendStatus(202);
    });

// Get everything or Post a new event
router.route('/')
    .get(function(req, res) {
        getEventsByParams({}, res);
    })
    .post(function(req, res) {
        postEvent(req.body, res);
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


module.exports = router;
