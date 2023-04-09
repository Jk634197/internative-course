const mongoose = require('mongoose');
const userAttempt = mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "users"
    },
    courseId: {
        type: mongoose.Types.ObjectId,
        ref: 'courses'
    },
    attemptNumber: {
        type: Number,
        default: 1
    },
    totalQuestion: {
        type: Number,
        default: 0
    },
    result: {
        type: Number,
        default: 0
    },
    enrollId: {
        type: mongoose.Types.ObjectId,
        ref: 'usercourse'
    },
    isCleared: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model("userattempt", userAttempt);