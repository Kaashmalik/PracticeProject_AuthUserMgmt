const express = require('express');
const router = express.Router();

let friends = {}; // Assuming this is your friends object

router.get("/", function (req, res) {
  if (req.session.authorization) {
    res.send(JSON.stringify(friends, null, 4));
  } else {
    res.status(403).json({ message: "User not logged in" });
  }
});

router.get('/:email', function (req, res) {
  const email = req.params.email;
  res.send(friends[email]);
});

router.post("/", function (req, res) {
  if (req.body.email) {
    friends[req.body.email] = {
      "firstName": req.body.firstName,
      "lastName": req.body.lastName,
      "DOB": req.body.DOB,
    };
    res.send(`The user ${req.body.firstName} has been added!`);
  } else {
    res.status(400).json({ message: "Email is required" });
  }
});

router.put("/:email", function (req, res) {
  const email = req.params.email;
  let friend = friends[email];
  if (friend) {
    // Update firstName, lastName, and DOB if they exist in the request body
    if (req.body.firstName) friend["firstName"] = req.body.firstName;
    if (req.body.lastName) friend["lastName"] = req.body.lastName;
    if (req.body.DOB) friend["DOB"] = req.body.DOB;

    friends[email] = friend;
    res.send(`Friend with the email ${email} updated.`);
  } else {
    res.status(404).json({ message: "Unable to find friend!" });
  }
});

router.delete("/:email", (req, res) => {
  const email = req.params.email;
  if (email) {
    delete friends[email];
    res.send(`Friend with the email ${email} deleted.`);
  } else {
    res.status(400).json({ message: "Email is required" });
  }
});

module.exports = router;
