import { Event } from "@/models/Event";
import { User } from "@/models/User";

export const createEvent = async (eventData, organizerId) => {
  const capacity = Number(eventData.capacity) || 0;

  const user = await User.findById(organizerId);

  if (user && user.role === "user") {
    user.role = "organizer";
    await user.save();
  }

  const event = await Event.create({
    ...eventData,
    organizerId,
    availableSeats: capacity,
    isBookable: capacity > 0,
  });

  return { event, user }; 
};

export const getAllEvents = async () => {
  const events = await Event.find({
    status: "published",
  })
    .populate("organizerId", "firstName lastName email phone")
    .sort({ date: 1 });

  return events;
};

export const getEventById = async (eventId) => {
  const event = await Event.findById(eventId).populate(
    "organizerId",
    "firstName lastName email phone"
  );

  if (!event) {
    throw new Error("Event Not Found");
  }

  return event;
};

export const updateEventStatus = async (eventId, organizerId, status) => {
  const event = await Event.findOneAndUpdate(
    { _id: eventId, organizerId },
    { status },
    { new: true }
  );

  if (!event) {
    throw new Error("Event not found or unauthorized");
  }

  return event;
};

export const bookEventSeats = async (eventId, seatsCount = 1) => {
  const event = await Event.findOneAndUpdate(
    {
      _id: eventId,
      availableSeats: { $gte: seatsCount },
      status: "published",
    },
    {
      $inc: { availableSeats: -seatsCount },
    },
    { new: true }
  );

  if (!event) {
    throw new Error("Seats unavailable or event not bookable");
  }

  if (event.availableSeats === 0 && event.isBookable) {
    event.isBookable = false;
    await event.save();
  }

  return event;
};