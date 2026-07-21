// API Versioning Middleware
const apiVersion = 'v1';

const versionMiddleware = (req, res, next) => {
    // Set the API version in the request object for use in controllers if needed
    req.apiVersion = apiVersion;

    // Add version to response headers
    res.setHeader('API-Version', apiVersion);

    next();
};

const getApiVersion = () => {
    return `/api/${apiVersion}`;
};

module.exports = {
    versionMiddleware,
    getApiVersion
};