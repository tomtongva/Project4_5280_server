const express = require("express");
const app = express();
const port = 8080;
const jwt = require("jsonwebtoken");
const jwtSecret = "Group3KeyForJWT";
const headerTokenKey = "x-jwt-token";
const bcrypt = require("bcryptjs");
const bcryptSaltNum = 12;

app.listen(process.env.PORT || port, () => {
  console.log(`Listening on port ${port}`);
  console.log(`${process.env.PORT}`);
});

app.get("/", (req, res) => {
  //can declare get our put route, first param is the route, second param is the function that is executed
  res.send("Hello world");
});

app.post("/hello", (req, res) => {
  //can declare get our put route, first param is the route, second param is the function that is executed
  res.send("Hello world post");
});

const jwtValidateUserMiddleware = (req, res, next) => {
  console.log("validate user");

  let token = req.header(headerTokenKey);
  if (token == "LOGGING-OUT") {
    console.log("user logout");
    res.send({ message: "good to exit" });
    return;
  }

  if (token) {
    try {
      console.log("verify " + token);
      let decoded = jwt.verify(token, jwtSecret);
      req.decodedToken = decoded;
      console.log("user validated " + decoded);
      next();
    } catch (err) {
      res.status(401).send({ error: "Invalid token", fullError: err });
    }
  } else {
    res.status(401).send({ error: "Token is required" });
  }
};

app.use(express.urlencoded());
app.use(express.json());
app.post("/api/auth", async (req, res) => {
  let user = await findUser(req.body.email, req.body.password);
  console.log("found " + user);
  if (user) {
    let token = jwt.sign(
      {
        uid: user._id,
        name: user.firstName + " " + user.lastName,
        exp: Math.floor(Date.now() / 1000) + 60 * 1,
        currentTime: Date.now(),
      },
      jwtSecret
    );
    console.log("generating token for " + user.firstName);

    res.send({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      gender: user.gender,
      city: user.city,
      token: token,
      age: user.age,
      weight: user.weight,
      address: user.address,
    });
  } else {
    res.status(401).send({ error: "You're not found" });
  }
});

app.post("/api/user/update", jwtValidateUserMiddleware, async (req, res) => {
  let updated = await updateUser(
    req.decodedToken.uid,
    req.body.firstName,
    req.body.lastName,
    req.body.gender,
    req.body.city,
    req.body.age,
    req.body.weight,
    req.body.address
  );
  if (updated) {
    console.log("send successful updated response back");

    let decodedToken = req.decodedToken;

    res.send({ message: "user updated", data: { decoded: decodedToken } });
  } else {
    console.log("send failed update response back");
    res.status(401).send({ error: "user update failed" });
  }
});

const emailValidator = require("deep-email-validator"); //npm install deep-email-validator, https://www.abstractapi.com/guides/node-email-validation
async function isEmailValid(email) {
  return emailValidator.validate(email);
}

app.post("/api/signup", async (req, res) => {
  console.log("signup new user " + req.body.email);

  const { valid, reason, validators } = await isEmailValid(req.body.email);

  if (!valid && !validators[reason].reason.includes("suggested email")) {
    console.log("registration missing valid email");
    return res.status(401).send({
      message: "valid email required",
      reason: validators[reason].reason,
    });
    return;
  }

  if (null == req.body.password) {
    console.log("registration missing password");
    res.status(401).send({ error: "password required" });
    return;
  }

  if (null == req.body.firstName) {
    console.log("registration missing first name");
    res.status(401).send({ error: "first name required" });
    return;
  }

  if (null == req.body.lastName) {
    console.log("registration missing last name");
    res.status(401).send({ error: "last name required" });
    return;
  }

  if (null == req.body.gender) {
    console.log("registration missing gender");
    res.status(401).send({ error: "gender required" });
    return;
  }

  if (null == req.body.city) {
    console.log("registration missing city");
    res.status(401).send({ error: "city required" });
    return;
  }

  let userId = null;
  try {
    userId = await createUser(
      req.body.email,
      req.body.password,
      req.body.firstName,
      req.body.lastName,
      req.body.gender,
      req.body.city
    );
  } catch (exception) {
    console.log(exception);
    res.status(401).send({ error: "Unable to register at this time " });
    return;
  }

  res.send({
    message: "You're registered ",
    id: userId,
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    gender: req.body.gender,
    city: req.body.city,
  });
});

app.post(
  "/api/logout",
  async (req, res) => {
    console.log("logout user " + req.body.email);
    delete req.headers[headerTokenKey];
    let userId;
  },
  jwtValidateUserMiddleware
);

const { MongoClient } = require("mongodb");
// Connection URI
const uri =
  "mongodb+srv://group35280:uncc2022@cluster0.rts9eht.mongodb.net/test";
//"mongodb://localhost:27017/?maxPoolSize=20&w=majority"; //mongodb+srv://localhost:27017/?maxPoolSize=20&w=majorit
// Create a new MongoClient
const client = new MongoClient(uri);

async function createUser(email, password, firstName, lastName, gender, city) {
  try {
    await client.connect();

    const doc = {
      email: email,
      password: getEncryptedPassword(password),
      firstName: firstName,
      lastName: lastName,
      gender: gender,
      city: city,
    };
    const result = await client.db("users").collection("user").insertOne(doc);
    if (result) {
      console.log("user created with id " + result.insertedId);
      return result.insertedId;
    }
  } finally {
    await client.close();
  }
}

async function findUser(email, password) {
  try {
    console.log("findUser connect to db start");
    await client.connect();

    var user = await client
      .db("users")
      .collection("user")
      .findOne({ email: email, password: getEncryptedPassword(password) });

    if (user) {
      console.log("user is " + user.name);
      return user;
    }
  } finally {
    await client.close();
  }
}

async function updateUser(
  uid,
  firstName,
  lastName,
  gender,
  city,
  age,
  weight,
  address
) {
  try {
    await client.connect();

    const filter = { uid: uid };
    console.log("attempt to update " + uid);
    const updateDoc = {
      $set: {
        firstName: firstName,
        lastName: lastName,
        gender: gender,
        city: city,
        age: age,
        weight: weight,
        address: address,
      },
    };
    var updated = await client
      .db("users")
      .collection("user")
      .updateOne(filter, updateDoc);
    if (updated) {
      console.log("user was updated ");
    }
    return updated;
  } finally {
    await client.close();
  }
}

async function getEncryptedPassword(password) {
  let salt = await bcrypt.genSalt(bcryptSaltNum);
  let encryptedPassword = await bcrypt.hash(password, salt);
  console.log("password " + password + " " + encryptedPassword);

  return encryptedPassword;
}
