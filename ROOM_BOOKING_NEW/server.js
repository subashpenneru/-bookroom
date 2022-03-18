var con = require('./connection');
const express = require('express');
var app = express();
var router = express.Router();
var expressSession = require('express-session');
var nodemailer = require('nodemailer');
var bcrypt = require('bcrypt');
var randtoken = require('rand-token');
var flash = require('express-flash');
const bodyparser = require('body-parser');
var swal = require('sweetalert');
const { listenerCount } = require('./connection');
app.use('/public', express.static('public'));
app.set('view engine', 'ejs');
var moment = require('moment');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const defaultOccurance = () => [...Array(96)].map(() => '0').join('');

const getStatus = (occurance, startDt, endDt) => {
  if (!occurance || !startDt || !endDt) {
    return;
  }

  const defaultO = setOccurance(startDt, endDt, occurance).split('');
  const current = occurance.split('');

  let match = false;
  current.forEach((ele, i) => {
    if (ele === '1' && ele === defaultO[i]) {
      match = true;
    }
  });

  return match ? 'busy' : 'available';
};

/**
 * function to update/set occurance for user
 * @param {String} startDt
 * @param {String} endDt
 * @param {String} occurance
 * @returns binary digits - 96 bit
 */
const setOccurance = (startDt, endDt, occurance) => {
  const _start = new Date(startDt);
  const _end = new Date(endDt);

  const rangeInMin = (_end - _start) / (60 * 1000);
  const startHour = _start.getHours();

  const startIndex = (startHour - 1) * 4;
  const endIndex = startIndex + Math.ceil(rangeInMin / 15);

  return occurance
    .split('')
    .map((ele, i) => {
      if (i >= startIndex && i < endIndex) {
        return '1';
      } else {
        return ele;
      }
    })
    .join('');
};

app.use(
  expressSession({
    resave: true,
    saveUninitialized: true,
    secret: 'star',
    cookie: { maxAge: 14400000 },
  })
);

app.use(flash());
/* app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true })); */

app.listen(5000, () =>
  console.log('Express server is running at port no : 5000')
);

app.get('/index', function (req, res, next) {
  res.render('index', {
    title: 'Home Page',
  });
});

app.get('/signup', function (req, res, next) {
  res.render('signup', { success: '' });
});

app.post('/signup', function (req, res) {
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
});

app.get('/signin', function (req, res) {
  res.render('signin', { success: '' });
});

app.post('/signin', function (req, res) {
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
});

app.get('/rooms', function (req, res, next) {
  res.render('rooms', {
    title: 'Rooms',
    success: '',
  });
});

app.post('/rooms', function (req, res) {
  const startdateTime = moment(
    `${req.body.startdate} ${req.body.starttime}`,
    'YYYY-MM-DD HH:mm:ss'
  ).format();
  const enddateTime = moment(
    `${req.body.enddate} ${req.body.endtime}`,
    'YYYY-MM-DD HH:mm:ss'
  ).format();
  // let availablityStirng = setOccurance(startdateTime, enddateTime, occurance = defaultOccurance());
  var attendes = req.body.attendes;
  var startdate = req.body.startdate;
  var enddate = req.body.enddate;
  var starttime = req.body.starttime;
  var endtime = req.body.endtime;
  var loggedInEmail = req.body.email || '';
  var roomName = req.body.roomname;
  // var occupancy = availablityStirng;

  // var sql =
  //   'SELECT * FROM rooms WHERE  roomname=?  AND starttime=? AND endtime=?';
  // console.log(Number(capacity), 'Person Capacity');

  // if (Number(capacity) >= 2 && Number(capacity) <= 20) {
  //   console.log('**');
  //   con.query(
  //     sql,
  //     [roomname, starttime, endtime],
  //     function (err, data, fields) {
  //       if (data.length > 0) {
  //         // /* con.query(
  //         //   sql,
  //         //   ["Mansion", starttime, endtime],
  //         //   function (err, data, fields) {
  //         //     if (data.length > 0) {
  //         //       temp1 = "Mansion Busy";
  //         //       console.log(temp1, "temp1 status");
  //         //       console.log("mansion Busy");
  //         //       // res.render("rooms", { success: "Mansion busy" });
  //         //     } else {
  //         //       temp1 = "Mansion Available";
  //         //       console.log("mansion available");
  //         //       //res.render("rooms", { success: "Mansion booked" });
  //         //     }
  //         //   }
  //         // );
  //         // con.query(
  //         //   sql,
  //         //   ["Tower", starttime, endtime],
  //         //   function (err, data, fields) {
  //         //     if (data.length > 0) {
  //         //       temp2 = "Tower Busy";
  //         //       console.log("Tower Busy");
  //         //       //res.render("rooms", { success: "Tower busy" });
  //         //     } else {
  //         //       temp2 = "Tower Available";
  //         //       console.log("Tower available");
  //         //       //res.render("rooms", { success: "Tower booked" });
  //         //     }
  //         //   }
  //         // );

  //         // con.query(
  //         //   sql,
  //         //   ["Cave", starttime, endtime],
  //         //   function (err, data, fields) {
  //         //     if (data.length > 0) {
  //         //       temp3 = "Cave Busy";
  //         //       console.log("Cave Busy");
  //         //       //res.render("rooms", { success: "Cave Busy" });
  //         //     } else {
  //         //       temp3 = "Cave Available";
  //         //       console.log("Cave available");
  //         //       //res.render("rooms", { success: "Cave booked" });

  //         //       //                 res.send("<html> <head><script src='https://unpkg.com/sweetalert/dist/sweetalert.min.js'>"

  //         //       //                 + "</script></head>"

  //         //       //                 + "<body><script type='text/javascript'>"

  //         //       //                 +"swal('Meeting Room','No Vacancy',error')</script>"

  //         //       //                +"</body></html>");
  //         //       // }
  //         //     }
  //         //   }
  //         // ); */
  //         res.render('rooms', {
  //           success: ` ${roomname} Busy! Try to check other rooms`,
  //         });
  //       }
  // else {
  // Room occupancy update
  var sqlcheck = 'SELECT * FROM rooms WHERE roomName = ?';

  con.query(sqlcheck, [roomName], function (err, data, fields) {
    if (data.length > 0) {
      const status = getStatus(data[0].occupancy, startdateTime, enddateTime);

      if (status.toLowerCase() === 'available') {
        let availablityStirng = setOccurance(
          startdateTime,
          enddateTime,
          data[0].occupancy
        );

        var update = 'update rooms set occupancy = ? where roomName = ?';
        con.query(update, [availablityStirng], function (err, data, fields) {
          if (data.length > 0) {
            res.send(data);
          }
        });
      } else {
        return res.send('Room not available');
      }
    }
  });

  // User occupancy update
  var sqlcheck = 'SELECT * FROM register WHERE email = ?';
  const people = attendes.split(',');
  people.push(loggedInEmail);
  people.forEach((p) => {
    con.query(sqlcheck, [p], function (err, data, fields) {
      if (data.length > 0) {
        let availablityStirng = setOccurance(
          startdateTime,
          enddateTime,
          data[0].occupancy
        );
        var update = 'update register set occupancy = ? where email = ?';
        var occupancy = availablityStirng;
        con.query(update, [occupancy, attendes], function (err, data, fields) {
          if (data.length > 0) {
            res.send(data);
          }
        });
      }
      // else {
      //   let availablityStirng = setOccurance(
      //     startdateTime,
      //     enddateTime,
      //     (occurance = defaultOccurance())
      //   );
      //   var occupancy = availablityStirng;
      //   con.query(
      //     "Insert into rooms(roomname,capacity,title,attendes,startdate,enddate,starttime,endtime,occupancy) values('" +
      //       roomname +
      //       "','" +
      //       capacity +
      //       "','" +
      //       title +
      //       "','" +
      //       attendes +
      //       "','" +
      //       startdate +
      //       "','" +
      //       enddate +
      //       "','" +
      //       starttime +
      //       "','" +
      //       endtime +
      //       "','" +
      //       occupancy +
      //       "')"
      //   );
      //   res.render('rooms', {
      //     success: `Successfully booked ! ${roomname}`,
      //   });
      // }
    });
  });
  // }
  //     }
  //   );
  // } else {
  //   console.log('Capacity in between 2 to 20');
  //   res.render('rooms', { success: 'No Vacant Room' });
  // }
});

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
/* forgot password page */

app.get('/forgotPassword', function (req, res, next) {
  res.render('forgotPassword', {
    title: 'Forget Password Page',
    success: '',
  });
});

/* send reset password link in email */

app.post('/reset-password-email', function (req, res, next) {
  var email = req.body.email;
  console.log(sendEmail(email), 'email');
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
});
/* reset page */

app.get('/updatePassword', function (req, res, next) {
  res.render('updatePassword', {
    title: 'Reset Password Page',
    success: '',
    token: req.query.token,
  });
});

/* update password to database */

app.post('/updatePassword', function (req, res, next) {
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
});

app.post('/fetch', function (req, res, next) {
  console.log(req.body.email);
  let email = req.body.email;

  const startdateTime = moment(
    `${req.body.startdate} ${req.body.starttime}`,
    'YYYY-MM-DD HH:mm:ss'
  ).format();
  const enddateTime = moment(
    `${req.body.enddate} ${req.body.endtime}`,
    'YYYY-MM-DD HH:mm:ss'
  ).format();
  var sql = 'SELECT * FROM rooms WHERE attendes =?';
  con.query(sql, [email], function (err, data, fields) {
    if (data.length > 0) {
      console.log(data);
      let result = getStatus(data[0].occupancy, startdateTime, enddateTime);
      console.log('res', result);
      res.send(result);
      console.log(email, `${email}busy`);
    } else {
      res.render('fetch', { success: 'no data' });
    }
  });
});
