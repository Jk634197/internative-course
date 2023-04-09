const mongoose = require('mongoose');
const questionSchema = mongoose.Schema({
    question: {
        type: String
    },
    options: [
        String
    ],
    answer: String,
    courseId: {
        type: mongoose.Types.ObjectId,
        ref: "courses"
    }
}, { timestamps: true });

module.exports = mongoose.model("question", questionSchema);