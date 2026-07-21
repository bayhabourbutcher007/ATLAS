// Finance Controller
const FinanceService = require('../services/FinanceService');

class FinanceController {
    /**
     * Get finance snapshot for the authenticated user
     */
    async getFinanceSnapshot(req, res) {
        try {
            const userId = req.user.userId;
            const financeSnapshot = await FinanceService.getFinanceSnapshot(userId);

            res.status(200).json({
                success: true,
                message: 'Finance snapshot retrieved successfully',
                data: financeSnapshot
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve finance snapshot',
                error: error.message
            });
        }
    }

    /**
     * Update finance overview for the authenticated user
     */
    async updateFinanceOverview(req, res) {
        try {
            const userId = req.user.userId;
            const updates = req.body;

            const finance = await FinanceService.updateFinanceOverview(userId, updates);

            res.status(200).json({
                success: true,
                message: 'Finance overview updated successfully',
                data: finance
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to update finance overview',
                error: error.message
            });
        }
    }

    /**
     * Add or update an account
     */
    async upsertAccount(req, res) {
        try {
            const userId = req.user.userId;
            const accountData = req.body;

            const finance = await FinanceService.upsertAccount(userId, accountData);

            res.status(200).json({
                success: true,
                message: 'Account saved successfully',
                data: finance
            });
        } catch (error) {
            if (error.message === 'Finance record not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            res.status(500).json({
                success: false,
                message: 'Failed to save account',
                error: error.message
            });
        }
    }

    /**
     * Add or update a debt
     */
    async upsertDebt(req, res) {
        try {
            const userId = req.user.userId;
            const debtData = req.body;

            const finance = await FinanceService.upsertDebt(userId, debtData);

            res.status(200).json({
                success: true,
                message: 'Debt saved successfully',
                data: finance
            });
        } catch (error) {
            if (error.message === 'Finance record not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            res.status(500).json({
                success: false,
                message: 'Failed to save debt',
                error: error.message
            });
        }
    }

    /**
     * Add or update a budget
     */
    async upsertBudget(req, res) {
        try {
            const userId = req.user.userId;
            const budgetData = req.body;

            const finance = await FinanceService.upsertBudget(userId, budgetData);

            res.status(200).json({
                success: true,
                message: 'Budget saved successfully',
                data: finance
            });
        } catch (error) {
            if (error.message === 'Finance record not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            res.status(500).json({
                success: false,
                message: 'Failed to save budget',
                error: error.message
            });
        }
    }

    /**
     * Add a financial goal
     */
    async addGoal(req, res) {
        try {
            const userId = req.user.userId;
            const goalData = req.body;

            const finance = await FinanceService.addGoal(userId, goalData);

            res.status(201).json({
                success: true,
                message: 'Financial goal added successfully',
                data: finance.goals[finance.goals.length - 1] // Return the newly added goal
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to add financial goal',
                error: error.message
            });
        }
    }

    /**
     * Update a financial goal
     */
    async updateGoal(req, res) {
        try {
            const userId = req.user.userId;
            const { goalId } = req.params;
            const goalData = req.body;

            const updatedGoal = await FinanceService.updateGoal(userId, goalId, goalData);

            res.status(200).json({
                success: true,
                message: 'Financial goal updated successfully',
                data: updatedGoal
            });
        } catch (error) {
            if (error.message === 'Finance record not found' ||
                error.message === 'Goal not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            res.status(500).json({
                success: false,
                message: 'Failed to update financial goal',
                error: error.message
            });
        }
    }

    /**
     * Remove a financial goal
     */
    async removeGoal(req, res) {
        try {
            const userId = req.user.userId;
            const { goalId } = req.params;

            const finance = await FinanceService.removeGoal(userId, goalId);

            res.status(200).json({
                success: true,
                message: 'Financial goal removed successfully',
                data: finance
            });
        } catch (error) {
            if (error.message === 'Finance record not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            res.status(500).json({
                success: false,
                message: 'Failed to remove financial goal',
                error: error.message
            });
        }
    }
}

module.exports = new FinanceController();