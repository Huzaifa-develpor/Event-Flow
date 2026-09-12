import mongoose, { Schema, models } from "mongoose";

const paymentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    registrationId: {
      type: Schema.Types.ObjectId,
      ref: "Registration",
      required: function () {
        return this.paymentType === "attendee";
      },
    },

    paymentType: {
      type: String,
      enum: ["organizer", "attendee"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "PKR",
    },

    paymentStatus: {
      type: String,
      enum: [
        "pending",
        "processing",
        "completed",
        "failed",
        "refunded",
        "cancelled",
      ],
      default: "pending",
    },

    paymentMethod: {
      type: String,
      enum: ["card"],
      default: "card",
    },

    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },

    gateway: {
      type: String,
      default: "safepay",
    },

    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const Payment =
  models.Payment || mongoose.model("Payment", paymentSchema);