import express from "express";
import dotenv from "dotenv";
const app = express();
dotenv.config();
import userRoutes from "./routes/users.js";
import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/posts.js";
import commentRoutes from "./routes/comments.js";
import likeRoutes from "./routes/likes.js";

//middlewares
app.use(express.json(), express.urlencoded());

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/auths", authRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/likes", likeRoutes);

app.listen(8800, () => {
  console.log("working");
});
