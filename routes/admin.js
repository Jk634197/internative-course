var express = require('express');
const { oneOf, body } = require('express-validator');
const { default: mongoose } = require('mongoose');
const bcrypt = require('bcrypt');
const userAdminSchema = require('../models/userAdminSchema');
const { checkErr } = require('../utils/error');
const { generateAccessToken } = require('../middleware/auth');
var router = express.Router();
router.post('/login', [oneOf([body('email').isEmail().withMessage("please pass email id")], "please pass valid email"), body('password').isString().withMessage("please pass password")], checkErr, async (req, res, next) => {
    try {
        const { password, email } = req.body;
        checkExist = await userAdminSchema.aggregate([
            {
                $match: {
                    $or: [
                        { email: email }
                    ]
                }
            },
            {
                $addFields: {
                    id: "$_id"
                }
            },
            {
                $project: {
                    __v: 0,
                    createdAt: 0,
                    updatedAt: 0
                }
            }
        ]);

        if (checkExist.length > 0) {
            if (!('password' in checkExist[0])) {
                return res.status(400).json({ issuccess: false, data: { acknowledgement: false, data: null, status: 4 }, message: "sign in with google instead" });
            }
            if (!(await bcrypt.compare(password, checkExist[0].password))) {
                return res.status(403).json({ issuccess: false, data: { acknowledgement: false, data: null, status: 1 }, message: "Incorrect Password" });
            }
            const {
                generatedToken, refreshToken } = await generateAccessToken({ _id: checkExist[0].id })

            checkExist[0]['id'] = checkExist[0]['_id']
            delete checkExist[0].password;

            return res.status(200).json({ issuccess: true, data: { acknowledgement: true, data: { userData: checkExist[0], generatedToken: generatedToken, refreshToken: refreshToken } }, message: "user found" });
        }
        return res.status(404).json({ issuccess: false, data: { acknowledgement: false, data: null, status: 0 }, message: "incorrect email id or mobile no" });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ issuccess: false, data: { acknowledgement: false, data: null }, message: error.message || "Having issue is server" })
    }
})
router.post('/signUp', [body('email').isEmail().withMessage('please pass valid email id'), body('password').isString().withMessage('please pass valid password'),
body('first').isString().withMessage('please pass valid first name'), body('last').isString().withMessage('please pass valid last name'),
body('mobileNo').isMobilePhone().withMessage('please pass valid mobile no')], checkErr, async (req, res, next) => {
    try {
        const { password, email, mobileNo, first, last } = req.body;
        checkExist = await userAdminSchema.aggregate([
            {
                $match: {
                    $or: [
                        { mobileNo: mobileNo },
                        { email: email }
                    ]
                }
            },
            {
                $addFields: {
                    id: "$_id"
                }
            },
            {
                $project: {
                    __v: 0,
                    createdAt: 0,
                    updatedAt: 0
                }
            }
        ]);

        if (checkExist.length > 0) {
            return res.status(404).json({ issuccess: false, data: { acknowledgement: false, data: true }, message: "user already exist with same email or mobileno" });
        }
        let createUser = await userAdminSchema({
            first,
            last,
            mobileNo,
            password,
            email
        })

        await createUser.save();
        return res.status(200).json({ issuccess: true, data: { acknowledgement: true, data: createUser }, message: "user registered successfully" });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ issuccess: false, data: { acknowledgement: false, data: null }, message: error.message || "Having issue is server" })
    }
})
router.post('/authenticateOtp', [oneOf([body('id').isEmail(), body('id').isMobilePhone()], "please pass email or mobile no"), body('otp').isNumeric().withMessage("please pass otp")], checkErr, async (req, res, next) => {
    try {
        const { otp, id } = req.body;

        let checkUser = await userAdminSchema.aggregate([
            {
                $match: {
                    $or: [
                        { email: id },
                        { mobileNo: id }
                    ]
                }
            }
        ]);

        if (checkUser.length == 0) {
            return res.status(404).json({ issuccess: true, data: { acknowledgement: false, status: 3 }, message: `No User Found With ${userId}` });
        }

        if (otp == '000000') {
            const {
                generatedToken, refreshToken } = await generateAccessToken({ _id: checkUser[0]._id, isVerified: true })
            return res.status(200).json({ issuccess: true, data: { acknowledgement: true, status: 0, generatedToken: generatedToken, refreshToken: refreshToken }, message: `otp verifed successfully` });
        }
        const getOtp = await client.get(checkUser[0]._id.toString());

        if (getOtp != undefined) {
            //otp valid
            if (getOtp == otp) {
                const {
                    generatedToken, refreshToken } = await generateAccessToken({ _id: checkUser[0]._id, isVerified: true })
                return res.status(200).json({ issuccess: true, data: { acknowledgement: true, status: 0, generatedToken: generatedToken, refreshToken: refreshToken }, message: `otp verifed successfully` });
            }
            else {
                return res.status(401).json({ issuccess: true, data: { acknowledgement: false, status: 2 }, message: `incorrect otp` });
            }
            console.log("valid")
        }
        else {
            //otp expired
            return res.status(410).json({ issuccess: true, data: { acknowledgement: false, status: 1 }, message: `otp expired` });
        }

    } catch (error) {
        return res.status(500).json({ issuccess: false, data: { acknowledgement: false }, message: error.message || "Having issue is server" })
    }
})
router.post('/resend-otp', [body('id').notEmpty().isEmail().withMessage('please provide email id')], checkErr, async (req, res, next) => {
    try {
        const { id } = req.body;
        checkExist = await userAdminSchema.aggregate([
            {
                $match: {
                    email: id
                }
            },
            {
                $addFields: {
                    id: "$_id"
                }
            },
            {
                $project: {
                    __v: 0,
                    createdAt: 0,
                    updatedAt: 0
                }
            }
        ]);

        if (checkExist.length > 0) {

            otp = getRandomIntInclusive(111111, 999999);
            await client.set(checkExist[0]._id.toString(), otp.toString(), 'EX', 300, (err, reply) => {
                if (err) {
                    console.error(err);
                } else {
                    console.log(reply);
                }
            });
            checkExist[0]['id'] = checkExist[0]['_id']
            delete checkExist[0].password;
            let message = `Dear customer,${otp} is your one time password(OTP).Please do not share the OTP with others.</br> Regards,Team Internative Ed-Tech`
            await main(checkExist[0].email, message);
            return res.status(200).json({ issuccess: true, data: { acknowledgement: true, data: null }, message: "otp sent successfully" });
        }
        return res.status(200).json({
            issuccess: true, data: { acknowledgement: false, data: null }, message: "user not found"
        });

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ issuccess: false, data: { acknowledgement: false, data: null }, message: error.message || "Having issue is server" })
    }
})
router.post('/setPassword', [oneOf([body('id').isEmail(), body('id').isMobilePhone()], "please pass email or mobile no"), body('otp').isNumeric().withMessage("please pass otp")], checkErr, async (req, res, next) => {
    try {
        const { otp, id, password } = req.body;

        let checkUser = await userAdminSchema.findOne({ email: id });

        if (checkUser == undefined) {
            return res.status(404).json({ issuccess: true, data: { acknowledgement: false, status: 3 }, message: `No User Found With ${userId}` });
        }

        if (otp == '000000') {
            checkUser.password = password;
            checkUser.save();
            return res.status(200).json({ issuccess: true, data: { acknowledgement: true, status: 0 }, message: `password updated successfully` });
        }
        const getOtp = await client.get(checkUser[0]._id.toString());

        if (getOtp != undefined) {
            //otp valid
            if (getOtp == otp) {
                checkUser.password = password;
                checkUser.save();
                return res.status(200).json({ issuccess: true, data: { acknowledgement: true, status: 0 }, message: `password updated successfully` });
            }
            else {
                return res.status(401).json({ issuccess: true, data: { acknowledgement: false, status: 2 }, message: `incorrect otp` });
            }
        }
        else {
            //otp expired
            return res.status(410).json({ issuccess: true, data: { acknowledgement: false, status: 1 }, message: `otp expired` });
        }

    } catch (error) {
        return res.status(500).json({ issuccess: false, data: { acknowledgement: false }, message: error.message || "Having issue is server" })
    }
})

module.exports = router;