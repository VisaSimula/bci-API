const express = require('express')
const { v4: uuidv4 } = require('uuid');
const router = express.Router()

//passport
const passport = require('passport')

// projektin schemat
const Ajv = require('ajv')
const ajv = new Ajv();
const newProductSchema= require('../schemas/newProduct.json')
const updateProductSchema = require('../schemas/updateProduct.json')
const newProductValidator = ajv.compile(newProductSchema);
const updateProductValidator = ajv.compile(updateProductSchema);


// jwt käyttö
const keys = require('../keys.json')
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
let opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.jwtSignKey;
passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    const user = users.find(u => u.userId === jwt_payload.user)
    done(null,user);
}));

// "database array" for products
var items = [{
    "productId": "testProductId",
    "title": "Banaani",
    "description": "lasinen Banaani koriste.",
    "category": "Koristeet",
    "images": [
        "sodg35tyh35yhn4y523q",
        "fweijn35y35ny35j3n4i2"
    ],
    "price": 105.5,
    "doesShipping": false,
    "userId": "testUserId",
    "username": "Super_man",
    "firstName": "Matti",
    "lastName": "Merkillinen",
    "email": "matti.merk@example.com",
    "phone": 4565465445,
    "city": "Oulu",
    "zip": 90440,
    "addres": "tie 14 A 2",
    "postDate": "2022-02-05"
},
{
    "productId": "testProductId2",
    "title": "Haarukka",
    "description": "Uusi ja hieno haarukka.",
    "category": "Aterimet",
    "images": [
        "sodfiuhgjbsudhbgu3w4y523q",
        "fweijni23n4i2j3n4i2"
    ],
    "price": 15.5,
    "doesShipping": false,
    "userId": uuidv4(),
    "username": "Super_kid",
    "firstName": "Marcel",
    "lastName": "Merkillinen",
    "email": "marc.merk@example.com",
    "phone": 45011111111,
    "city": "Oulu",
    "zip": 90440,
    "addres": "tie 12 A 4",
    "postDate": "2022-01-25"
}]

//get all products listed
router.get('/', (req, res) => {
    res.json(items)
})

// get by category
// toimii siten, että jos jokin kolmesta query parametrista löytyy, näkyy listassa
// (jos kenttä on null niin myös oletuksena on, että tuotteen kenttä pitää olla null)
// tämä on siis asia, joka tulee huomioda muussa koodissa.
// teoriassa mikää sortattavista kentistä ei pitäisi koskaan olla null.

// muutettavissa VAIN NE JOTKA ehdoksi vaihtamalla || -> &&
router.get('/search', (req, res) =>{
    console.log(req.query);

    const results =items.filter(item => item.category === req.query.category || item.city === req.query.city || item.postDate === req.query.postDate)
    if (results.length>0){
        res.json(results)
    }else{
        res.sendStatus(404);
    }
})

  //get single product by id
router.get('/:productId', (req, res) => {
    console.log(req.params)

    // find items from array and t contains the data, so if t.productId==...

    let foundIndex = items.findIndex(t => t.productId == req.params.productId)

    if(foundIndex == -1){
        res.sendStatus(404);
        return;
    } else{
        res.json(items[foundIndex])
    }
})


 // Delete product
router.delete('/:productId', passport.authenticate('jwt',{session: false}), (req, res) =>{
    console.log(req.params)
    let foundIndex = -1;

    //looks if said id exists in the data array. if now, then continue, if found, break.
    for(let i = 0; i<items.length;i++){
        if (items[i].productId == req.params.productId){
            foundIndex = i;
            break
        }
    }
    if(foundIndex == -1){
        res.sendStatus(404);
        return;
    } else{
        items.splice(foundIndex,1);
        res.sendStatus(202);
    }
})


 // post new product to be listed
 // käytetään bodyparseria.
router.post('/', passport.authenticate('jwt',{session: false}), (req, res) => {
    const validationResult = newProductValidator(req.body);
    try {
        if(validationResult==true){
            console.log(req.body);
            res.sendStatus(201);
            const d = new Date();
    
            items.push({
                // uuid "npm install uuid" otettu käyttöön.
                productId: uuidv4(),
                title: req.body.title,
                description: req.body.description,
                category: req.body.category,
                images: req.body.images,
                price: req.body.price,
                doesShipping: req.body.doesShipping,
    
                //ja ne mitä tulee käyttäjän mukana
                userId: req.user.userId,
                username: req.user.username,
                firstName: req.user.firstName,
                lastName: req.user.lastName,
                email: req.user.email,
                phone: req.user.phone,
                city: req.user.city,
                zip: req.user.zip,
                addres: req.user.addres,
                //ja päiväys (otetaan current date)
                postDate: d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate()
            })
        } else {
            res.sendStatus(400);
        }
    } catch (error) {
        console.log(error);
    } 
})

// update product information
// käytetään bodyparseria.
router.put('/:productId', passport.authenticate('jwt',{session: false}), (req, res) =>{
    const validationResult = updateProductValidator(req.body);
    if(validationResult==true) {
        // tässä items.find palauttaa nyt koko elementin
        let foundItem = items.find(t => t.productId == req.params.productId)
        console.log(req.params.productId)
        if(foundItem){
            foundItem.productId = req.params.productId;
            foundItem.title = req.body.title;
            foundItem.description = req.body.description;
            foundItem.category = req.body.category;
            foundItem.images = req.body.images;
            foundItem.price = req.body.price;
            foundItem.doesShipping = req.body.doesShipping;

            //ja ne mitä tulee käyttäjän mukana
            foundItem.userId = req.user.userId;
            foundItem.username = req.user.username;
            foundItem.firstName = req.user.firstName;
            foundItem.lastName = req.user.lastName;
            foundItem.email = req.user.email;
            foundItem.phone = req.user.phone;
            foundItem.city = req.user.city;
            foundItem.zip = req.user.zip;
            foundItem.addres = req.user.addres;
            res.sendStatus(202);
        }
        else{
            res.sendStatus(404);
        }
    } else {
        res.sendStatus(400);
      }
})

module.exports = router,{items}