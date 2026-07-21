// Finance Routes
const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const {
    financeOverviewSchema,
    accountSchema,
    debtSchema,
    budgetSchema,
    goalSchema
} = require('../validation/finance.validation');
const validate = require('../middleware/validation');
const authMiddleware = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get finance snapshot for the authenticated user
router.get('/', financeController.getFinanceSnapshot);

// Update finance overview for the authenticated user
router.put('/overview', validate(financeOverviewSchema), financeController.updateFinanceOverview);

// Account management routes
router.post('/accounts', validate(accountSchema), financeController.upsertAccount);
router.put('/accounts/:accountId', validate(accountSchema), financeController.upsertAccount);

// Debt management routes
router.post('/debts', validate(debtSchema), financeController.upsertDebt);
router.put('/debts/:debtId', validate(debtSchema), financeController.upsertDebt);

// Budget management routes
router.post('/budgets', validate(budgetSchema), financeController.upsertBudget);
router.put('/budgets/:budgetId', validate(budgetSchema), financeController.upsertBudget);

// Goal management routes
router.post('/goals', validate(goalSchema), financeController.addGoal);
router.put('/goals/:goalId', validate(goalSchema), financeController.updateGoal);
router.delete('/goals/:goalId', financeController.removeGoal);

module.exports = router;