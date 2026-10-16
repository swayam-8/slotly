export interface WorkingHourRange {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

function isValidTime(value: string) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
}

export function validateWorkingHours(ranges: WorkingHourRange[]) {
  for (const range of ranges) {
    if (
      !Number.isInteger(range.day_of_week) ||
      range.day_of_week < 0 ||
      range.day_of_week > 6
    ) {
      return { valid: false, error: 'Choose a valid day of the week.' };
    }
    if (!isValidTime(range.start_time) || !isValidTime(range.end_time)) {
      return { valid: false, error: 'Enter working hours in 24-hour time.' };
    }
    if (range.end_time <= range.start_time) {
      return {
        valid: false,
        error: 'Each end time must be after its start time.'
      };
    }
  }

  const byDay = new Map<number, WorkingHourRange[]>();
  for (const range of ranges) {
    const dayRanges = byDay.get(range.day_of_week) ?? [];
    dayRanges.push(range);
    byDay.set(range.day_of_week, dayRanges);
  }

  for (const dayRanges of Array.from(byDay.values())) {
    dayRanges.sort((left, right) =>
      left.start_time.localeCompare(right.start_time)
    );
    for (let index = 1; index < dayRanges.length; index += 1) {
      if (dayRanges[index].start_time < dayRanges[index - 1].end_time) {
        return { valid: false, error: 'Working-hour ranges cannot overlap.' };
      }
    }
  }

  return { valid: true, error: '' };
}
