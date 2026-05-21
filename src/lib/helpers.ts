const getTimeDifference = (
  start: string | undefined,
  end: string | undefined,
) => {
  if (!start || !end) {
    return "";
  }

  const startDate = new Date(`2000-01-01T${start}`);
  const endDate = new Date(`2000-01-01T${end}`);

  let diffMs = endDate.getTime() - startDate.getTime();

  // handle crossing midnight
  if (diffMs < 0) {
    diffMs += 24 * 60 * 60 * 1000;
  }

  const totalMinutes = Math.floor(diffMs / (1000 * 60));

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours && minutes) {
    return `${hours}h ${minutes}m`;
  }

  if (hours) {
    return `${hours}h`;
  }

  return `${minutes}m`;
};

const currentHour = new Date().getHours();

const getShiftByTime = () => {
  if (currentHour >= 5 && currentHour < 12) {
    return "morning";
  }

  if (currentHour >= 12 && currentHour < 17) {
    return "afternoon";
  }

  if (currentHour >= 17 && currentHour < 21) {
    return "evening";
  }

  return "night";
};

export { getTimeDifference, getShiftByTime };
