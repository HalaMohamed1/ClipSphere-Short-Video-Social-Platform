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
