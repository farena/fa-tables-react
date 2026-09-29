/**
 * Converts an arbitrary value into a `Date`.
 *
 * @param value - Value to convert. Can be a `Date`, a `number` (timestamp),
 * or a `string` parseable by `Date`; any other type is cast to `string` before parsing.
 * @returns The resulting `Date`. If the value is not a valid date, the returned `Date` will be invalid (`getTime()` returns `NaN`).
 */
const parseDate = (value: unknown): Date => {
  if (value instanceof Date) return value;
  if (typeof value === "number") return new Date(value);
  if (typeof value === "string") return new Date(value);
  return new Date(String(value));
};

/**
 * Formats a date value as `YYYY-MM-DD` (or optionally `YYYY-MM-DD HH:mm`).
 *
 * @param value - Value to format, accepted by {@link parseDate}.
 * @param includeTime - If `true`, appends hours and minutes in 24-hour format.
 * @returns The formatted date, or `"-"` if `value` does not represent a valid date.
 */
export const parseToString = (value: unknown, includeTime = false): string => {
  const date = parseDate(value);

  if (isNaN(date.getTime())) return "-";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  if (!includeTime) return `${year}-${month}-${day}`;

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

/**
 * Formats a date value using the `en-US` locale (e.g. "Jan 1, 2024"), via `Intl.DateTimeFormat`.
 *
 * @param value - Value to format, accepted by {@link parseDate}.
 * @param includeTime - If `true`, appends hours and minutes in 24-hour format.
 * @returns The locale-formatted date, or `"-"` if `value` does not represent a valid date.
 */
export const parseToLocale = (value: unknown, includeTime = false): string => {
  const date = parseDate(value);

  if (isNaN(date.getTime())) return "-";

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  if (includeTime) {
    options.hour = "2-digit";
    options.minute = "2-digit";
    options.hour12 = false;
  }

  return date.toLocaleDateString("en-US", options);
};
