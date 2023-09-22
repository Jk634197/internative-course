const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const userAdminSchema = mongoose.Schema({
    email: {
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
    password: {
        type: String,
        default: ""
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    //0==administrator
    //1==employee
    role: {
        type: Number,
        default: 1
    }
}, { timestamps: true });
userAdminSchema.pre('save', async function (next) {
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
module.exports = mongoose.model("adminusers", userAdminSchema);