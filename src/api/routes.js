// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'ATLAS Learning Navigator API',
        version: req.apiVersion
    });
});

// Root API endpoint
router.get('/', (req, res) => {
    res.json({
        message: 'Welcome to ATLAS Learning Navigator API',
        version: req.apiVersion,
        documentation: '/api/docs',
        endpoints: {
            health: '/health',
            auth: '/auth',
            users: '/users',
            academicProgress: '/academic-progress',
            notebook: '/notebook',
            knowledgeGraph: '/knowledge-graph',
            planner: '/planner',
            quiz: '/quiz',
            progress: '/progress',
            collab: '/collab',
            finance: '/finance',
            skills: '/skills'
        }
    });
});

// Auth routes
router.use('/auth', require('./auth'));

// User routes
router.use('/users', require('../routes/users'));

// Academic Progress routes
router.use('/academic-progress', require('../routes/academicProgress'));

// Finance routes
router.use('/finance', require('../routes/finance'));

// Skills routes
router.use('/skills', require('../routes/skill'));

// Notebook routes
router.use('/notebook', require('./notebook'));

// Knowledge graph routes
router.use('/knowledge-graph', require('./knowledgeGraph'));

// Study planner routes
router.use('/planner', require('./planner'));

// Quiz routes
router.use('/quiz', require('./quiz'));

// Progress tracking routes
router.use('/progress', require('./progress'));

// Collaboration routes
router.use('/collab', require('./collaboration'));

// 404 handler for API routes
router.use((req, res) => {
    res.status(404).json({
        error: 'Not found',
        message: `API endpoint ${req.originalUrl} not found`,
        version: req.apiVersion
    });
});

module.exports = router;