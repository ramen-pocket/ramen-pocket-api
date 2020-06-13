import moment from 'moment';
import { DateProvider } from './date-provider';

const DATETIME_FORMATE = 'YYYY-MM-DD HH:mm:ss';

export class MomentProvider implements DateProvider {
  getUtc(date?: Date): Date {
    if (date) {
      return moment.utc(date).toDate();
    } else {
      return moment.utc().toDate();
    }
  }

  getUnix(time: number): Date {
    return moment.unix(time).toDate();
  }

  addUtcDaysFromNow(days: number): Date {
    if (!Number.isInteger(days)) {
      throw new Error('The parameter days must be an integer');
    }

    return moment
      .utc()
      .add(days, 'days')
      .toDate();
  }

  formatToDatabase(date: Date): string {
    return moment.utc(date).format(DATETIME_FORMATE);
  }
}
