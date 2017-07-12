var express = require('express');
var router = express.Router();

var { getEvent, postEvent } = require('./handlers.js');


router.get('/:type/:serviceId/:data', function(req, res) {
    const eventId = getEvent(req.params);
    res.send(eventId);
});

router.post('/', function(req, res) {
    const eventId = postEvent(req.body);
    res.send(eventId);
});

module.exports = router;
