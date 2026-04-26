const mongoose = require("mongoose");

const invoiceDetailSchema = new mongoose.Schema({
  bill_code: {
    type: Number,
    required: true,
  },
  amount: {
    type: Number,
    required: truen,
  },
  invoice_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Invoice",
  },
});

const InvoiceDetail = new mongoose.model("InvoiceDetail", invoiceDetailSchema);
module.exports = InvoiceDetail;
