const express = require("express");
const app = express();
const port = 8081;
//const jwt  = require("jsonwebtoken");
const jwtSecret = "Group3KeyForJWT";
const headerTokenKey = "x-jwt-token";




app.listen(process.env.PORT || port, () => {
    

    //var os = require('os');
    //console.log('Listening at http://' + os.hostname + ':${port}')
    console.log(`Listening on port ${port}`);
});

app.get('/', (req, res) => { //can declare get our put route, first param is the route, second param is the function that is executed
    res.send("Hello world");
});

app.post('/hello', (req, res) => { //can declare get our put route, first param is the route, second param is the function that is executed
    res.send("Hello world post");
});