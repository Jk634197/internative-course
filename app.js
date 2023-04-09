var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('./config');
const cors = require('cors')
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const courseRoute = require('./routes/courseNew');
const questionRoute = require('./routes/questions');
const moduleRoute = require('./routes/modules');
const teamRoute = require('./routes/team');
const faqRoute = require('./routes/faq');
const testimonialRoute = require('./routes/testimonial');
require('./utils/redis');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/course', courseRoute);
app.use('/question', questionRoute);
app.use('/faq', faqRoute);
app.use('/module', moduleRoute);
app.use('/team', teamRoute);
app.use('/testimonial', testimonialRoute);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  console.log('here deleted')
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
