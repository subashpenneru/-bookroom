const express = require('express');
const {
  getSignUp,
  postSignUp,
  getSignIn,
  postSignIn,
  forgotPassword,
  resetPasswordEmail,
  getUpdatePassword,
  postUpdatePassword,
  fetchUserStatus,
} = require('../controllers/authController');

const router = express.Router();

router.route('/signup').get(getSignUp).post(postSignUp);

router.route('/signin').get(getSignIn).post(postSignIn);

router.route('/forgotPassword').get(forgotPassword);

router.route('/reset-password-email').post(resetPasswordEmail);

router.route('/updatePassword').get(getUpdatePassword).post(postUpdatePassword);

router.route('/fetch').post(fetchUserStatus);

module.exports = router;
