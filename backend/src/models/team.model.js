import mongoose from "mongoose";

const TeamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    competition: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Competition",
        required: true
    },
    leader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    invitationLinks: [{
        code: {
            type: String,
            required: true
        },
        expiresAt: {
            type: Date,
            required: true
        },
        isActive: {
            type: Boolean,
            default: true
        }
    }],
    pendingRequests: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        requestedAt: {
            type: Date,
            default: Date.now
        }
    }],
    maxMembers: {
        type: Number,
        default: 4
    }
}, { timestamps: true });
TeamSchema.index({ name: 1, competition: 1 }, { unique: true });

export const Team = mongoose.model("Team", TeamSchema);