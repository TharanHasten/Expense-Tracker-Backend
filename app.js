console.log("Node kathuka porom....");
console.log("Express um sethuka porom....");

const express = require("express");
const app = express();
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");
app.use(express.json());
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const PORT = 8000;

const mongourl =
  "your_url";

mongoose
  .connect(mongourl)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });

const expenseSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
});

const expenseModel = mongoose.model("expense-tracker", expenseSchema); //collection_name,schema_name

app.post("/api/expense", async (req, res) => {
  const { title, amount } = req.body;
  const newExpense = new expenseModel({
    id: uuidv4(),
    title: title,
    amount: amount,
  });
  const savedExpense = await newExpense.save();
  res.status(200).json(savedExpense);
});

app.get("/api/expense", async (req, res) => {
  const expenses = await expenseModel.find();
  res.status(200).json(expenses);
});

app.get("/api/expense/:id", async (req, res) => {
  const { id } = req.params;
  const expense = await expenseModel.findOne({ id });
  res.status(200).json(expense);
});

app.put("/api/expense/:id", async (req, res) => {
  const { id } = req.params;
  const { title, amount } = req.body;
  const updated = await expenseModel.findOneAndUpdate(
    {
      id: id,
    },
    {
      title: title,
      amount: amount,
    }
  );
  res.status(200).json(updated);
});

app.delete("/api/expense/:id", async (req, res) => {
  const { id } = req.params;
  const deleted = await expenseModel.findOneAndDelete({ id });
  res.status(200).json(deleted);
});

app.delete("/api/expense", async (req, res) => {
  const deleteAll = await expenseModel.deleteMany();
  res.status(200).json(deleteAll);
});
/*Authentication*/

//Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

//Model
const User = mongoose.model("User", userSchema);

//Register api
app.post("/api/user/register", async (req, res) => {
  const { username, password } = req.body;
  //Validation
  if (!username || !password) {
    return res.status(400).json({ message: "Username is required" });
  }
  //Check if user already exists
  const ExsistingUser = await User.find({ username });
  if (!ExsistingUser) {
    return res.status(400).json({ message: "User already exists" });
  }
  //Hash the password
  const hashedpass = await bcrypt.hash(password, 8);

  //Create new user
  const newUser = new User({
    username,
    password: hashedpass,
  });

  await newUser.save();

  return res.status(200).json({ message: "User registered successfully" });
});

//Login api
app.post("/api/user/login", async (req, res) => {
  const { username, password } = req.body;
  //Validation
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password is required" });
  }

  //Check if user exists
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }
  //Check if password is correct
  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const secret = "learn_nodejs";
  const token = jwt.sign({ username }, secret, { expiresIn: "5m" });

  return res.status(200).json({ message: "Login successful", token: token });
});

function authenticateToken(req, res, next) {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) return res.status(401);

  jwt.verify(token, "learn_nodejs", (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

app.get("/api/user/getAll", authenticateToken, async (req, res) => {
  const users = await User.find();
  res.status(200).json(users);
});
