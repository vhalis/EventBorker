const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const socketIO = require('socket.io');

var app = express();

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

// Default server
const server = app.listen(3000, function() {
    /* eslint-disable no-console */
    console.log('EventBorker listening on port 3000');
    /* eslint-enable no-console */
});

// Socket server
const socketServer = socketIO(server);

socketServer.on('connection', (socket) => {
    /* eslint-disable no-console */
    console.log('Client connected');
    socket.on('disconnect', () => console.log('Client disconnected'));
    /* eslint-enable no-console */
});

module.exports = {
    socketServer,
};

// Other routes
const apiRoutes = require('./api/routes.js');
app.use('/api', apiRoutes.router);
