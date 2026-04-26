const mongoose = require("mongoose");

const billSchema = new mongoose.Schema({
  bill_code: {
    type: Number,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  invoice_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Billing",
  },
});

const Bill = new mongoose.model("Bill", billSchema);
module.exports = Bill;
