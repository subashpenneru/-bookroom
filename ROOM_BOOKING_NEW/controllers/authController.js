var con = require('../connection');
var nodemailer = require('nodemailer');
var randtoken = require('rand-token');
var bcrypt = require('bcrypt');
var moment = require('moment');
const { defaultOccurance, getStatus } = require('../utils/occuranceUtil');

const getSignUp = function (req, res, next) {
  res.render('signup', { success: '' });
};

const postSignUp = function (req, res) {
  var username = req.body.username;
  var email = req.body.email;
  var password = req.body.password;
  var phone = req.body.phone;

  con.query(
    'SELECT COUNT(*) AS cnt FROM register WHERE email = ? ',
    req.body.email,
    function (err, data) {
      if (err) {
        console.log(err);
      } else if (data[0].cnt > 0) {
        // Already exist
        // res.status(409).json({
        //     error: 'Sorry! An account with that email address already exists!'
        //     // alert: "not equal"
        // })
        // res.redirect('/signin');
        // res.redirect(200, '/');

        // res.redirect('/signup')
        res.render('signup', { success: 'Mail Already Exists!Try to Login' });
      } else {
        con.query(
          "Insert into register(username,email,password,phone,occupancy) values('" +
            username +
            "','" +
            email +
            "','" +
            password +
            "','" +
            phone +
            "','" +
            defaultOccurance() +
            "')",
          function (err, insert) {
            if (err) {
              throw err;
              // retunn error
            } else {
              // return success , user will insert
              // res.redirect('/signin');
              // res.send("<html> <head><script src='https://unpkg.com/sweetalert/dist/sweetalert.min.js'>"

              // + "</script></head>"

              // + "<body><script type='text/javascript'>"

              // + "swal('Meeting Room','Successfully submitted','error')</script>"

              // + "</body></html>");
              res.render('signup', {
                success: 'Inserted Records Successfully!',
              });
            }
          }
        );
      }
    }
  );
};

const getSignIn = function (req, res) {
  res.render('signin', { success: '' });
};

const postSignIn = function (req, res) {
  var email = req.body.email;
  var password = req.body.password;
  var sql = 'SELECT * FROM register WHERE email =? AND password =?';
  con.query(sql, [email, password], function (err, data, fields) {
    if (data.length > 0) {
      req.email = email;
      req.password = password;
      res.redirect('/rooms');
    } else {
      // res.send("Invalid username or password");
      // res.redirect('/signin');
      // console.log('Check Your Credentials');
      // req.flash('error', 'Please correct enter email and Password!')
      res.render('signin', { success: 'Check your Credentials!' });
    }
  });
};

const forgotPassword = function (req, res, next) {
  res.render('forgotPassword', {
    title: 'Forget Password Page',
    success: '',
  });
};

const resetPasswordEmail = function (req, res, next) {
  var email = req.body.email;
  con.query(
    'SELECT * FROM register WHERE email ="' + email + '"',
    function (err, result) {
      if (err) throw err;
      var type = '';
      var msg = '';
      console.log(result[0]);
      if (result[0].email.length > 0) {
        var token = randtoken.generate(20);
        var sent = sendEmail(email, token);
        if (sent != '0') {
          var data = {
            token: token,
          };
          con.query(
            'UPDATE register SET ? WHERE email ="' + email + '"',
            data,
            function (err, result) {
              if (err) throw err;
            }
          );
          type = 'success';
          res.render('signin', {
            success:
              'The reset password link has been sent to your email address',
          });
          msg = 'The reset password link has been sent to your email address';
          console.log(msg, 'msg');
        } else {
          type = 'error';
          msg = 'Something goes to wrong. Please try again';
          res.render('signin', {
            success: 'Something goes to wrong. Please try again',
          });
          console.log(msg, 'msg');
        }
      } else {
        console.log('2');
        type = 'error';
        msg = 'The Email is not registered with us';
        res.render('signin', {
          success: 'The Email is not registered with us',
        });
        console.log(msg, 'msg');
      }
      // req.flash(type, msg);
      // res.redirect('/signin');
    }
  );
};

const getUpdatePassword = function (req, res, next) {
  res.render('updatePassword', {
    title: 'Reset Password Page',
    success: '',
    token: req.query.token,
  });
};

const postUpdatePassword = function (req, res, next) {
  var token = req.body.token;
  var password = req.body.password;
  con.query(
    'SELECT * FROM register WHERE token ="' + token + '"',
    function (err, result) {
      if (err) throw err;
      var type;
      var msg;
      if (result.length > 0) {
        var saltRounds = 10;
        bcrypt.genSalt(saltRounds, function (err, salt) {
          bcrypt.hash(password, salt, function (err, hash) {
            var data = {
              password,
            };
            con.query(
              'UPDATE register SET ? WHERE email ="' + result[0].email + '"',
              data,
              function (err, result) {
                if (err) throw err;
              }
            );
          });
        });
        type = 'success';
        msg = 'Your password has been updated successfully';
        res.render('signin', { success: 'Password updated ! Now Login' });
        console.log(msg, 'msg');
      } else {
        console.log('2');
        type = 'success';
        msg = 'Invalid link; please try again';
        res.render('signin', { success: 'Invalid link ! please try again' });
        console.log(msg, 'msg');
      }

      // res.redirect('/signin');
    }
  );
};

const fetchUserStatus = function (req, res, next) {
  const { email, startdate, starttime, enddate, endtime } = req.body;

  const startdateTime = moment(
    `${startdate} ${starttime}`,
    'YYYY-MM-DD HH:mm:ss'
  ).format();
  const enddateTime = moment(
    `${enddate} ${endtime}`,
    'YYYY-MM-DD HH:mm:ss'
  ).format();

  var sql = 'SELECT * FROM register WHERE email =?';
  con.query(sql, [email], function (err, data, fields) {
    if (data.length > 0) {
      const status = getStatus(data[0].occupancy, startdateTime, enddateTime);
      res.json({ user: data[0], status });
    } else {
      res
        .status(404)
        .json({ message: `User ${email} is not a registered user!` });
    }
  });
};

//send email
function sendEmail(email, token) {
  var email = email;
  var token = token;
  var mail = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'm9705453621', // Your email id
      pass: 'me&9705453621', // Your password
    },
  });
  var mailOptions = {
    from: 'donotreply@gmail.com',
    to: email,
    subject: 'Reset Password Link',
    html:
      '<p>You requested for reset password, kindly use this <a href="http://localhost:5000/updatePassword?token=' +
      token +
      '">link</a> to reset your password</p>',
  };
  mail.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      console.log(1);
    } else {
      console.log(0);
    }
  });
}

module.exports = {
  getSignUp,
  postSignUp,
  getSignIn,
  postSignIn,
  forgotPassword,
  resetPasswordEmail,
  getUpdatePassword,
  postUpdatePassword,
  fetchUserStatus,
};
