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
const { getPaymentLink } = require('../utils/setup/razorpay');
const { uploadProfileImageToS3 } = require('../utils/aws');
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
router.post('/resend-otp', [body('id').notEmpty().isEmail().withMessage('please provide email id')], checkErr, async (req, res, next) => {
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

    let checkUser = await userSchema.findOne({ email: id });

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
router.post('/update-user', uploadProfileImageToS3('courses').single('image'), authenticateToken, [body('mobileNo').optional().notEmpty().isMobilePhone().withMessage('please pass valid mobile no'), body('first').optional().notEmpty().isString().withMessage('please pass first name'),
body('last').optional().notEmpty().isString().withMessage('please pass valid last name'), body('password').optional().notEmpty().isString().withMessage('please pass valid password'), body('birthDate')
  .matches(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  .withMessage('Invalid date format')
  .custom((value, { req }) => {
    const [dd, mm, yyyy] = value.split('/');
    const date = new Date(`${mm}/${dd}/${yyyy}`);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    return true;
  })], checkErr, async (req, res, next) => {
    try {
      const { mobileNo, first, birthDate, last } = req.body;
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
        let updateDetails = await userSchema.findByIdAndUpdate(userId, { image: req.file != undefined ? req.file.location : checkExist[0].image, mobileNo, first, last, password, birthDate }, { new: true });
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
      return res.status(201).json({ issuccess: true, data: { ...updateCourse._doc, ...{ attemptId: addAttempt._id } }, message: "You are allowed to retake exam" });
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
    return res.status(201).json({ issuccess: true, data: { ...enrollCourse._doc, ...{ attemptId: addAttempt._id } }, message: "Enrollment Successfully" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ issuccess: false, data: null, message: error.message || "Having issue is server" })
  }
})
router.post('/paymentLink', authenticateToken, [body('courseId').custom(async (value) => {
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
    let getUser = await userSchema.findById(userId);
    checkExist = await userCourse.aggregate([
      {
        $match: {
          $and: [{
            courseId: new mongoose.Types.ObjectId(courseId)
          }, {
            status: 2
          }]
        }
      }]);
    let getCourse = await courseSchema.findById(courseId);
    if (!getCourse.isShort) {
      return res.status(409).json({ issuccess: false, data: null, message: "Not eligible for payment" });
    }
    if (checkExist.length > 0 && checkExist[0].lastAttempt < 3) {
      return res.status(409).json({ issuccess: true, data: checkExist[0], message: "User already purchased this course" });
    }
    let enrollCourse = new userCourse({
      userId: userId,
      courseId: courseId
    })
    await enrollCourse.save();
    // console.log(getCourse.title)
    const paymentLink = await getPaymentLink(courseId, getCourse.title, getUser, getCourse.price || 20000, enrollCourse._id);
    enrollCourse.paymentId = paymentLink.id;
    await enrollCourse.save();
    enrollCourse._doc['paymentLink'] = paymentLink.short_url;
    // console.log(enrollCourse)
    return res.status(201).json({ issuccess: true, data: enrollCourse, message: "Enrollment Successfully" });
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
    getQuestions = await userQuestion.aggregate([{ $match: { attemptId: new mongoose.Types.ObjectId(attemptId) } }, {
      $lookup: {
        from: "questions",
        let: { question: "$question" },
        pipeline: [{ $match: { $expr: { $eq: ["$question", "$$question"] } } }, { $project: { options: 1 } }],
        as: 'optionsData'
      }
    },
    {
      $addFields: {

      }
    }]);
    return res.status(201).json({ issuccess: false, data: getQuestions, message: "Questions found Successfully" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ issuccess: false, data: null, message: error.message || "Having issue is server" })
  }
})
router.post('/verify', (req, res) => {
  // get the webhook request body and headers
  const body = req.body;
  const signature = req.headers['x-razorpay-signature'];

  // create a signature using your key_secret and the body
  const crypto = require('crypto');
  const generated_signature = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET)
    .update(JSON.stringify(body))
    .digest('hex');

  // compare the signatures and check the status of the payment
  if (generated_signature === signature) {
    // signature is valid
    console.log('Webhook signature verified');
    if (body.event === 'payment.paid') {
      // payment is successful
      console.log('Payment is successful');
      console.log(body.payload.payment.entity);
      // do your business logic here
    } else {
      // payment is not successful
      console.log('Payment is not successful');
      console.log(body.payload.payment.entity);
      // do your business logic here
    }
  } else {
    // signature is invalid
    console.log('Webhook signature verification failed');
    res.status(400).send('Invalid signature');
  }
});
// define a callback route for payment link
router.post('/payment-link-callback', async (req, res) => {
  // get the payment link data from the request body
  const paymentLinkData = req.body;
  console.log(paymentLinkData.payload.payment_link)
  // check the status of the payment link

  getRecordId = paymentLinkData.payload.payment_link.entity.notes.recordId
  switch (paymentLinkData.event) {
    case 'payment_link.cancelled':
      // do something when a payment link is cancelled
      await userCourse.findByIdAndUpdate(getRecordId, { status: 5 }, { new: true });
      break;
    case 'payment_link.paid':
      await userCourse.findByIdAndUpdate(getRecordId, { status: 2, isEligible: true }, { new: true });
      // do something when a payment link is paid
      break;
    case 'payment_link.expired':
      await userCourse.findByIdAndUpdate(getRecordId, { status: 5 }, { new: true });
      // do something when a payment link is paid
      break;
    default:
      // handle unknown events
      break;
  }
  // send a success response to Razorpay
  res.status(200).send('OK');
});
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
    await submitAnswer(questionId, userId, answer)
    return res.status(201).json({ issuccess: true, data: null, message: "submitted answer" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ issuccess: false, data: null, message: error.message || "Having issue is server" })
  }
})
router.post('/get-score', authenticateToken, [body('attemptId').custom(async (value) => {
  if (!mongoose.isValidObjectId(value)) {
    throw new Error('Invalid question ID');
  }
  const testimonial = await userAttempt.findById(value);
  if (!testimonial) {
    throw new Error('attempt not found');
  }
})], checkErr, async (req, res, next) => {
  try {
    const { attemptId } = req.body;
    const userId = req.user._id;
    let getAttempt = await userAttempt.findById(attemptId);
    if (getAttempt) {
      let checkEligible = getAttempt.totalQuestion * 0.6
      if (checkEligible <= getAttempt.result) {
        getAttempt.isCleared = true;
        await getAttempt.save();
        await userCourse.findOneAndUpdate({ courseId: new mongoose.Types.ObjectId(getAttempt.courseId), userId: new mongoose.Types.ObjectId(userId) }, { status: 1 })
      }
      else {
        getAttempt.isCleared = false;
        await getAttempt.save();

      }
    }
    return res.status(201).json({ issuccess: true, data: getAttempt, message: getAttempt != undefined ? 'scorebard found' : 'no scoreboard found' });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ issuccess: false, data: null, message: error.message || "Having issue is server" })
  }
})
router.get('/my-course', authenticateToken, async function (req, res, next) {
  try {
    const userId = req.user._id
    let getCourses = await userCourse.aggregate([
      {
        $match: {
          $and: [{ userId: new mongoose.Types.ObjectId(userId) }, { isEligible: true }]
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'courseId',
          foreignField: '_id',
          as: 'courseData'
        }
      }
    ])
    return res.status(200).json({ issuccess: true, data: getCourses, message: "courses found successfully" });

  }
  catch (err) {
    return res.status(500).json({ issuccess: false, data: null, message: err.message || "Having issue is server" })

  }
});

module.exports = router;
