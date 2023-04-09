const mongoose = require('mongoose');
const modulesSchema = mongoose.Schema({
    title: {
        type: String,
        default: ""
    },
    modules: [String],
    courseId: {
        type: mongoose.Types.ObjectId,
        ref: "courses"
    }
}, { timestamps: true });

module.exports = mongoose.model("modules", modulesSchema);