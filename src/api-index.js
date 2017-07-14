const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

var app = express();

var apiRoutes = require('./api/routes.js');


// Global Middleware
// Put posted JSON in the body of the request
app.use(bodyParser.json());

// Static file directory, for dashboard
const staticDir = path.join(__dirname, '../build');
app.use(express.static(staticDir));

// Allow CORS on all API endpoints
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods", "DELETE,GET,POST");
    next();
});

// Routes
app.get('/', function(req, res) {
    res.sendFile(staticDir + '/index.html');
});

app.use('/api', apiRoutes);

// Default server
app.listen(3000, function() {
    /* eslint-disable no-console */
    console.log('EventBorker listening on port 3000');
    /* eslint-enable no-console */
});
