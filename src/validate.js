import isSameDay from "date-fns/isSameDay";
import differenceInCalendarWeeks from "date-fns/differenceInCalendarWeeks";

function ValidateDay(dateJSON) {
  const prevDate = new Date(dateJSON);
  const result = isSameDay(prevDate, new Date());
  return result;
}

function ValidateWeek(dateJSON) {
  const prevDate = new Date(dateJSON);
  const result = differenceInCalendarWeeks(new Date(), prevDate, {
    weekStartsOn: prevDate.getDay(),
  });
  return result;
}
export { ValidateDay, ValidateWeek };
