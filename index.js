const express = require("express") //import express library
const app = express() //app is an instance of express
const port = 8080 //port number for application

app.listen(process.env.PORT || port, () => { //declare a web server
   		console.log(`Listening at http://localhost:${port}`) //careful with slanted single quote
});

app.get('/', (req, res) => { //can declare get our put route, first param is the route, second param is the function that is executed
    res.send("Hello world");
});

app.post("/api/auth", async (req, res) => {

    res.send("Hello world post");
});