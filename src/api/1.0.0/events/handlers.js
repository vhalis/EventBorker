const client = require('redis').createClient();

const { EVENT_COUNT_KEY, EVENT_STORE_KEY } = require('./util.js');


client.on('error', function(err) {
    /* eslint-disable no-console */
    console.log('Redis Error: ' + err);
    /* eslint-enable no-console */
});

const deleteEventById = function(id) {
    client.hdel(EVENT_STORE_KEY, id);
};

const getEventById = function(id, httpResponse) {
    client.hget(EVENT_STORE_KEY, id, function(err, redisResponse) {
        // Redis responds with null when an invalid key is requested
        httpResponse.json(JSON.parse(redisResponse || '{}'));
    });
};

const getEventsByParams = function({serviceId, type}, httpResponse) {
    if (!serviceId && !type) {
        // Return all events
        client.hgetall(EVENT_STORE_KEY, function(err, redisResponse) {
            httpResponse.json(redisResponse);
        });
    }
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
                client.unwatch(EVENT_COUNT_KEY);
                if (err != null) {
                    httpResponse.sendStatus(500);
                } else if (redisResponse == null) {
                    // Our transaction failed because the event count key was
                    // modified outside of this transaction
                    // Ideally, we should retry
                    httpResponse.sendStatus(500);
                } else {
                    httpResponse.json({id: eventCount});
                }
            });
    });
};

module.exports = {
    deleteEventById,
    getEventById,
    getEventsByParams,
    postEvent,
};
