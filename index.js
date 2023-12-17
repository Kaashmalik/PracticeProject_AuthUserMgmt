const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const routes = require('./router/friends');

let users = [];
let friends = {}; // Assuming this is your friends object

const doesExist = (username) => {
  let usersWithSameName = users.filter((user) => user.username === username);
  return usersWithSameName.length > 0;
};

const authenticatedUser = (username, password) => {
  let validUsers = users.filter((user) => user.username === username && user.password === password);
  return validUsers.length > 0;
};

const app = express();

app.use(express.json());
app.use(session({
  secret: "fingerpint",
  resave: false,
  saveUninitialized: true
}));

app.use("/friends", function auth(req, res, next) {
  if (req.session.authorization) {
    const token = req.session.authorization.accessToken;
    jwt.verify(token, "access", (err, user) => {
      if (!err) {
        req.user = user;
        next();
      } else {
        return res.status(403).json({ message: "User not authenticated" });
      }
    });
  } else {
    return res.status(403).json({ message: "User not logged in" });
  }
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Error logging in. Username and password are required" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken,
      username
    };

    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(401).json({ message: "Invalid Login. Check username and password" });
  }
});

app.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!doesExist(username)) {
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(409).json({ message: "User already exists!" });
    }
  } else {
    return res.status(400).json({ message: "Unable to register user. Username and password are required" });
  }
});

const PORT = 5000;

app.use("/friends", routes);

app.get('/', (req, res) => {
  res.send('Welcome to the authentication and user management system!');
});

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
