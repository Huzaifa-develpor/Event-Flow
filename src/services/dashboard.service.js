import { Event } from "@/models/Event";
import { Registration } from "@/models/Registration";

export const getOrganizerDashboard = async (organizerId) => {
  const now = new Date();

  // 1. Date calculations for 'Upcoming This Week'
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endOfSevenDays = new Date(today);
  endOfSevenDays.setDate(today.getDate() + 7);
  endOfSevenDays.setHours(23, 59, 59, 999);

  // 2. Date calculation for Last 30 Days
  const last30Days = new Date(now);
  last30Days.setDate(last30Days.getDate() - 30);
  last30Days.setHours(0, 0, 0, 0);

  // 3. Fetch all events created by this organizer
  const events = await Event.find({ organizerId })
    .sort({ createdAt: -1 })
    .lean();

  const eventIds = events.map((event) => event._id);

  // 4. Fetch all registrations for these events
  const registrations = await Registration.find({
    eventId: { $in: eventIds },
  })
    .populate("eventId", "title date location")
    .sort({ createdAt: -1 })
    .lean();

  const totalEvents = events.length;
  const totalRegistrations = registrations.length;

  // 5. Total Revenue Calculation (Sum of ticketPrice of registrations)
  const totalRevenue = registrations.reduce((sum, reg) => {
    if (reg.registrationStatus === "cancelled" || reg.paymentStatus === "cancelled") {
      return sum;
    }
    return sum + (Number(reg.ticketPrice) || 0);
  }, 0);

  // 6. Check-in calculations
  const checkedInCount = registrations.filter((reg) => reg.checkedIn).length;

  const checkedInAverage =
    totalRegistrations > 0
      ? Math.round((checkedInCount / totalRegistrations) * 100)
      : 0;

  // 7. Upcoming This Week Calculation (Agley 7 din ke events)
  const upcomingThisWeek = events.filter((event) => {
    if (!event.date) return false;
    const eventDate = new Date(event.date);
    return eventDate >= today && eventDate <= endOfSevenDays;
  }).length;

  // 8. 30 Days Daily Registration Analytics
  const recentRegistrations = registrations.filter(
    (registration) => new Date(registration.createdAt) >= last30Days
  );

  const registrationAnalytics = [];

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const count = recentRegistrations.filter((registration) => {
      const registrationDate = new Date(registration.createdAt);
      return registrationDate >= date && registrationDate < nextDate;
    }).length;

    registrationAnalytics.push({
      date: date.toISOString().split("T")[0],
      registrations: count,
    });
  }

  // 9. Recent Activity List
  const recentEventActivity = events.slice(0, 10).map((event) => ({
    type: "event",
    message: `Event "${event.title}" was created`,
    date: event.createdAt,
    eventId: event._id,
  }));

  const recentRegistrationActivity = registrations
    .slice(0, 10)
    .map((registration) => ({
      type: "registration",
      message: `${registration.firstName} ${registration.lastName} registered for ${
        registration.eventId?.title || "an event"
      }`,
      date: registration.createdAt,
      registrationId: registration._id,
      eventId: registration.eventId?._id,
    }));

  const recentActivity = [
    ...recentEventActivity,
    ...recentRegistrationActivity,
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  // 10. Map MyEvents with registration stats
  const myEvents = events.map((event) => {
    const eventRegistrations = registrations.filter(
      (registration) =>
        registration.eventId?._id?.toString() === event._id.toString()
    );

    const eventCheckedIn = eventRegistrations.filter(
      (registration) => registration.checkedIn
    ).length;

    return {
      ...event,
      totalRegistrations: eventRegistrations.length,
      checkedIn: eventCheckedIn,
      remainingCapacity: Math.max(
        event.capacity - eventRegistrations.length,
        0
      ),
    };
  });

  // 11. Map Attendees List
  const attendees = registrations.map((registration) => ({
    registrationId: registration._id,
    eventId: registration.eventId?._id,
    eventTitle: registration.eventId?.title,
    firstName: registration.firstName,
    lastName: registration.lastName,
    email: registration.email,
    phone: registration.phone,
    ticketType: registration.ticketType,
    ticketPrice: registration.ticketPrice,
    paymentStatus: registration.paymentStatus,
    registrationStatus: registration.registrationStatus,
    checkedIn: registration.checkedIn,
    checkedInAt: registration.checkedInAt,
    createdAt: registration.createdAt,
  }));

  // 12. Check-in Stats Object
  const checkInStats = {
    totalRegistrations,
    checkedIn: checkedInCount,
    remaining: totalRegistrations - checkedInCount,
    percentage: checkedInAverage,
  };

  // 13. Final Output Payload
  return {
    overview: {
      totalEvents,
      totalRegistrations,
      checkedInAverage,
      upcomingThisWeek,
      totalRevenue,
    },
    registrationAnalytics,
    recentActivity,
    myEvents,
    attendees,
    checkInStats,
  };
};