const express = require("express");
const User = require("../models/user");
const router = express.Router();
const { jwtAuthMiddleware, generateToken } = require("../jwt");

router.post("/signup", async (req, res) => {
  try {
    const data = req.body;
    const newUser = new User(data);
    const response = await newUser.save();
    console.log("data saved");
    const payload = {
      id: response.id,
    };
    console.log(JSON.stringify(payload));
    const token = generateToken(payload);
    console.log("Token is : ", token);
    res.status(200).send({ response: response, token: token });
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

//Login route
router.post("/login", async (req, res) => {
  try {
    const { aadharCardNumber, password } = req.body;
    const user = await User.findOne({ aadharCardNumber: aadharCardNumber });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid Username or password" });
    }
    const payload = {
      id: user.id,
    };
    const token = generateToken(payload);
    res.json({ token: token });
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

//Profile Route
router.get("/profile", jwtAuthMiddleware, async (req, res) => {
  try {
    const userData = req.user;
    // console.log("User Data: ",userData);

    const userID = req.user.id;
    const user = await User.findById(userID);

    res.status(200).json(user);
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

//PUT/PATCH Method API to delete the Person Records  ( person/:id )
router.put("/profile/password", jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user;
    const { currentPassword, newPassword } = req.body;

    //Find the user from the username
    const user = await User.findById(userId);

    //if the user does not exist or password does not match ,return error
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ message: "Invalid Username or password" });
    }

    //Update the user's password
    user.password = newPassword;
    await user.save();

    console.log("Password Updated");
    res.status(200).json({ message: "Password Updated" });
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

module.exports = router;
