import { db } from "../connect.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "../controllers/nodemailer.js";

export const register = (req, res) => {
  //check if exist
  console.log(req.body);
  const q = "SELECT * FROM users WHERE username = ? OR email = ?";
  db.query(q, [req.body.username, req.body.email], (err, data) => {
    console.log(err, data, req.body);
    if (err) return res.status(500).json({ message: err });
    if (data.length)
      return res.status(409).json({ message: "User already exist!" });
    //create new user
    //hash password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);

    const q =
      "INSERT INTO users (`username`,`email`,`password`,`name`, `isVerified`) VALUES (?)";
    const values = [
      req.body.username,
      req.body.email,
      hashedPassword,
      req.body.name,
      0,
    ];
    db.query(q, [values]);

    const { username, email } = req.body;

    const accessToken = jwt.sign({ username, email }, process.env.SECRET);

    // nodemail
    let mail = {
      from: "Admin <rhazesnote@gmail.com>",
      to: email,
      subject: `Accunt Registration`,
      html: `<div>
			<p>Thanks for register, you need to activate your account,</p>
			<a href="http://localhost:3800/verify/${accessToken}">Click Here</a>
			<span>to activate</span>
			</div>`,
    };

    // let response = nodemailer.sendMail(mail);

    return res
      .status(201)
      .cookie("accessToken", accessToken, {
        httpOnly: true,
      })
      .json({
        accessToken,
        username,
      });
  });
};
export const login = (req, res) => {
  const q = "SELECT * FROM users WHERE username = ?";

  db.query(q, [req.body.username], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json("User not found!");

    const checkPassword = bcrypt.compareSync(
      req.body.password,
      data[0].password
    );

    if (!checkPassword)
      return res.status(400).json("Wrong password or username!");

    const token = jwt.sign({ id: data[0].id }, process.env.SECRET);

    const { password, ...others } = data[0];

    res
      .cookie("accessToken", token, {
        httpOnly: true,
      })
      .status(200)
      .json(others);
  });
};
export const logout = (req, res) => {
  console.log("WEIOF WEOIF");
};

export const verify = async (req, res) => {
  const verifyToken = req.body.accessToken;
  const tokenData = await jwt.verify(verifyToken, process.env.SECRET);
  const q = `SELECT * FROM users WHERE email = ?`;
  db.query(q, [tokenData.email], (err, data) => {
    if (err) return res.status(500).json({ message: err });
    if (data.length) {
      let updateQuery = `UPDATE users SET isVerified = 1 WHERE email = ?`;

      db.query(updateQuery, [tokenData.email], (err, data) => {
        return res.status(200).json({ message: "Success verify" });
        console.log(err, data);
      });
      console.log(data);
    }
  });
};

export const forgotPassword = async (req, res) => {
  // cek email-nya ada ga

  const q = `SELECT * FROM users WHERE email = ?`;
  db.query(q, [req.body.email], (err, data) => {
    if (err) return res.status(500).json({ message: err });
    if (data.length) {
      const accessToken = jwt.sign(
        { email: req.body.email },
        process.env.SECRET
      );

      let mail = {
        from: "Admin <rhazesnote@gmail.com>",
        to: req.body.email,
        subject: `Forgot password`,
        html: `<div>
          <p>Here is the link to reset your password ,</p>
          <a href="http://localhost:3000/reset-password/${accessToken}">Click Here</a>
          <span>to reset</span>
          </div>`,
      };

      let response = nodemailer.sendMail(mail);
      return res.status(200).json({ message: "Email sent" });
    }
  });
};

export const resetPassword = async (req, res) => {
  const q = "SELECT * FROM users WHERE email = ?";
  db.query(q, [req.body.email], (err, data) => {
    if (err) return res.status(500).json({ message: err });
    if (data.length) {
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(req.body.password, salt);
      let updateQuery = `UPDATE users SET password = ? WHERE email = ?`;

      db.query(updateQuery, [hashedPassword, req.body.email], (err, data) => {
        if (err) return res.status(500).json({ message: err });
        return res.status(200).json({ message: "Success reset password " });
      });
    }
  });
};
