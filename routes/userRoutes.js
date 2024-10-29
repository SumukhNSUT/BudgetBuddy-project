const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

router.post("/register", async (req, res) => {
	const { username, password, email } = req.body;
	const hashedPassword = await bcrypt.hash(password, 10);
	const newUser = new User({ username, password: hashedPassword, email });
	await newUser.save();
	res.redirect("/login");
});

router.post("/login", async (req, res) => {
	const { username, password } = req.body;
	const user = await User.findOne({ username });
	if (user && (await bcrypt.compare(password, user.password))) {
		req.session.userId = user._id;
		res.redirect("/dashboard");
	} else {
		res.redirect("/login");
	}
});

router.get("/logout", (req, res) => {
	req.session.destroy((err) => {
		if (err) {
			return res.redirect("/dashboard");
		}
		res.redirect("/");
	});
});

module.exports = router;
