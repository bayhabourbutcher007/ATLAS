// Configuration file
require('dotenv').config();

const config = {
    // Server configuration
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',

    // Database configuration
    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/atlas',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    },

    // JWT configuration
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    },

    // API configuration
    api: {
        rateLimit: {
            windowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
            max: parseInt(process.env.API_RATE_LIMIT_MAX_REQUESTS) || 100 // limit each IP to 100 requests per windowMs
        }
    },

    // File upload configuration
    upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
        allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'jpg,jpeg,png,pdf,doc,docx,txt').split(',')
    },

    // Feature flags
    features: {
        aiEnabled: process.env.ENABLE_AI_FEATURES === 'true',
        collaborationEnabled: process.env.ENABLE_COLLABORATION === 'true',
        notificationsEnabled: process.env.ENABLE_NOTIFICATIONS === 'true'
    },

    // CORS configuration
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }
};

module.exports = config;