const fs = require('fs');
const con = require('./connection');
require('colors');

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/data/users.json`, 'utf-8')
);
const rooms = JSON.parse(
  fs.readFileSync(`${__dirname}/data/rooms.json`, 'utf-8')
);

const importData = async () => {
  console.log(`Importing Data...`.green.inverse);

  try {
    users.forEach((user, index) => {
      con.query(
        "Insert into register(id,username,email,password,phone,occupancy) values('" +
          user.id +
          "','" +
          user.username +
          "','" +
          user.email +
          "','" +
          user.password +
          "','" +
          user.phone +
          "','" +
          user.occupancy +
          "')"
      );

      if (users.length - 1 === index) {
        console.log(`Imported Users Data...`.green.inverse);
      }
    });

    rooms.forEach((room, index) => {
      con.query(
        "Insert into meeting_info(id,roomName,occupancyString) values('" +
          room.id +
          "','" +
          room.roomName +
          "','" +
          room.occupancyString +
          "')"
      );

      if (room.length - 1 === index) {
        console.log(`Imported Rooms Data...`.green.inverse);
      }
    });

    // process.exit();
  } catch (err) {
    console.error(err);
  }
};

const deleteData = () => {
  try {
    users.forEach((user, i) => {
      con.query('DELETE FROM register where id = ?', [user.id]);
    });

    rooms.forEach((room, i) => {
      console.log(room);
      con.query('DELETE FROM meeting_info where id = ?', [room.id]);

      if (rooms.length - 1 === i) {
        console.log(`Data Destroyed...`.red.inverse);
        // process.exit();
      }
    });
  } catch (err) {
    console.error(err);
  }
};

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
}
