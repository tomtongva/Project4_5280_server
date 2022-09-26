const express = require("express") //import express library
const app = express() //app is an instance of express
const port = 8080 //port number for application
const jwt  = require("jsonwebtoken");
const jwtSecret = "Group3KeyForJWT";
const headerTokenKey = "x-jwt-token";

app.listen(process.env.PORT || port, () => { //declare a web server
   		console.log(`Listening at http://localhost:${port}`) //careful with slanted single quote
});

app.get('/', (req, res) => { //can declare get our put route, first param is the route, second param is the function that is executed
    res.send("Hello world");
});

app.post("/api/auth", async (req, res) => {

    res.send("Hello world post");
});

app.post("/api/auth", async (req, res) => {

    let user = await findUser(req.body.email, req.body.password);
    console.log("found " + user);
    if (user) {
        let token = jwt.sign({uid: user._id, name: user.firstName + " " + user.lastName, 
                                exp:Math.floor(Date.now()/1000)+60*1,
                                currentTime:Date.now()}, jwtSecret);
        console.log("generating token for " + user.firstName);

        res.send({email: user.email, firstName: user.firstName, lastName: user.lastName, gender: user.gender,
            city: user.city, token: token, age: user.age, weight: user.weight, address: user.address});
    } else {
        res.status(401).send({error: "You're not found"});
    }
});