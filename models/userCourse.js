const mongoose = require('mongoose');
const userCourse = mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "users"
    },
    courseId: {
        type: mongoose.Types.ObjectId,
        ref: 'courses'
    },
    lastAttempt: {
        type: Number,
        default: 1
    },
    isEligible: {
        type: Boolean,
        default: false
    },
    paymentId: {
        type: String,
        default: ""
    },
    //0==clicked
    //1==eligible
    //2==purchased
    //3==rejection
    //4==not eligible
    //5==expired
    status: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model("usercourse", userCourse);