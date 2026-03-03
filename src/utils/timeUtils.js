import { format, differenceInMilliseconds } from 'date-fns';

export const BREAK_THRESHOLD = 6 * 60 * 60 * 1000; // 6 hours
export const MIN_BREAK_DEDUCTION = 30 * 60 * 1000; // 30 minutes

/**
 * Calculates net work time considering breaks and automatic deduction.
 * @param {Date} startTime 
 * @param {Date} endTime 
 * @param {Array<{start: Date, end: Date}>} breaks 
 * @returns {Object} { attendance, breaks, workTime, autoDeducted }
 */
export const calculateWorkSession = (startTime, endTime, breaks = []) => {
  if (!startTime || !endTime) return null;

  const totalAttendanceMs = differenceInMilliseconds(endTime, startTime);
  
  let actualBreaksMs = breaks.reduce((total, b) => {
    if (b.start && b.end) {
      return total + differenceInMilliseconds(b.end, b.start);
    }
    return total;
  }, 0);

  // Requirement: Auto deduction of 30 min if > 6h work time
  // Logic: If (Attendance - ActualBreaks) > 6h, total break must be at least 30m.
  let totalBreaksMs = actualBreaksMs;
  let autoDeductedMs = 0;

  const netWorkBeforeAutoDeduction = totalAttendanceMs - actualBreaksMs;

  if (netWorkBeforeAutoDeduction > BREAK_THRESHOLD) {
    if (actualBreaksMs < MIN_BREAK_DEDUCTION) {
      totalBreaksMs = MIN_BREAK_DEDUCTION;
      autoDeductedMs = MIN_BREAK_DEDUCTION - actualBreaksMs;
    }
  }

  const netWorkTimeMs = totalAttendanceMs - totalBreaksMs;

  return {
    attendance: totalAttendanceMs,
    actualBreaks: actualBreaksMs,
    totalBreaks: totalBreaksMs,
    autoDeducted: autoDeductedMs,
    workTime: netWorkTimeMs
  };
};

export const formatMsToHHmm = (ms) => {
  if (ms < 0) return "00:00";
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

export const formatTime = (date) => {
  if (!date) return "--:--";
  return format(new Date(date), 'HH:mm');
};
