// Home controller
const indexController = {
    // Home page route
    index: (req, res) => {
        res.render('index', {
            title: 'ATLAS - AI-Powered Learning Navigator',
            description: 'An integrated academic platform to help students organize, understand, and master their coursework'
        });
    },

    // About page route
    about: (req, res) => {
        res.render('about', {
            title: 'About ATLAS',
            description: 'Learn more about the ATLAS Learning Navigator'
        });
    },

    // Health check endpoint
    healthCheck: (req, res) => {
        res.status(200).json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            service: 'ATLAS Learning Navigator',
            version: '0.1.0',
            uptime: process.uptime()
        });
    }
};

module.exports = indexController;