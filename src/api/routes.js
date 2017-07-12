var express = require('express');
var router = express.Router();

var api100Routes = require('./1.0.0/routes.js');


router.use('/v1.0.0', api100Routes);

module.exports = router;
