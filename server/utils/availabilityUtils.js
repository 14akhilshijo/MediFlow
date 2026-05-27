const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const getDayName = (date) => DAYS[new Date(date).getDay()];

export const generateTimeSlots = (startTime, endTime, interval = 30) => {
  const slots = [];

  const [startH, startM] = startTime.split(":").map(Number);
  const [endH,   endM]   = endTime.split(":").map(Number);

  let current = startH * 60 + startM;
  const end   = endH   * 60 + endM;

  while (current < end) {
    const h   = Math.floor(current / 60);
    const m   = current % 60;
    const ampm = h < 12 ? "AM" : "PM";
    const h12  = h === 0 ? 12 : h > 12 ? h - 12 : h;
    slots.push(`${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`);
    current += interval;
  }

  return slots;
};

export const getSlotsForDate = (availableSlots, date, interval = 30) => {
  const dayName = getDayName(date);

  const daySlots = availableSlots.filter(
    (s) => s.day === dayName && s.isAvailable
  );

  if (daySlots.length === 0) return [];

  const allSlots = new Set();
  for (const slot of daySlots) {
    const generated = generateTimeSlots(slot.startTime, slot.endTime, interval);
    generated.forEach((s) => allSlots.add(s));
  }

  return [...allSlots].sort((a, b) => {
    const toMinutes = (t) => {
      const [time, ampm] = t.split(" ");
      let [h, m] = time.split(":").map(Number);
      if (ampm === "PM" && h !== 12) h += 12;
      if (ampm === "AM" && h === 12) h = 0;
      return h * 60 + m;
    };
    return toMinutes(a) - toMinutes(b);
  });
};

export const isDoctorAvailableOnDate = (availableSlots, date) => {
  const dayName = getDayName(date);
  return availableSlots.some((s) => s.day === dayName && s.isAvailable);
};

export const buildWeeklySchedule = (availableSlots, interval = 30) => {
  const schedule = {};
  for (const slot of availableSlots) {
    if (!slot.isAvailable) continue;
    if (!schedule[slot.day]) schedule[slot.day] = new Set();
    const generated = generateTimeSlots(slot.startTime, slot.endTime, interval);
    generated.forEach((s) => schedule[slot.day].add(s));
  }
  return Object.fromEntries(
    Object.entries(schedule).map(([day, set]) => [day, [...set]])
  );
};

export const isSlotInSchedule = (availableSlots, date, timeSlot) => {
  const slots = getSlotsForDate(availableSlots, date);
  return slots.includes(timeSlot);
};
