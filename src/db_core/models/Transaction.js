import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    stripePaymentId: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    }
}, {
    timestamps: true
});

// Index for efficient filtering by status and creation date
transactionSchema.index({ status: 1, createdAt: -1 });

// Index for efficient querying by sender
transactionSchema.index({ sender: 1, createdAt: -1 });

// Index for efficient querying by recipient
transactionSchema.index({ recipient: 1, createdAt: -1 });

// Unique index on stripePaymentId (enforces uniqueness)
transactionSchema.index({ stripePaymentId: 1 }, { unique: true });

transactionSchema.statics.getPendingBalanceByCreator = async function(creatorId) {
    return this.aggregate([
        {
            $match: {
                recipient: new mongoose.Types.ObjectId(creatorId),
                status: 'pending'
            }
        },
        {
            $group: {
                _id: '$recipient',
                totalPendingBalance: { $sum: '$amount' },
                transactionCount: { $sum: 1 }
            }
        }
    ]);
};

export const Transaction = mongoose.model('Transaction', transactionSchema);
