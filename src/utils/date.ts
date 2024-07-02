import moment from "moment-timezone";

export const parseDate = (dateString: string) => {
  // TODO: HANDLE TIMEZONES ACCORDINGLY
  // Parse the date string with moment-timezone
  const date = moment.tz(dateString, "MMMM D, YYYY h:mma", "America/New_York");
  return date.toDate();
};

export const formatDate = (date: Date, timeZone: string) => {
  return moment(date).tz(timeZone).format("MMMM D, YYYY h:mm A z");
};
