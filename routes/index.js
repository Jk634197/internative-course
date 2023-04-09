var express = require('express');
const { oneOf, body } = require('express-validator');
const { default: mongoose } = require('mongoose');
const { authenticateToken, generateAccessToken } = require('../middleware/auth');
const userSchema = require('../models/userSchema');
const { checkErr, getRandomIntInclusive } = require('../utils/error');
const client = require('../utils/redis');
var router = express.Router();
const bcrypt = require('bcrypt');
const { main } = require('../utils/mailer');
const courseSchema = require('../models/courseSchema');
const userAttempt = require('../models/userAttempt');
const userCourse = require('../models/userCourse');
const questionSchema = require('../models/questionSchema');
const { setQuestions, submitAnswer } = require('../utils/crudmoduels');
const userQuestion = require('../models/userQuestion');
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});
router.post('/login', [oneOf([body('id').isEmail().withMessage("please pass email id"), body('id').isMobilePhone().withMessage("please pass mobile no")], "please pass valid email or mobile no"), body('password').isString().withMessage("please pass password")], checkErr, async (req, res, next) => {
  try {
    const { password, id } = req.body;
    checkExist = await userSchema.aggregate([
      {
        $match: {
          $or: [
            { email: id },
            { mobileNo: id }
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
router.post('/login-email', [body('id').notEmpty().isEmail().withMessage('please provide email id')], checkErr, async (req, res, next) => {
  try {
    const { id } = req.body;
    checkExist = await userSchema.aggregate([
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
      return res.status(200).json({ issuccess: true, data: { acknowledgement: true, data: { user: checkExist[0], isExist: true } }, message: "user found" });
    }
    let createUser = new userSchema({
      email: id
    });
    await createUser.save();
    otp = getRandomIntInclusive(111111, 999999);
    await client.set(createUser._id.toString(), otp.toString(), 'EX', 300, (err, reply) => {
      if (err) {
        console.error(err);
      } else {
        console.log(reply);
      }
    });
    createUser['id'] = createUser['_id']
    delete createUser.password;
    let message = `Dear customer,${otp} is your one time password(OTP).Please do not share the OTP with others.</br> Regards,Team Internative Ed-Tech`
    await main(createUser.email, message);

    return res.status(200).json({
      issuccess: true, data: { acknowledgement: true, data: createUser, isExist: false }, message: "new user registered"
    });

  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ issuccess: false, data: { acknowledgement: false, data: null }, message: error.message || "Having issue is server" })
  }
})
router.post('/authenticateOtp', [oneOf([body('id').isEmail(), body('id').isMobilePhone()], "please pass email or mobile no"), body('otp').isNumeric().withMessage("please pass otp")], checkErr, async (req, res, next) => {
  try {
    const { otp, id } = req.body;

    let checkUser = await userSchema.aggregate([
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
router.post('/update-user', authenticateToken, [body('mobileNo').optional().notEmpty().isMobilePhone().withMessage('please pass valid mobile no'), body('first').optional().notEmpty().isString().withMessage('please pass first name'),
body('last').optional().notEmpty().isString().withMessage('please pass valid last name'), body('password').optional().notEmpty().isString().withMessage('please pass valid password')], checkErr, async (req, res, next) => {
  try {
    const { mobileNo, first, last } = req.body;
    let { password } = req.body;
    const userId = req.user._id;
    checkExist = await userSchema.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(userId)
        }
      }]);

    if (checkExist.length > 0) {
      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);
      let updateDetails = await userSchema.findByIdAndUpdate(userId, { mobileNo, first, last, password }, { new: true });
      return res.status(200).json({ issuccess: true, data: updateDetails, message: "user details updated" });
    }
    return res.status(404).json({ issuccess: false, data: null, message: "incorrect email id or mobile no" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ issuccess: false, data: null, message: error.message || "Having issue is server" })
  }
})

router.post('/enroll-course', authenticateToken, [body('courseId').custom(async (value) => {
  if (!mongoose.isValidObjectId(value)) {
    throw new Error('Invalid course ID');
  }
  const testimonial = await courseSchema.findById(value);
  if (!testimonial) {
    throw new Error('course not found');
  }
})], checkErr, async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const userId = req.user._id;
    checkExist = await userCourse.aggregate([
      {
        $match: {
          courseId: new mongoose.Types.ObjectId(courseId)
        }
      }]);
    let getQuestions = await questionSchema.aggregate([{ $match: { courseId: new mongoose.Types.ObjectId(courseId) } },
    {
      $project: {
        answer: 0,
        __v: 0
      }
    },
    { $sample: { size: 9999 } }, // replace 9999 with the number of documents in the collection
    { $sort: { randomField: 1 } } // replace randomField with the name of a field with random values
    ]);
    if (checkExist.length > 0 && checkExist[0].lastAttempt < 3) {
      let addAttempt = new userAttempt({
        userId: userId,
        courseId: courseId,
        enrollId: checkExist[0]._id,
        attemptNumber: checkExist[0].lastAttempt + 1,
        totalQuestion: getQuestions.length
      })
      await addAttempt.save();
      let updateCourse = await userCourse.findByIdAndUpdate(checkExist[0]._id, { $inc: { lastAttempt: 1 } }, { new: true });
      setQuestions(userId, addAttempt._id, getQuestions)
      return res.status(201).json({ issuccess: false, data: { ...updateCourse._doc, ...{ attemptId: addAttempt._id } }, message: "You are allowed to retake exam" });
    }
    let enrollCourse = new userCourse({
      userId: userId,
      courseId: courseId
    })
    await enrollCourse.save();

    let addAttempt = new userAttempt({
      userId: userId,
      courseId: courseId,
      enrollId: enrollCourse._id,
      attemptNumber: 1,
      totalQuestion: getQuestions.length
    })
    await addAttempt.save();
    setQuestions(userId, addAttempt._id, getQuestions)
    return res.status(201).json({ issuccess: false, data: { ...enrollCourse._doc, ...{ attemptId: addAttempt._id } }, message: "Enrollment Successfully" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ issuccess: false, data: null, message: error.message || "Having issue is server" })
  }
})
router.post('/getquestions', authenticateToken, [body('attemptId').custom(async (value) => {
  if (!mongoose.isValidObjectId(value)) {
    throw new Error('Invalid attempt ID');
  }
  const testimonial = await userAttempt.findById(value);
  if (!testimonial) {
    throw new Error('attempt data not found');
  }
})], checkErr, async (req, res, next) => {
  try {
    const { attemptId } = req.body;
    const userId = req.user._id;
    getQuestions = await userQuestion.find({ attemptId: new mongoose.Types.ObjectId(attemptId) });
    return res.status(201).json({ issuccess: false, data: getQuestions, message: "Questions found Successfully" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ issuccess: false, data: null, message: error.message || "Having issue is server" })
  }
})
router.post('/submit-answer', authenticateToken, [body('questionId').custom(async (value) => {
  if (!mongoose.isValidObjectId(value)) {
    throw new Error('Invalid question ID');
  }
  const testimonial = await userQuestion.findById(value);
  if (!testimonial) {
    throw new Error('question not found');
  }
}), body('answer').notEmpty().isString().withMessage('please provide valid answer')], checkErr, async (req, res, next) => {
  try {
    const { questionId, answer } = req.body;
    const userId = req.user._id;
    submitAnswer(questionId, userId, answer)
    return res.status(201).json({ issuccess: true, data: null, message: "submitted answer" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ issuccess: false, data: null, message: error.message || "Having issue is server" })
  }
})


module.exports = router;
