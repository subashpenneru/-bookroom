const express = require('express');
var expressSession = require('express-session');
var flash = require('express-flash');

var app = express();

app.set('view engine', 'ejs');
app.use('/public', express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  expressSession({
    resave: true,
    saveUninitialized: true,
    secret: 'star',
    cookie: { maxAge: 14400000 },
  })
);
app.use(flash());

app.get('/index', function (req, res, next) {
  res.render('index', {
    title: 'Home Page',
  });
});

app.use('', require('./routes/authRoutes'));
app.use('', require('./routes/roomRoutes'));

app.get('', function (req, res, next) {
  res.redirect('/index');
});

app.listen(5000, () => console.log('server is running at port no : 5000'));
