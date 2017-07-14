const API_BASE = 'http://localhost:3000/api';
const CUR_API_VERSION = 'v1.0.0';
const NAMESPACE_BASE = '/api';

const eventsEndpoints = {
    'getOrCreate': () => '',
    'byId': (id) => 'id/' + id,
};

const v100Endpoints = {
    'events': eventsEndpoints,
};

const apiVersions = {
    'v1.0.0': v100Endpoints,
};

const apiErrorMsg = 'Bad parameter provided to API URL: ';
const throwApiError = function(paramName, provided) {
    throw new Error(apiErrorMsg + paramName + ' ' + provided);
};

const getApiUrl = function(version, endpoint, name) {
    if (!(version in apiVersions)) { throwApiError('version', version); }
    const apiEndpoints = apiVersions[version];
    if (!(endpoint in apiEndpoints)) { throwApiError('endpoint', endpoint); }
    const endpointFuncs = apiEndpoints[endpoint];
    if (!(name in endpointFuncs)) { throwApiError('name', name); }
    return API_BASE + '/'
        + version + '/'
        + endpoint + '/'
        + endpointFuncs[name]([...arguments].slice(3)); 
};

const getCurApiUrl = getApiUrl.bind(window, CUR_API_VERSION);

const getApiNamespace = function(version, endpoint) {
    if (!(version in apiVersions)) { throwApiError('version', version); }
    const apiEndpoints = apiVersions[version];
    if (!(endpoint in apiEndpoints)) { throwApiError('endpoint', endpoint); }
    return NAMESPACE_BASE + '/' + version + '/' + endpoint;
};

const getCurApiNamespace = getApiNamespace.bind(window, CUR_API_VERSION);

export {
    API_BASE,
    CUR_API_VERSION,
    NAMESPACE_BASE,

    getApiNamespace,
    getApiUrl,
    getCurApiNamespace,
    getCurApiUrl,
};
