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

export const formatMsToHHmmss = (ms) => {
  if (ms < 0) return "00:00:00";
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Calculates live work time for an active session.
 * @param {Object} activeSession 
 * @returns {number} Net work time in ms
 */
export const calculateLiveWorkTime = (activeSession) => {
  if (!activeSession) return 0;

  const now = new Date();
  const startTime = new Date(activeSession.startTime);
  const attendanceMs = differenceInMilliseconds(now, startTime);

  let actualBreaksMs = activeSession.breaks.reduce((total, b) => {
    const start = new Date(b.start);
    const end = b.end ? new Date(b.end) : now;
    return total + differenceInMilliseconds(end, start);
  }, 0);

  const netWorkBeforeAutoDeduction = attendanceMs - actualBreaksMs;

  let totalBreaksMs = actualBreaksMs;
  if (netWorkBeforeAutoDeduction > BREAK_THRESHOLD) {
    if (actualBreaksMs < MIN_BREAK_DEDUCTION) {
      totalBreaksMs = MIN_BREAK_DEDUCTION;
    }
  }

  return Math.max(0, attendanceMs - totalBreaksMs);
};

export const formatTime = (date) => {
  if (!date) return "--:--";
  return format(new Date(date), 'HH:mm');
};
