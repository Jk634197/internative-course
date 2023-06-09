const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const userSchema = mongoose.Schema({
    email: {
        type: String,
        default: ""
    },
    image: {
        type: String,
        default: ""
    },
    mobileNo: {
        type: String,
        default: ""
    },
    first: {
        type: String,
        default: ""
    },
    last: {
        type: String,
        default: ""
    },
    birthDate: {
        type: String,
        default: ""
    },
    password: {
        type: String,
        default: ""
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });
userSchema.pre('save', async function (next) {
    try {
        if (this.password != undefined) {
            const salt = await bcrypt.genSalt(10);
            const hashedpassword = await bcrypt.hash(this.password, salt);
            this.password = hashedpassword;
        }
        next();
        //console.log("before called");
    }
    catch (error) {
        next(error)
    }
});
module.exports = mongoose.model("user", userSchema);