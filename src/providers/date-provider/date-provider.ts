/**
 * Providing utility functions for `Date`, such as Date creation and manipulation.
 */
export interface DateProvider {
  /**
   * Create a date in UTC time.
   *
   * If the parameter `date` is given, it will return the UTC time according to `date`.
   *
   * Otherwise, it will return the current UTC time.
   * @param date The date object to transit to UTC time.
   */
  getUtc(date?: Date): Date;

  /**
   * Transit a UNIX integer time to a Date.
   * @param time The UNIX integer time.
   */
  getUnix(time: number): Date;

  /**
   * Add the number of days from the current UTC time.
   * @param days The number of days to add.
   */
  addUtcDaysFromNow(days: number): Date;

  /**
   * Format `date` into a string that is valid to database.
   * @param date The date object to format.
   */
  formatToDatabase(date: Date): string;
}
