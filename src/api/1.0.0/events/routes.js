const express = require('express');
const router = express.Router();

const { namespace } = require('../routes.js');
module.exports = {
    namespace: namespace + '/events',
};

const {
    deleteEventById,
    getEventById,
    getEvents,
    postEvent,
} = require('./handlers.js');


// Get and Delete by event ID
router.route('/id/:id(\\d+)')
    .get(function(req, res) {
        getEventById(req.params.id, res);
    })
    .delete(function(req, res) {
        deleteEventById(req.params.id, res);
    });

// Get everything or Post a new event
router.route('/')
    .get(function(req, res) {
        getEvents(null, res);
    })
    .post(function(req, res) {
        postEvent(req.body, res);
    });


module.exports.router = router;
