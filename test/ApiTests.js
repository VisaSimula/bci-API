const assert = require('assert');
const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
const server = require('../server');
chai.use(chaiHttp);
const chaiJsonSchemaAjv = require('chai-json-schema-ajv');
chai.use(chaiJsonSchemaAjv);

const getProductsSchema = require('../schemas/getProducts.json');
const singleProductSchema = require('../schemas/singleProduct.json');
const newUserSchema = require('../schemas/newUser.json')

const serverAddress = 'http://localhost:3000'
let token='tyhjää täynnä';
describe('market API tests', function () {

    // before metodia kutsutaan ennen mitään muuta testi casea.
    before(function () {
        server.start();
    });
    // after metodia kutsutaan vasta kun kaikki testit on tehty.
    after(function () {
        server.close();
    });

    describe('GET /products', function () {
        it('should return a list of products', function (done) {
            // sending the http request
            chai.request(serverAddress)
            .get('/products')
            .end(function (err,res){
                expect(err).to.be.null;
                
                // check response status
                expect(res).to.have.status(200);
                //check response data structure
                expect(res.body).to.be.jsonSchema(getProductsSchema)
                done();
            })
        })
    })


    //USERS ------------------------------------------------------------------

    describe('POST /users', function () {
        it('should add new user when data is correct',function (done){
            chai.request(serverAddress)
            .post('/users')
            .send({
                username: "Super_kid",
                firstName: "Marcel",
                lastName: "Merkillinen",
                phone: 45011111111,
                email: "marc.merk@example.com",
                city: "Oulu",
                zip: 90440,
                addres: "tie 12 A 4",
                password: "password"
              })
            .end(function(err, res){
                expect(err).to.be.null;
                expect(res).to.have.status(201);
                done();
            })
        })

        it('shoud reject request with missing fields from data structure',function (done){
            chai.request(serverAddress)
            .post('/users')
            .send({
                firstName: "Marcel",
                lastName: "Merkillinen",
                phone: 45011111111,
                email: "marc.merk@example.com",
                city: "Oulu",
                zip: 90440,
                addres: "tie 12 A 4",
                password: "password"
              })
            .end(function(err, res){
                expect(err).to.be.null;
                expect(res).to.have.status(400);
                done();
            })
        })

        it('shoud reject request with incorrect datatypes',function (done){
            chai.request(serverAddress)
            .post('/users')
            .send({
                firstName: 1241531,
                lastName: "Merkillinen",
                phone: "45011111111",
                email: "marc.merk@example.com",
                city: 9238659235,
                zip: "90440",
                addres: "tie 12 A 4",
                password: "password"
              })
            .end(function(err, res){
                expect(err).to.be.null;
                expect(res).to.have.status(400);
                done();
            })
        })

        it('shoud reject empty requests',function (done){
            chai.request(serverAddress)
            .post('/users')
            .send({
                firstName: 1241531,
                lastName: "Merkillinen",
                phone: "45011111111",
                email: "marc.merk@example.com",
                city: 9238659235,
                zip: "90440",
                addres: "tie 12 A 4",
                password: "password"
              })
            .end(function(err, res){
                expect(err).to.be.null;
                expect(res).to.have.status(400);
                done();
            })
        })
    })


    // PRODUCTS ----------------------------------------------------------------



    describe('GET /products/:productId', function () {
        it('should return a list of products', function (done) {
            // sending the http request
            chai.request(serverAddress)
            .get('/products/testProductId')
            .end(function (err,res){
                expect(err).to.be.null;
                
                // check response status
                expect(res).to.have.status(200);
                //check response data structure
                expect(res.body).to.be.jsonSchema(singleProductSchema)
                done();
            })
        })

        it('should return a 404 when Id is not found', function (done) {
            // sending the http request
            chai.request(serverAddress)
            .get('/products/wrongId')
            .end(function (err,res){
                expect(err).to.be.null;
                
                // check response status
                expect(res).to.have.status(404);
                done();
            })
        })
    })

    describe('GET /products/search?city=Oulu', function () {
        it('should return a list of products that are located in oulu', function (done) {
            // sending the http request
            chai.request(serverAddress)
            .get('/products/search?city=Oulu')
            .end(function (err,res){
                expect(err).to.be.null;
                
                // check response status
                expect(res).to.have.status(200);
                //check response data structure
                expect(res.body).to.be.jsonSchema(getProductsSchema)
                done();
            })
        })
        it('should return 404 when there are no matches', function (done) {
            // sending the http request
            chai.request(serverAddress)
            .get('/products/search?city=Budapest')
            .end(function (err,res){
                expect(err).to.be.null;
                
                // check response status
                expect(res).to.have.status(404);
                done();
            })
        })
        it('should return a list of products which postDate=2022-02-05', function (done) {
            // sending the http request
            chai.request(serverAddress)
            .get('/products/search?postDate=2022-02-05')
            .end(function (err,res){
                expect(err).to.be.null;
                
                // check response status
                expect(res).to.have.status(200);
                //check response data structure
                expect(res.body).to.be.jsonSchema(getProductsSchema)
                done();
            })
        })
        it('should return 404 when there are no matches', function (done) {
            // sending the http request
            chai.request(serverAddress)
            .get('/products/search?postDate=2019-08-01')
            .end(function (err,res){
                expect(err).to.be.null;
                
                // check response status
                expect(res).to.have.status(404);
                done();
            })
        })
        it('should return a list of products which category=Aterimet', function (done) {
            // sending the http request
            chai.request(serverAddress)
            .get('/products/search?category=Aterimet')
            .end(function (err,res){
                expect(err).to.be.null;
                
                // check response status
                expect(res).to.have.status(200);
                //check response data structure
                expect(res.body).to.be.jsonSchema(getProductsSchema)
                done();
            })
        })
        it('should return 404 when there are no matches', function (done) {
            // sending the http request
            chai.request(serverAddress)
            .get('/products/search?category=Lihat')
            .end(function (err,res){
                expect(err).to.be.null;
                
                // check response status
                expect(res).to.have.status(404);
                done();
            })
        })
    })

    describe('POST /login', function () {
        it('should return token & user', function (done) {
            chai.request(serverAddress)
            .post('/login')
            .auth('Super_man', 'password')
            .end(function(err, res){
                token = res.body.token;
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                done();
            })
        })
        it('should return 401 whith wrong pass/username', function (done) {
            chai.request(serverAddress)
            .post('/login')
            .auth('Super_maaaan', 'passdddword')
            .end(function(err, res){
                token = res.body.token;
                expect(err).to.be.null;
                expect(res).to.have.status(401);
                done();
            })
        })
    })

    describe('POST /products', function () {
        it('should add new product when data is correct (gives 401 if not logged in with jwt)',function (done){
            chai.request(serverAddress)
            .post('/login')
            .auth('Super_man', 'password')
            .end(function(err, res){
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                token = res.body.token;
                console.log("post token: ");
                console.log(token)
                chai.request(serverAddress)
                .post('/products')
                .auth(token, { type: 'bearer' })
                .send({
                    title: "Haarukka",
                    description: "Uusi ja hieno haarukka.",
                    category: "Aterimet",
                    images: [
                    "sodfiuhgjbsudhbgu3w4y523q",
                    "fweijni23n4i2j3n4i2"
                    ],
                    price: 15.5,
                    doesShipping: false
                })
                .end(function(err, res){
                    expect(err).to.be.null;
                    expect(res).to.have.status(201);
                    done();
                })
            })
        })

        it('shoud reject request with missing fields from data structure(gives 401 if not logged in with jwt)',function (done){
            chai.request(serverAddress)
            .post('/login')
            .auth('Super_man', 'password')
            .end(function(err, res){
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                token = res.body.token;
                console.log("session specific token: ");
                console.log(token)
                chai.request(serverAddress)
                .post('/products')
                .auth(token, { type: 'bearer' })
                .send({
                    title: "Haarukka",
                    description: "Uusi ja hieno haarukka.",
                    category: "Aterimet",
                    images: [
                    "sodfiuhgjbsudhbgu3w4y523q",
                    "fweijni23n4i2j3n4i2"
                    ],
                    doesShipping: false
                })
                .end(function(err, res){
                    expect(err).to.be.null;
                    expect(res).to.have.status(400);
                done();
                })
            })
        })

        it('shoud reject request with incorrect datatypes',function (done){
            chai.request(serverAddress)
            .post('/login')
            .auth('Super_man', 'password')
            .end(function(err, res){
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                token = res.body.token;
                console.log("session specific token: ");
                console.log(token)
                chai.request(serverAddress)
                .post('/products')
                .auth(token, { type: 'bearer' })
                .send({
                    title: 14151353,
                    description: 135135135,
                    category: "Aterimet",
                    images: [
                    "sodfiuhgjbsudhbgu3w4y523q",
                    "fweijni23n4i2j3n4i2"
                    ],
                    doesShipping: 124314
                })
                .end(function(err, res){
                    expect(err).to.be.null;
                    expect(res).to.have.status(400);
                done();
                })
            })
        })

        it('shoud reject empty requests',function (done){
            chai.request(serverAddress)
            .post('/login')
            .auth('Super_man', 'password')
            .end(function(err, res){
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                token = res.body.token;
                console.log("session specific token: ");
                console.log(token)
                chai.request(serverAddress)
                .post('/products')
                .auth(token, { type: 'bearer' })
            
                .end(function(err, res){
                    expect(err).to.be.null;
                    expect(res).to.have.status(400);
                done();
                })
            })
        })

        it('shoud contain added product data',function (done){
            chai.request(serverAddress)
            .get('/products')
            .end(function (err,res){
                expect(err).to.be.null;
                
                // check response status
                expect(res).to.have.status(200);
                //check response data structure
                let found = false;
                for(let i=0; i<res.body.length; i++){
                    if(res.body[i].title =="Haarukka" 
                    && res.body[i].description == "Uusi ja hieno haarukka."
                    && res.body[i].category == "Aterimet"
                    && res.body[i].price == 15.5
                    && res.body[i].doesShipping == false){
                        found = true;
                        break;
                    }
                }
                if(found==false){
                    assert.fail('Data not saved');
                }
                done();
            })
        })

    })

    // UPDATE PRODUCT----------------------------------------------------------------------------

    describe('PUT /products/:productId', function () {
        
        it('should update old product when data is correct (gives 401 if not logged in with jwt)',function (done){
            chai.request(serverAddress)
            .post('/login')
            .auth('Super_man', 'password')
            .end(function(err, res){
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                token = res.body.token;
                console.log("post token: ");
                console.log(token)
                chai.request(serverAddress)
                .put('/products/testProductId')
                .auth(token, { type: 'bearer' })
                .send({
                    title: "vasara",
                    description: "Uusi ja hieno vasara.",
                    category: "Työkalut",
                    images: [
                    "sodfiuhgjbsudhbgu3w4y523q",
                    "fweijni23n4i2j3n4i2"
                    ],
                    price: 115.5,
                    doesShipping: false
                })
                .end(function(err, res){
                    expect(err).to.be.null;
                    expect(res).to.have.status(202);
                    done();
                })
            })
        })

        it('shoud reject request with missing fields from data structure(gives 401 if not logged in with jwt)',function (done){
            chai.request(serverAddress)
            .post('/login')
            .auth('Super_man', 'password')
            .end(function(err, res){
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                token = res.body.token;
                console.log("session specific token: ");
                console.log(token)
                chai.request(serverAddress)
                .put('/products/testProductId')
                .auth(token, { type: 'bearer' })
                .send({
                    title: "Haarukka",
                    images: [
                    "sodfiuhgjbsudhbgu3w4y523q",
                    "fweijni23n4i2j3n4i2"
                    ],
                    doesShipping: false
                })
                .end(function(err, res){
                    expect(err).to.be.null;
                    expect(res).to.have.status(400);
                done();
                })
            })
        })

        it('should reject request with incorrect datatypes',function (done){
            chai.request(serverAddress)
            .post('/login')
            .auth('Super_man', 'password')
            .end(function(err, res){
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                token = res.body.token;
                console.log("session specific token: ");
                console.log(token)
                chai.request(serverAddress)
                .put('/products/testProductId2')
                .auth(token, { type: 'bearer' })
                .send({
                    title: 12312314,
                    description: "Uusi ja hieno vasara.",
                    category: "Työkalut",
                    images: [
                    "sodfiuhgjbsudhbgu3w4y523q",
                    "fweijni23n4i2j3n4i2"
                    ],
                    price: "115.5",
                    doesShipping: false
                })
                .end(function(err, res){
                    expect(err).to.be.null;
                    expect(res).to.have.status(400);
                done();
                })
            })
        })

        it('shoud reject empty requests',function (done){
            chai.request(serverAddress)
            .post('/login')
            .auth('Super_man', 'password')
            .end(function(err, res){
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                token = res.body.token;
                console.log("session specific token: ");
                console.log(token)
                chai.request(serverAddress)
                .put('/products/testProductId')
                .auth(token, { type: 'bearer' })
                .end(function(err, res){
                    expect(err).to.be.null;
                    expect(res).to.have.status(400);
                done();
                })
            })
        })

        it('shoud contain added product data',function (done){
            chai.request(serverAddress)
            .get('/products')
            .end(function (err,res){
                expect(err).to.be.null;
                
                // check response status
                expect(res).to.have.status(200);
                //check response data structure
                let found = false;
                for(let i=0; i<res.body.length; i++){
                    if(res.body[i].title =="vasara" 
                    && res.body[i].description == "Uusi ja hieno vasara."
                    && res.body[i].category == "Työkalut"
                    && res.body[i].price == 115.5
                    && res.body[i].doesShipping == false){
                        found = true;
                        break;
                    }
                }
                if(found==false){
                    assert.fail('Data not saved');
                }
                done();
            })
        })

    })

    // DELETE PRODUCT ---------------------------------------------------------------------

    describe('DELETE /products/:productId', function () {
        
        it('should product when productId is correct (gives 401 if not logged in with jwt)',function (done){
            chai.request(serverAddress)
            .post('/login')
            .auth('Super_man', 'password')
            .end(function(err, res){
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                token = res.body.token;
                chai.request(serverAddress)
                .delete('/products/testProductId')
                .auth(token, { type: 'bearer' })

                .end(function(err, res){
                    expect(err).to.be.null;
                    expect(res).to.have.status(202);
                    done();
                })
            })
        })

        it('shoud reject request if not found (gives 401 if not logged in with jwt)',function (done){
            chai.request(serverAddress)
            .post('/login')
            .auth('Super_man', 'password')
            .end(function(err, res){
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                token = res.body.token;

                chai.request(serverAddress)
                .delete('/products/WrongProductId')
                .auth(token, { type: 'bearer' })
                .end(function(err, res){
                    expect(err).to.be.null;
                    expect(res).to.have.status(404);
                done();
                })
            })
        })

        it('shoud not contain added product data',function (done){
            chai.request(serverAddress)
            .get('/products')
            .end(function (err,res){
                expect(err).to.be.null;
                
                // check response status
                expect(res).to.have.status(200);
                //check response data structure
                let found = false;
                for(let i=0; i<res.body.length; i++){
                    if(res.body[i].title =="vasara" 
                    && res.body[i].description == "Uusi ja hieno vasara."
                    && res.body[i].category == "Työkalut"
                    && res.body[i].price == 115.5
                    && res.body[i].doesShipping == false){
                        found = true;
                        break;
                    }
                }
                if(found==true){
                    assert.fail('Data not saved');
                }
                done();
            })
        })

    })
})