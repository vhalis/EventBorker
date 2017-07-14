const client = require('redis').createClient();

const { socketServer } = require('../../../api-index.js');
const { namespace } = require('./routes.js');

const { EVENT_COUNT_KEY, EVENT_STORE_KEY } = require('./util.js');


const eventsSocket = socketServer.of(namespace);
eventsSocket.on('connection', (socket) => {
    /* eslint-disable no-console */
    console.log(namespace + ' connected');
    socket.on('disconnect', () => console.log(namespace + ' disconnected'));
    /* eslint-enable no-console */
    socket.on('loadall', () => {
        const cb = function(err, redisResponse) {
            socket.emit('alldata', redisResponse);
        };
        getAllEventsRedis(cb);
    });
});

client.on('error', function(err) {
    /* eslint-disable no-console */
    console.log('Redis Error: ' + err);
    /* eslint-enable no-console */
});

const deleteEventById = function(id, httpResponse) {
    client.hdel(EVENT_STORE_KEY, id, (err) => {
        if (!err) {
            eventsSocket.emit('delete', id);
            httpResponse.sendStatus(200);
        }
    });
};

const getEventById = function(id, httpResponse) {
    client.hget(EVENT_STORE_KEY, id, function(err, redisResponse) {
        // Redis responds with null when an invalid key is requested
        // which isn't strictly valid JSON
        httpResponse.json(JSON.parse(redisResponse || '{}'));
    });
};

const getEvents = function(last, httpResponse) {
    if (last == null) {
        // Return all events
        const cb = function(err, redisResponse) {
            httpResponse.json(redisResponse);
        };
        getAllEventsRedis(cb);
    } else {
        // TODO: Paginate with Redis cursor
    }
};

const getAllEventsRedis = function(cb) {
    client.hgetall(EVENT_STORE_KEY, cb);
};

const postEvent = function({serviceId, type, data}, httpResponse) {
    if (!serviceId || !type || !data) {
        httpResponse.sendStatus(400);
        return;
    }
    let dataToStore;
    try {
        dataToStore = JSON.stringify({serviceId, type, data});
    } catch (e) {
        /* eslint-disable no-console */
        console.log('Error in JSON.stringify when posting event.\nError: ' + e);
        /* eslint-enable no-console */
        httpResponse.sendStatus(400);
        return; 
    }

    client.watch(EVENT_COUNT_KEY);
    client.get(EVENT_COUNT_KEY, function(err, res) {
        const eventCount = res == null ? 0 : res;
        client.multi()
            .incr(EVENT_COUNT_KEY)
            .hset(EVENT_STORE_KEY, eventCount, dataToStore)
            .exec(function(err, redisResponse) {
                if (err != null) {
                    httpResponse.sendStatus(500);
                } else if (redisResponse == null) {
                    // Our transaction failed because the event count key was
                    // modified outside of this transaction
                    // Ideally, we should retry
                    httpResponse.sendStatus(500);
                } else {
                    eventsSocket.emit('create', {
                        event: dataToStore,
                        eventId: eventCount,
                    });
                    httpResponse.json({id: eventCount});
                }
            });
    });
};

module.exports = {
    deleteEventById,
    getEventById,
    getEvents,
    postEvent,
};
