const mongoose = require("mongoose");

const clientAgreementSchema = new mongoose.Schema(
  {
    serviceProvider: { type: String, required: false },
    spContact: { type: String, required: false },
    clientName: { type: String, required: true },
    clientEmail: { type: String, required: true },
    clientAddress: { type: String, required: false },
    clientContact: { type: String, required: false },
    agreementStart: { type: Date, required: false },
    agreementEnd: { type: Date, required: true },
    termOption: { type: String, required: false },
    totalAmount: { type: Number, required: true },
    // ✅ Add this new line to your schema
    receivedPayment: { type: Number, default: 0 },
    paymentSchedule: { type: String, required: false },
    paymentMethod: { type: String, required: false },
    latePaymentFee: { type: Number, required: false },
    latePaymentDays: { type: Number, required: false },
    terminationDays: { type: Number, required: false },
    ownershipOption: { type: String, required: false },
    spSignature: { type: String, required: false },
    spNameTitle: { type: String, required: false },
    spDate: { type: Date, required: false },
    clientSignature: { type: String, required: false },
    clientNameTitle: { type: String, required: false },
    clientDate: { type: Date, required: false },
    agreed: { type: Boolean, required: false },
    project: { type: String, required: true },
    status: {
      type: String,
      enum: ["Active", "In Progress", "Completed"],
      default: "Active",
    },
  },
  { timestamps: true }
);

const ClientAgreement = mongoose.model(
  "ClientAgreement",
  clientAgreementSchema
);

module.exports = ClientAgreement;
