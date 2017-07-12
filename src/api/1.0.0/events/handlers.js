
// Make a class?

const getEvent = function({type, serviceId, data}) {
    console.log({type, serviceId, data});
    return 200;
};

const postEvent = function({type, serviceId, data}) {
    return getEvent({type, serviceId, data});
};

module.exports = {
    getEvent,
    postEvent,
};
