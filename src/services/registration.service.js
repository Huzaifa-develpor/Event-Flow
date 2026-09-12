import { Registration } from "@/models/Registration";
import { Event } from "@/models/Event";
import QRCode from "qrcode";
import crypto from "crypto";

export const confirmRegistrationPayment = async (registrationId, userId) => {
  const registration = await Registration.findOne({ _id: registrationId, userId });

  if (!registration) {
    throw new Error("Registration not found");
  }

  if (registration.registrationStatus === "confirmed") {
    return registration; // already confirmed, dobara process mat karo
  }

  const ticketCode = `TKT-${registration._id.toString().slice(-6).toUpperCase()}-${crypto
    .randomBytes(3)
    .toString("hex")
    .toUpperCase()}`;

  const qrCode = await QRCode.toDataURL(ticketCode); // base64 image, koi external service nahi

  registration.paymentStatus = "completed";
  registration.registrationStatus = "confirmed";
  registration.ticketCode = ticketCode;
  registration.qrCode = qrCode;

  await registration.save();

  return registration;
};

export const checkRegistration = async (eventId, userId) => {
  const registration = await Registration.findOne({
    eventId,
    userId,
    registrationStatus: { $ne: "cancelled" },
  });

  return !!registration;
};


export const createRegistration = async (data, userId) => {
  const event = await Event.findById(data.eventId);

  if (!event) {
    throw new Error("Event not found");
  }

  if (event.status !== "published") {
    throw new Error("Event is not available for registration");
  }

  const ticket = event.tickets.find(
    (ticket) => ticket.type === data.ticketType
  );

  if (!ticket) {
    throw new Error("Invalid ticket type");
  }

  if (ticket.quantity <= 0) {
    throw new Error("Ticket is sold out");
  }

  const existingRegistration = await Registration.findOne({
    userId,
    eventId: data.eventId,
    registrationStatus: { $ne: "cancelled" },
  });

  if (existingRegistration) {
    throw new Error("You are already registered for this event");
  }

  
  const registration = await Registration.create({
    ...data,
    userId,
    ticketPrice: ticket.price,
    paymentStatus: "pending",
    registrationStatus: "pending",
  });


  ticket.quantity -= 1;

  await event.save();

  return registration;
};

export const cancelRegistration = async (registrationId, userId) => {
  const registration = await Registration.findOne({
    _id: registrationId,
    userId,
  });

  if (!registration) {
    throw new Error("Registration not found");
  }

  if (registration.registrationStatus === "cancelled") {
    throw new Error("Registration already cancelled");
  }

  registration.registrationStatus = "cancelled";

  await registration.save();

  return registration;
};

// Get Event Registrations
export const getEventRegistrations = async (eventId, organizerId) => {
  const event = await Event.findOne({
    _id: eventId,
    organizerId,
  });

  if (!event) {
    throw new Error("Event not found or unauthorized");
  }

  return await Registration.find({ eventId })
    .populate("userId", "firstName lastName email")
    .sort({ createdAt: -1 });
};

