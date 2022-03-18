var con = require('../connection');
var moment = require('moment');
const { getStatus, setOccurance } = require('../utils/occuranceUtil');

const getRoomsPage = function (req, res, next) {
  res.render('rooms', {
    title: 'Rooms',
    success: '',
  });
};

const bookRoom = function (req, res) {
  const {
    startdate,
    starttime,
    enddate,
    endtime,
    attendes,
    email,
    roomname: roomName,
  } = req.body;

  const loggedInEmail = email || '';
  const startDt = moment(
    `${startdate} ${starttime}`,
    'YYYY-MM-DD HH:mm:ss'
  ).format();
  const endDt = moment(`${enddate} ${endtime}`, 'YYYY-MM-DD HH:mm:ss').format();

  var sqlcheck = 'SELECT * FROM meeting_info WHERE rooName = ?';
  con.query(sqlcheck, [roomName], function (err, data, fields) {
    console.log(data);
    if (data.length > 0) {
      const status = getStatus(data[0].occupancyString, startDt, endDt);

      if (status.toLowerCase() === 'available') {
        let availablityString = setOccurance(
          startDt,
          endDt,
          data[0].occupancyString
        );

        var update =
          'update meeting_info set occupancyString = ? where rooName = ?';
        con.query(update, [availablityString], function (err, data, fields) {
          if (data.length > 0) {
            // User occupancy update
            var sqlcheck = 'SELECT * FROM register WHERE email = ?';
            let people = attendes.split(',');
            people = people.filter((ele) => ele !== '');
            people.push(loggedInEmail);
            people.forEach((p) => {
              con.query(sqlcheck, [p], function (err, data, fields) {
                if (data.length > 0) {
                  let userAvailability = setOccurance(
                    startDt,
                    endDt,
                    data[0].occupancy
                  );
                  var update =
                    'update register set occupancy = ? where email = ?';
                  con.query(
                    update,
                    [userAvailability, p],
                    function (err, data, fields) {
                      if (data.length > 0) {
                        res.send(data);
                      }
                    }
                  );
                }
              });
            });
          }
        });
      } else {
        return res.send('Room not available');
      }
    }
  });
};

module.exports = {
  getRoomsPage,
  bookRoom,
};
