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

const calculateHours = (start?: string, end?: string) => {
  if (!start?.trim() || !end?.trim()) {
    return 0;
  }

  const startDate = new Date(`2000-01-01T${start}`);
  const endDate = new Date(`2000-01-01T${end}`);

  const diff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);

  return diff > 0 ? diff : 0;
};

const formatDate = (date?: string | Date) => {
  if (!date) {
    return "--";
  }

  const parsedDate = new Date(date);

  const day = String(parsedDate.getDate()).padStart(2, "0");
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const year = parsedDate.getFullYear();

  return `${day}-${month}-${year}`;
};

const formatTime12Hour = (time?: string) => {
  if (!time) {
    return "--";
  }

  return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export {
  getTimeDifference,
  getShiftByTime,
  calculateHours,
  formatDate,
  formatTime12Hour,
};
