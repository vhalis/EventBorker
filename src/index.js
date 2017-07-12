const express = require('express');
const bodyParser = require('body-parser');
var app = express();

var apiRoutes = require('./api/routes.js');


// Global Middleware
// Put posted JSON in the body of the request
app.use(bodyParser.json());

// Routes
app.get('/', function(req, res) {
    res.send('hello world');
});

app.use('/api', apiRoutes);

// Default server
app.listen(3000, function() {
    /* eslint-disable no-console */
    console.log('EventBorker listening on port 3000');
    /* eslint-enable no-console */
});
