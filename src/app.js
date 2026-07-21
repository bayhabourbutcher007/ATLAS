// Updated app.js with API versioning and centralized error handling
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const methodOverride = require('method-override');
const apiVersionMiddleware = require('./middleware/apiVersionMiddleware');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(apiVersionMiddleware); // API versioning middleware

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/atlas', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// API v1 routes with version middleware
app.use('/api/v1', apiVersionMiddleware, require('./api/routes'));

// API root endpoint (for backward compatibility or basic info)
app.use('/api', (req, res) => {
    res.json({
        message: 'ATLAS Learning Navigator API',
        version: 'v1',
        documentation: '/api/v1/docs',
        endpoints: {
            health: '/api/v1/health',
            academicProgress: '/api/v1/academic-progress'
            // Other endpoints will be added as modules are implemented
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '..', 'public', '404.html'));
});

// Error handling middleware (must be after all routes)
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`ATLAS server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;