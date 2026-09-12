import { Payment } from "@/models/Payment";
import { Event } from "@/models/Event";
import { Registration } from "@/models/Registration";


// Create Organizer Payment
export const createOrganizerPayment = async (
  userId,
  eventId,
  amount
) => {
  const event = await Event.findOne({
    _id: eventId,
    organizerId: userId,
  });

  if (!event) {
    throw new Error("Event not found or unauthorized");
  }

  const payment = await Payment.create({
    userId,
    eventId,
    paymentType: "organizer",
    amount,
    currency: "PKR",
    paymentStatus: "pending",
    paymentMethod: "card",
  });

  return payment;
};


// Create Attendee Payment
export const createAttendeePayment = async (
  userId,
  registrationId
) => {
  const registration = await Registration.findOne({
    _id: registrationId,
    userId,
  });

  if (!registration) {
    throw new Error("Registration not found");
  }

  const payment = await Payment.create({
    userId,
    eventId: registration.eventId,
    registrationId,
    paymentType: "attendee",
    amount: registration.ticketPrice,
    currency: "PKR",
    paymentStatus: "pending",
    paymentMethod: "card",
  });

  return payment;
};


// Update Payment Status
export const updatePaymentStatus = async (
  paymentId,
  status,
  transactionId
) => {
  const payment = await Payment.findById(paymentId);

  if (!payment) {
    throw new Error("Payment not found");
  }

  payment.paymentStatus = status;

  if (transactionId) {
    payment.transactionId = transactionId;
  }

  if (status === "completed") {
    payment.paidAt = new Date();
  }

  await payment.save();

  return payment;
};