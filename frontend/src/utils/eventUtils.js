export const getEventStatus = (event) => {
  if (!event) return 'PAST';

  const now = new Date();
  
  // Parse start time (fallback to event.date if needed)
  const startStr = event.startTime || event.date;
  if (!startStr) return 'PAST';
  const startTime = new Date(startStr);

  // Parse end time (fallback to event.endDate if needed)
  const endStr = event.endTime || event.endDate;
  // If no end time is provided, assume worst case event duration (e.g., 2 hours) 
  // or simply use startTime. Let's assume an event lasts 2 hours if no end time.
  const endTime = endStr ? new Date(endStr) : new Date(startTime.getTime() + 2 * 60 * 60 * 1000);

  if (now < startTime) {
    return 'UPCOMING';
  } else if (now >= startTime && now <= endTime) {
    return 'ONGOING';
  } else {
    return 'PAST';
  }
};

export const isEventUpcoming = (event) => getEventStatus(event) === 'UPCOMING';
export const isEventOngoing = (event) => getEventStatus(event) === 'ONGOING';
export const isEventPast = (event) => getEventStatus(event) === 'PAST';
