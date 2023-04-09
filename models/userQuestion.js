const mongoose = require('mongoose');
const userQuestion = mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'users'
    },
    question: {
        type: String
    },
    answer: {
        type: String,
        default: ""
    },
    isTrue: {
        type: Boolean,
        default: false
    },
    attemptId: {
        type: mongoose.Types.ObjectId,
        ref: "userattempt"
    }
}, { timestamps: true });

module.exports = mongoose.model("userquestion", userQuestion);