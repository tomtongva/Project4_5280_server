const express = require("express");
const app = express();
const port = 8080;
const jwt  = require("jsonwebtoken");
const jwtSecret = "Group3KeyForJWT";
const headerTokenKey = "x-jwt-token";

const { networkInterfaces } = require('os');

const nets = networkInterfaces();
const results = Object.create(null); // Or just '{}', an empty object


app.listen(process.env.PORT || port, () => {
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
            const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
            if (net.family === familyV4Value && !net.internal) {
                if (!results[name]) {
                    results[name] = [];
                }
                results[name].push(net.address);
            }
        }
    }
    console.log(results);

    //var os = require('os');
    //console.log('Listening at http://' + os.hostname + ':${port}')
    console.log(`Listening on port ${port}`);
    console.log(`${process.env.PORT}`);
});

app.get('/', (req, res) => { //can declare get our put route, first param is the route, second param is the function that is executed
    res.send("Hello world");
});

app.post('/hello', (req, res) => { //can declare get our put route, first param is the route, second param is the function that is executed
    res.send("Hello world post");
});
