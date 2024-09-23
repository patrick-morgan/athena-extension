export const parseDate = (dateString: string): Date => {
  // Assuming the input is in the format "MMMM D, YYYY h:mma"
  const [datePart, timePart] = dateString.split(", ");
  const [month, day] = datePart.split(" ");
  const [year, time] = timePart.split(" ");
  const [hour, minute] = time.slice(0, -2).split(":");
  const isPM = time.slice(-2).toLowerCase() === "pm";

  const date = new Date(
    parseInt(year),
    getMonthIndex(month),
    parseInt(day),
    (isPM ? parseInt(hour) + 12 : parseInt(hour)) % 24,
    parseInt(minute)
  );

  return date;
};

// Helper function to get month index from name
const getMonthIndex = (monthName: string): number => {
  const months = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];
  return months.indexOf(monthName.toLowerCase());
};

export const formatDate = (date: Date | string): string => {
  // If date is a string, convert it to a Date object
  const dateObject = typeof date === "string" ? new Date(date) : date;

  // Check if the date is valid
  if (isNaN(dateObject.getTime())) {
    throw new Error("Invalid date");
  }

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    timeZoneName: "short",
    hour12: true, // This ensures 12-hour format with AM/PM
  };

  return new Intl.DateTimeFormat(undefined, options).format(dateObject);
};
