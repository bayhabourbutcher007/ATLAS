// Finance Validation Schemas using Joi
const Joi = require('joi');

// Finance overview validation schema
const financeOverviewSchema = Joi.object({
    income: Joi.object({
        monthly: Joi.number().min(0).required(),
        annual: Joi.number().min(0).required(),
        sources: Joi.array().items(Joi.object({
            id: Joi.string().required(),
            description: Joi.string().trim().required(),
            amount: Joi.number().min(0).required(),
            frequency: Joi.string().valid('monthly', 'biweekly', 'weekly', 'one-time').required()
        })).min(0)
    }).required(),
    expenses: Joi.object({
        monthly: Joi.number().min(0).required(),
        annual: Joi.number().min(0).required(),
        categories: Joi.object({
            housing: Joi.number().min(0).required(),
            food: Joi.number().min(0).required(),
            transport: Joi.number().min(0).required(),
            utilities: Joi.number().min(0).required(),
            education: Joi.number().min(0).required(),
            entertainment: Joi.number().min(0).required(),
            health: Joi.number().min(0).required(),
            misc: Joi.number().min(0).required()
        }).required()
    }).required(),
    netWorth: Joi.number(),
    savingsRate: Joi.number().min(0).max(1),
    emergencyFundMonths: Joi.number().min(0)
});

// Account validation schema
const accountSchema = Joi.object({
    id: Joi.string().required(),
    name: Joi.string().trim().required(),
    type: Joi.string().valid('checking', 'savings', 'credit', 'investment', 'loan').required(),
    balance: Joi.number().required(),
    currency: Joi.string().uppercase().length(3).default('USD'),
    institution: Joi.string().trim().allow('', null)
});

// Debt validation schema
const debtSchema = Joi.object({
    id: Joi.string().required(),
    creditor: Joi.string().trim().required(),
    principal: Joi.number().min(0).required(),
    interestRate: Joi.number().min(0).required(), // APR
    minimumPayment: Joi.number().min(0).required(),
    dueDate: Joi.date().iso().allow(null, ''),
    paidOff: Joi.boolean()
});

// Budget validation schema
const budgetSchema = Joi.object({
    id: Joi.string().required(),
    category: Joi.string().trim().required(),
    limit: Joi.number().min(0).required(),
    spent: Joi.number().min(0).default(0),
    period: Joi.string().valid('monthly', 'weekly').required()
});

// Goal validation schema (same as in academic progress but with different types)
const goalSchema = Joi.object({
    title: Joi.string().trim().min(1).max(200).required(),
    description: Joi.string().trim().max(1000).allow('', null),
    type: Joi.string().valid('Savings', 'Investment', 'DebtPayoff', 'Purchase', 'Other').required(),
    targetValue: Joi.number().min(0).required(),
    currentValue: Joi.number().min(0).default(0),
    startDate: Joi.date().iso().allow(null),
    targetDate: Joi.date().iso().allow(null),
    status: Joi.string().valid('NotStarted', 'InProgress', 'Completed', 'Paused', 'Cancelled').default('NotStarted'),
    priority: Joi.string().valid('Low', 'Medium', 'High').default('Medium'),
    completed: Joi.boolean().default(false)
});

module.exports = {
    financeOverviewSchema,
    accountSchema,
    debtSchema,
    budgetSchema,
    goalSchema
};