// src/models/FinanceSnapshot.js
const mongoose = require('mongoose');

const financeSnapshotSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    timestamp: {
        type: Date,
        required: true,
        index: true
    },
    overview: {
        savingsRate: { type: Number, min: 0, max: 1, default: 0 },
        income: {
            monthly: { type: Number, min: 0, default: 0 }
        },
        expenses: {
            monthly: { type: Number, min: 0, default: 0 }
        },
        netWorth: { type: Number, default: 0 }
    },
    accounts: [{
        balance: { type: Number, default: 0 }
    }],
    debts: [{
        principal: { type: Number, min: 0, default: 0 }
    }]
}, {
    timestamps: true
});

// Compound unique index
financeSnapshotSchema.index({ userId: 1, timestamp: 1 }, { unique: true });

module.exports = mongoose.model('FinanceSnapshot', financeSnapshotSchema);