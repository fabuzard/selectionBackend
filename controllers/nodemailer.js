import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "rhazesnote@gmail.com",
    pass: "sthejwtmcleszlgd",
  },
});

export default transporter;
