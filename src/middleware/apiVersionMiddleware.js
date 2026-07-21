// API Versioning Middleware
const API_VERSION = 'v1';

const apiVersionMiddleware = (req, res, next) => {
    // Set the API version on the request object for use in controllers and responses
    req.apiVersion = API_VERSION;

    // Also set it in the response headers for clients
    res.setHeader('API-Version', API_VERSION);

    next();
};

module.exports = apiVersionMiddleware;