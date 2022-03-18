const express = require('express');
const { getRoomsPage, bookRoom } = require('../controllers/roomController.js');

const router = express.Router();

router.route('/rooms').get(getRoomsPage).post(bookRoom);

module.exports = router;
