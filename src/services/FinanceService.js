// Finance Service
const Finance = require('../models/Finance');
const FinanceSnapshot = require('../models/FinanceSnapshot');

class FinanceService {
    /**
     * Get finance snapshot for a user - returns DTO matching FinanceDTO format
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Finance DTO object
     */
    async getFinanceSnapshot(userId) {
        let finance = await Finance.findOne({ userId });

        // If no finance record exists, create one with default values
        if (!finance) {
            finance = new Finance({ userId });
            await finance.save();
        }

        // Convert to plain object and return DTO
        const financeObj = finance.toObject();

        // Transform to match the exact DTO structure from CONTEXT_SCHEMA.md
        const dto = {
            overview: {
                income: {
                    monthly: financeObj.overview.income.monthly,
                    annual: financeObj.overview.income.annual,
                    sources: financeObj.overview.income.sources.map(source => ({
                        id: source.id,
                        description: source.description,
                        amount: source.amount,
                        frequency: source.frequency
                    }))
                },
                expenses: {
                    monthly: financeObj.overview.expenses.monthly,
                    annual: financeObj.overview.expenses.annual,
                    categories: {
                        housing: financeObj.overview.expenses.categories.housing,
                        food: financeObj.overview.expenses.categories.food,
                        transport: financeObj.overview.expenses.categories.transport,
                        utilities: financeObj.overview.expenses.categories.utilities,
                        education: financeObj.overview.expenses.categories.education,
                        entertainment: financeObj.overview.expenses.categories.entertainment,
                        health: financeObj.overview.expenses.categories.health,
                        misc: financeObj.overview.expenses.categories.misc
                    }
                },
                netWorth: financeObj.overview.netWorth,
                savingsRate: financeObj.overview.savingsRate,
                emergencyFundMonths: financeObj.overview.emergencyFundMonths
            },
            accounts: financeObj.accounts.map(account => ({
                id: account.id,
                name: account.name,
                type: account.type,
                balance: account.balance,
                currency: account.currency,
                institution: account.institution,
                lastUpdated: account.lastUpdated
            })),
            debts: financeObj.debts.map(debt => ({
                id: debt.id,
                creditor: debt.creditor,
                principal: debt.principal,
                interestRate: debt.interestRate,
                minimumPayment: debt.minimumPayment,
                dueDate: debt.dueDate,
                paidOff: debt.paidOff
            })),
            budgets: financeObj.budgets.map(budget => ({
                id: budget.id,
                category: budget.category,
                limit: budget.limit,
                spent: budget.spent,
                period: budget.period
            })),
            goals: financeObj.goals.map(goal => ({
                id: goal.id || goal._id.toString(),
                title: goal.title,
                description: goal.description,
                type: goal.type,
                targetValue: goal.targetValue,
                currentValue: goal.currentValue,
                startDate: goal.startDate,
                targetDate: goal.targetDate,
                status: goal.status,
                priority: goal.priority,
                completed: goal.completed,
                createdAt: goal.createdAt,
                updatedAt: goal.updatedAt
            }))
        };

        return dto;
    }

    /**
     * Update finance overview for a user
     * @param {string} userId - User ID
     * @param {Object} updates - Data to update
     * @returns {Promise<Object>} Updated finance document
     */
    async updateFinanceOverview(userId, updates) {
        const finance = await Finance.findOneAndUpdate(
            { userId },
            { $set: { ...updates, updatedAt: new Date() } },
            { new: true, runValidators: true, upsert: true }
        );

        return finance;
    }

    /**
     * Add or update an account
     * @param {string} userId - User ID
     * @param {Object} accountData - Account data
     * @returns {Promise<Object>} Updated finance document
     */
    async upsertAccount(userId, accountData) {
        const finance = await Finance.findOne({ userId });
        if (!finance) {
            throw new Error('Finance record not found');
        }

        // Check if account exists
        const accountIndex = finance.accounts.findIndex(acc => acc.id === accountData.id);

        if (accountIndex !== -1) {
            // Update existing account
            finance.accounts[accountIndex] = {
                ...finance.accounts[accountIndex].toObject(),
                ...accountData,
                updatedAt: new Date()
            };
        } else {
            // Add new account
            finance.accounts.push({
                ...accountData,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        await finance.save();
        return finance;
    }

    /**
     * Add or update a debt
     * @param {string} userId - User ID
     * @param {Object} debtData - Debt data
     * @returns {Promise<Object>} Updated finance document
     */
    async upsertDebt(userId, debtData) {
        const finance = await Finance.findOne({ userId });
        if (!finance) {
            throw new Error('Finance record not found');
        }

        // Check if debt exists
        const debtIndex = finance.debts.findIndex(debt => debt.id === debtData.id);

        if (debtIndex !== -1) {
            // Update existing debt
            finance.debts[debtIndex] = {
                ...finance.debts[debtIndex].toObject(),
                ...debtData,
                updatedAt: new Date()
            };
        } else {
            // Add new debt
            finance.debts.push({
                ...debtData,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        await finance.save();
        return finance;
    }

    /**
     * Add or update a budget
     * @param {string} userId - User ID
     * @param {Object} budgetData - Budget data
     * @returns {Promise<Object>} Updated finance document
     */
    async upsertBudget(userId, budgetData) {
        const finance = await Finance.findOne({ userId });
        if (!finance) {
            throw new Error('Finance record not found');
        }

        // Check if budget exists
        const budgetIndex = finance.budgets.findIndex(budget => budget.id === budgetData.id);

        if (budgetIndex !== -1) {
            // Update existing budget
            finance.budgets[budgetIndex] = {
                ...finance.budgets[budgetIndex].toObject(),
                ...budgetData,
                updatedAt: new Date()
            };
        } else {
            // Add new budget
            finance.budgets.push({
                ...budgetData,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        await finance.save();
        return finance;
    }

    /**
     * Add a financial goal
     * @param {string} userId - User ID
     * @param {Object} goalData - Goal data
     * @returns {Promise<Object>} Updated finance document
     */
    async addGoal(userId, goalData) {
        const finance = await Finance.findOneAndUpdate(
            { userId },
            {
                $push: { goals: goalData },
                $set: { updatedAt: new Date() }
            },
            { new: true, runValidators: true }
        );

        if (!finance) {
            throw new Error('Finance record not found');
        }

        return finance;
    }

    /**
     * Update a financial goal
     * @param {string} userId - User ID
     * @param {string} goalId - Goal ID to update
     * @param {Object} goalData - Updated goal data
     * @returns {Promise<Object>} Updated goal object
     */
    async updateGoal(userId, goalId, goalData) {
        const finance = await Finance.findOne({ userId });
        if (!finance) {
            throw new Error('Finance record not found');
        }

        // Find the goal index
        const goalIndex = finance.goals.findIndex(goal =>
            (goal.id || goal._id.toString()) === goalId
        );

        if (goalIndex === -1) {
            throw new Error('Goal not found');
        }

        // Update the goal
        finance.goals[goalIndex] = {
            ...finance.goals[geneIndex].toObject(),
            ...goalData,
            updatedAt: new Date()
        };

        // Save the updated finance
        await finance.save();

        return finance.goals[goalIndex];
    }

    /**
     * Remove a financial goal
     * @param {string} userId - User ID
     * @param {string} goalId - Goal ID to remove
     * @returns {Promise<Object>} Updated finance document
     */
    async removeGoal(userId, goalId) {
        const finance = await Finance.findOneAndUpdate(
            { userId },
            {
                $pull: { goals: { id: goalId } },
                $set: { updatedAt: new Date() }
            },
            { new: true }
        );

        if (!finance) {
            throw new Error('Finance record not found');
        }

        return finance;
    }

    /**
     * Get finance history for a user - returns array of finance DTOs
     * @param {string} userId - User ID
     * @param {Object} options - { startDate, endDate, interval, aggregation }
//Note: In Phase 3A, we only support raw interval (no aggregation)
     * @returns {Promise<Array>} Array of finance DTO objects
     */
    async getFinanceHistory(userId, options = {}) {
        const startDate = options.startDate ? new Date(options.startDate) : undefined;
        const endDate = options.endDate ? new Date(options.endDate) : new Date();
        let start = startDate;
        let end = endDate;
        if (!start) {
            start = new Date(end);
        }
        if (start.getTime() > end.getTime()) {
            const temp = start;
            start = end;
            end = temp;
        }
        // We only support raw interval in Phase 3A
        const query = {
            userId,
            timestamp: {
                $gte: start,
                $lte: end
            }
        };
        // Sort by timestamp ascending
        const snapshots = await FinanceSnapshot.find(query).sort({ timestamp: 1 });

        // Build DTO for each snapshot (mirroring getFinanceSnapshot logic)
        return snapshots.map(snap => {
            const obj = snap.toObject();
            return {
                overview: {
                    income: {
                        monthly: obj.overview.income.monthly,
                        annual: obj.overview.income.annual,
                        sources: obj.overview.income.sources.map(source => ({
                            id: source.id,
                            description: source.description,
                            amount: source.amount,
                            frequency: source.frequency
                        }))
                    },
                    expenses: {
                        monthly: obj.overview.expenses.monthly,
                        annual: obj.overview.expenses.annual,
                        categories: {
                            housing: obj.overview.expenses.categories.housing,
                            food: obj.overview.expenses.categories.food,
                            transport: obj.overview.expenses.categories.transport,
                            utilities: obj.overview.expenses.categories.utilities,
                            education: obj.overview.expenses.categories.education,
                            entertainment: obj.overview.expenses.categories.entertainment,
                            health: obj.overview.expenses.categories.health,
                            misc: obj.overview.expenses.categories.misc
                        }
                    },
                    netWorth: obj.overview.netWorth,
                    savingsRate: obj.overview.savingsRate,
                    emergencyFundMonths: obj.overview.emergencyFundMonths
                },
                accounts: obj.accounts.map(account => ({
                    id: account.id,
                    name: account.name,
                    type: account.type,
                    balance: account.balance,
                    currency: account.currency,
                    institution: account.institution,
                    lastUpdated: account.lastUpdated
                })),
                debts: obj.debts.map(debt => ({
                    id: debt.id,
                    creditor: debt.creditor,
                    principal: debt.principal,
                    interestRate: debt.interestRate,
                    minimumPayment: debt.minimumPayment,
                    dueDate: debt.dueDate,
                    paidOff: debt.paidOff
                })),
                budgets: obj.budgets.map(budget => ({
                    id: budget.id,
                    category: bucket.category,
                    limit: budget.limit,
                    spent: budget.spent,
                    period: budget.period
                })),
                goals: obj.goals.map(goal => ({
                    id: goal.id || goal._id.toString(),
                    title: goal.title,
                    description: goal.description,
                    type: goal.type,
                    targetValue: goal.targetValue,
                    currentValue: goal.currentValue,
                    startDate: goal.startDate ? new Date(goal.startDate).toISOString() : null,
                    targetDate: goal.targetDate ? new Date(goal.targetDate).toISOString() : null,
                    status: goal.status,
                    priority: goal.priority,
                    completed: goal.completed,
                    createdAt: goal.createdAt,
                    updatedAt: goal.updatedAt
                }))
            };
        });
    }
}

module.exports = new FinanceService();