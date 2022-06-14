const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { tokenVerify } = require("./middlewares");
const { check, validationResult } = require("express-validator");

router.get("/admin/home", tokenVerify, (req, res) => {
  res.status(201).send("admin  page...");
});

router.post(
  "/admin/register",
  [
    check("name")
      .not()
      .isEmpty()
      .isLength({ min: 3 })
      .withMessage("name is required of minimum length 3"),
    check("email").isEmail().withMessage("required valid email"),
    check("password")
      .isLength({ min: 6 })
      .withMessage("password is of minimum of length 6"),
    check("contact")
      .isLength({ min: 10, max: 10 })
      .withMessage("mobile number of 10 digits"),
    check("role").not().isEmpty().withMessage("role is required"),
  ],

  async (req, res) => {
    const errors = validationResult(req);
    console.log("error", errors);
    if (!errors.isEmpty()) {
      return res.status(401).send({ message: errors });
    } else {
      const data = await User.findOne({ email: req.body.email });
      if (data) {
        return res.status(401).send({ message: "email already exist..." });
      }

      const salt = await bcrypt.genSalt(10);
      const secpass = await bcrypt.hash(req.body.password, salt);

      const user = new User({
        name: req.body.name,

        email: req.body.email,
        password: secpass,
        contact: req.body.contact,
        role: req.body.role,
      });
      const newuser = await user.save();
      console.log("user", newuser);
      return res
        .status(201)
        .send({ message: "admin created successfully...." });
    }
  }
);

router.post(
  "/admin/login",

  async (req, res) => {
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //   return res.send({ errors: errors.array() });
    // }
    console.log("body", req.body);
    const user = await User.findOne({
      email: req.body.email,
    });
    if (user) {
      console.log("adminuser", user);
      if (
        (await bcrypt.compare(req.body.password, user.password)) &&
        user.role === "admin"
      ) {
        const token = jwt.sign(
          { _id: user._id, role: user.role },
          process.env.SECRET_KEY,
          {
            expiresIn: "5h",
          }
        );
        res.cookie("token", token, { expiresIn: "5h" });
        //  const { name, email, password, role } = user
        return res.status(201).send({
          token: token,
          user: user,
          message: "admin login successfully.",
        });

        return res
          .status(201)
          .send({ message: " admin login successfully.", data: user });
      }
      return res.status(401).send({ message: "invalid admin user..." });
    }
    return res
      .status(401)
      .send({ message: " this admin user doesn't exist..." });
  }
);

router.post("/admin/signout", tokenVerify, (req, res) => {
  res.clearCookie("token");
  res.status(201).json({ message: "siunout successfully" });
});
module.exports = router;
