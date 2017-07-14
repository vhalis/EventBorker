const express = require('express');
const router = express.Router();

const namespace = '/api';
module.exports = {
    namespace,
};

const api100Routes = require('./1.0.0/routes.js');


router.use('/v1.0.0', api100Routes.router);

module.exports.router = router;
