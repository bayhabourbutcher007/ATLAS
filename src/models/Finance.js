// Finance model
const mongoose = require('mongoose');

const financeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // Financial overview
    overview: {
        income: {
            monthly: { type: Number, default: 0 },
            annual: { type: Number, default: 0 },
            sources: [{
                id: { type: String, required: true },
                description: { type: String, trim: true },
                amount: { type: Number, required: true, min: 0 },
                frequency: {
                    type: String,
                    enum: ['monthly', 'biweekly', 'weekly', 'one-time'],
                    required: true
                }
            }]
        },
        expenses: {
            monthly: { type: Number, default: 0 },
            annual: { type: Number, default: 0 },
            categories: {
                housing: { type: Number, default: 0, min: 0 },
                food: { type: Number, default: 0, min: 0 },
                transport: { type: Number, default: 0, min: 0 },
                utilities: { type: Number, default: 0, min: 0 },
                education: { type: Number, default: 0, min: 0 },
                entertainment: { type: Number, default: 0, min: 0 },
                health: { type: Number, default: 0, min: 0 },
                misc: { type: Number, default: 0, min: 0 }
            }
        },
        netWorth: { type: Number, default: 0 },
        savingsRate: { type: Number, min: 0, max: 1, default: 0 },
        emergencyFundMonths: { type: Number, default: 0 }
    },

    // Financial accounts
    accounts: [{
        id: { type: String, required: true },
        name: { type: String, required: true, trim: true },
        type: {
            type: String,
            enum: ['checking', 'savings', 'credit', 'investment', 'loan'],
            required: true
        },
        balance: { type: Number, required: true },
        currency: { type: String, default: 'USD', uppercase: true },
        institution: { type: String, trim: true },
        lastUpdated: { type: Date, default: Date.now }
    }],

    // Debts/loans
    debts: [{
        id: { type: String, required: true },
        creditor: { type: String, required: true, trim: true },
        principal: { type: Number, required: true, min: 0 },
        interestRate: { type: Number, required: true, min: 0 }, // APR
        minimumPayment: { type: Number, required: true, min: 0 },
        dueDate: { type: Date },
        paidOff: { type: Boolean, default: false }
    }],

    // Budgets
    budgets: [{
        id: { type: String, required: true },
        category: { type: String, required: true, trim: true },
        limit: { type: Number, required: true, min: 0 },
        spent: { type: Number, default: 0, min: 0 },
        period: {
            type: String,
            enum: ['monthly', 'weekly'],
            required: true
        }
    }],

    // Financial goals
    goals: [{
        id: { type: String },
        title: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        type: {
            type: String,
            enum: ['Savings', 'Investment', 'DebtPayoff', 'Purchase', 'Other'],
            required: true
        },
        targetValue: { type: Number, required: true, min: 0 },
        currentValue: { type: Number, default: 0, min: 0 },
        startDate: { type: Date },
        targetDate: { type: Date },
        status: {
            type: String,
            enum: ['NotStarted', 'InProgress', 'Completed', 'Paused', 'Cancelled'],
            default: 'NotStarted'
        },
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High'],
            default: 'Medium'
        },
        completed: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
    }],

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Indexes for better query performance
financeSchema.index({ userId: 1 });
financeSchema.index({ 'accounts.id': 1 });
financeSchema.index({ 'debts.id': 1 });
financeSchema.index({ 'budgets.id': 1 });
financeSchema.index({ 'goals.id': 1 });

// Middleware to update the updatedAt timestamp
financeSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Method to calculate net worth
financeSchema.methods.calculateNetWorth = function() {
    const totalAssets = this.accounts.reduce((sum, account) =>
        sum + Math.max(0, account.balance), 0); // Only positive balances count as assets

    const totalLiabilities = this.debts.reduce((sum, debt) =>
        !debt.paidOff ? sum + debt.principal : sum, 0);

    return totalAssets - totalLiabilities;
};

// Method to calculate monthly savings rate
financeSchema.methods.calculateSavingsRate = function() {
    const monthlyIncome = this.overview.income.monthly;
    const monthlyExpenses = this.overview.expenses.monthly;

    if (monthlyIncome <= 0) return 0;

    const savings = Math.max(0, monthlyIncome - monthlyExpenses);
    return savings / monthlyIncome;
};

module.exports = mongoose.model('Finance', financeSchema);