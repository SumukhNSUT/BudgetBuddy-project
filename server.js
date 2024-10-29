const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const dotenv = require("dotenv");
const path = require("path");
const flash = require("connect-flash");
const userRoutes = require("./routes/userRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const Transaction = require("./models/Transaction");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

mongoose
	.connect(process.env.MONGODB_URI)
	.then(() => console.log("MongoDB connected"))
	.catch((err) => console.error("MongoDB connection error:", err));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
	session({
		secret: process.env.SESSION_SECRET || "your-secret-key",
		resave: false,
		saveUninitialized: true,
		store: MongoStore.create({
			mongoUrl: process.env.MONGODB_URI,
			collectionName: "sessions",
		}),
		cookie: { secure: false },
	})
);

app.use(flash());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.use("/user", userRoutes);
app.use("/transaction", transactionRoutes);

app.get("/login", (req, res) => {
	res.render("login");
});

app.get("/register", (req, res) => {
	res.render("register");
});

app.get("/dashboard", async (req, res) => {
	if (!req.session.userId) {
		return res.redirect("/login");
	}
	const transactions = await Transaction.find({ userId: req.session.userId });
	res.render("dashboard", { transactions, flash: req.flash() });
});

app.get("/", (req, res) => {
	res.render("index");
});

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
