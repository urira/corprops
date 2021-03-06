const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);


require('dotenv').config();

const csrf = require('csurf');
const flash = require('connect-flash');

const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');


const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();
const store = new MongoDBStore({
  uri: process.env.MONGODB_URI,
  collection: 'sessions'
});
const csrfProtection = csrf();



const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));

// app.use(
//   multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
// );


const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY
});

app.use(
  multer({ 
    storage: multerS3({
      s3: s3,
      bucket: process.env.AWS_S3_BUCKET,
      acl: 'public-read',
       contentType: multerS3.AUTO_CONTENT_TYPE,
      key: function (req, file, cb) {
          console.log(file);
          cb(null, 'images/' + new Date().toISOString() + '-' + file.originalname); //use Date.now() for unique file keys
      }
    }),
    fileFilter: fileFilter }).single('image')
);

 app.use(express.static(path.join(__dirname, 'public')));
// app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
  })
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  // throw new Error('Sync Dummy');
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch(err => {
      next(new Error(err));
    });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  // res.status(error.httpStatusCode).render(...);
  // res.redirect('/500');
  res.status(500).render('500', {
    pageTitle: 'Error!',
    path: '/500',
    fullError: error,
    isAuthenticated: false//(req.session.isLoggedIn === undefined) ? null : req.session.isLoggedIn
  });
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(result => {
    app.listen(4000);
  })
  .catch(err => {
    console.log(err);
  });


  
