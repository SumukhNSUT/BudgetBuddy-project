const express = require("express");
const Transaction = require("../models/Transaction");

const router = express.Router();

router.post("/add", async (req, res) => {
    const { amount, type, category } = req.body;

    const transactions = await Transaction.find({ userId: req.session.userId });
    const currentBalance = transactions.reduce((total, transaction) => {
        return (
            total +
            (transaction.type === "income" ? transaction.amount : -transaction.amount)
        );
    }, 0);

    if (type === "expense" && currentBalance < amount) {
        req.flash("error", "Transaction failed! Not enough amount.");
        return res.redirect("/dashboard");
    }

    const transaction = new Transaction({
        userId: req.session.userId,
        amount,
        type,
        category,
    });
    await transaction.save();
    req.flash("success", "Transaction added successfully!");
    res.redirect("/dashboard");
});

router.post("/delete/:id", async (req, res) => {
    await Transaction.findByIdAndDelete(req.params.id);
    req.flash("success", "Transaction deleted successfully!");
    res.redirect("/dashboard");
});

router.get("/", async (req, res) => {
    const transactions = await Transaction.find({ userId: req.session.userId });
    res.render("dashboard", { transactions });
});

module.exports = router;
