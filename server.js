const express = require('express')
const bodyParser = require('body-parser')
const { v4: uuidv4 } = require('uuid');
const passport = require('passport')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const BasicStrategy = require('passport-http').BasicStrategy;

const keys = require('./keys.json')

const app = express()
const port = 3000
// port for runnin on heroku:
//const port = (process.env.PORT || 80);

const products = require('./routes/products')

// projektin schemat.
const Ajv = require('ajv')
const ajv = new Ajv();
const newUserSchema= require('./schemas/newUser.json');
const newUserValidator = ajv.compile(newUserSchema);


const users = [{
    "userId": "testUserId",
    "username": "Super_man",
    "firstName": "Matti",
    "lastName": "Merkillinen",
    "phone": 4565465445,
    "email": "matti.merk@example.com",
    "emailVerified": true,
    "city": "Oulu",
    "zip": 90440,
    "addres": "tie 14 A 2",
    "password": "$2a$06$zeWN3ziS4fd4NC2w7OK2FuiBOew5aZBbECnhnbQ63UZeJTnh02ma2"
  },
  {
    "userId": uuidv4(),
    "username": "Super_woman",
    "firstName": "Matilda",
    "lastName": "Merkillinen",
    "phone": 45600000000,
    "email": "matilda.merk@example.com",
    "emailVerified": false,
    "city": "Oulu",
    "zip": 90440,
    "addres": "tie 14 A 2"
  }]

// otetaan bodyparser käyttöön.
app.use(bodyParser.json());
// otetaan käyttoon products tiedoston sisältö.
app.use('/products', products)


function mw(req, res, next) {
  console.log("middlewaren sisällä");
  next();
}

// Sisäänkirjautuminen
app.post('/login', passport.authenticate('basic',{session: false}), (req, res) => {

  // JWT generointi
    const payloadData={
        user: req.user.userId
    };
    const options = {
        expiresIn: '1d'
    }

  
    const token = jwt.sign(payloadData, keys.jwtSignKey ,options);
  
    // tokenin lähetys vastaus viestissä
    res.json({
      token: token,
      user: payloadData.user
  })
    //res.sendStatus(200);
  })

// jwt käyttö
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
let opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.jwtSignKey;
passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    const user = users.find(u => u.userId === jwt_payload.user)
    done(null,user);
}));

//testataan jwt:n toiminta.
app.get('/jwtSec', passport.authenticate('jwt',{session: false}), (req, res) => {
  //jwt secured area
  res.json({
      status: "OK, works!",
      user: req.user.username
  })
})

// basic authentitation käyttö
passport.use(new BasicStrategy(
  function(username, password, done) {
      let user = users.find(user => (user.username === username) && (bcrypt.compareSync(password, user.password)));
      if(user != undefined) {

          done(null, user);
      }
      else{
          done(null,false);

      }
  }
));

//------------------------------------------------------
//get all users listed
// NOTE THIS IS FOR BUILDING API PURPOSE ONLY!!!
// password exposed!
/*
app.get('/users', (req, res) => {
    res.json(users)
  })
  */
//------------------------------------------------------



 // post new user to be listed
 // käytetään bodyparseria.
app.post('/users', (req, res) => {
  // validoidaan body:
  const validationResult = newUserValidator(req.body);
  if(validationResult==true){
    console.log(req.body);
    res.sendStatus(201);

    // salasana hashataan
    const salt = bcrypt.genSaltSync(6);
    const hashedPassword = bcrypt.hashSync(req.body.password,salt);

    users.push({
        // uuid "npm install uuid" otettu käyttöön.
        userId: uuidv4(),
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phone: req.body.phone,
        email: req.body.email,
        city: req.body.city,
        zip: req.body.zip,
        addres: req.body.addres,
        password: hashedPassword
    })
  } else {
    res.sendStatus(400);
  }
})

let serverInstance= null;

module.exports={
  start: function(){
    serverInstance = app.listen(port, () => {
      console.log(`Example app listening on port ${port}`)
      const d = new Date();
      console.log(d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate())
    })
  },
  close: function(){
    serverInstance.close();
  }
}