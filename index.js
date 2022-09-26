const express = require("express");
const app = express();
const port = 8080;
const jwt  = require("jsonwebtoken");
const jwtSecret = "Group3KeyForJWT";
const headerTokenKey = "x-jwt-token";


app.listen(process.env.PORT || port, () => { //declare a web server
    console.log(`Listening at http://localhost:${port}`) //careful with slanted single quote
});

const jwtValidateUserMiddleware = (req, res, next) => {
    console.log("validate user");

    let token = req.header(headerTokenKey);
    if (token == "LOGGING-OUT") {
        console.log("user logout");
        res.send({message: "good to exit"});
        return;
    }

    if (token) {
        try {
            console.log("verify " + token)
            let decoded = jwt.verify(token, jwtSecret);
            req.decodedToken = decoded;
            console.log("user validated " + decoded);
            next();
        } catch (err) {
            res.status(401).send({error: "Invalid token", fullError: err});
        }
    } else {
        res.status(401).send({error: "Token is required"});
    }
}

app.get('/', (req, res) => { //can declare get our put route, first param is the route, second param is the function that is executed
    res.send("Hello world");
});

