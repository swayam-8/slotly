const localDateTimePattern =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/;

function getLocalParts(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second)
  };
}

function partsMatch(
  parts: ReturnType<typeof getLocalParts>,
  expected: number[]
) {
  return (
    parts.year === expected[0] &&
    parts.month === expected[1] &&
    parts.day === expected[2] &&
    parts.hour === expected[3] &&
    parts.minute === expected[4] &&
    parts.second === expected[5]
  );
}

function utcTimestamp(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0
) {
  const date = new Date(0);
  date.setUTCFullYear(year, month, day);
  date.setUTCHours(hour, minute, second, 0);
  return date.getTime();
}

export function businessLocalDateTimeToUtc(
  localDateTime: string,
  timezone: string
) {
  const match = localDateTimePattern.exec(localDateTime);
  if (!match) throw new TypeError('Enter a valid local date and time.');

  const expected = match.slice(1).map((part) => Number(part ?? 0));
  const [year, month, day, hour, minute, second] = expected;
  const wallTime = utcTimestamp(year, month - 1, day, hour, minute, second);
  const normalized = new Date(wallTime);

  if (
    normalized.getUTCFullYear() !== year ||
    normalized.getUTCMonth() !== month - 1 ||
    normalized.getUTCDate() !== day ||
    normalized.getUTCHours() !== hour ||
    normalized.getUTCMinutes() !== minute ||
    normalized.getUTCSeconds() !== second
  ) {
    throw new TypeError('Enter a valid local date and time.');
  }

  const offsets = new Set<number>();
  for (let offsetHours = -36; offsetHours <= 36; offsetHours += 3) {
    const instant = new Date(wallTime + offsetHours * 60 * 60 * 1000);
    const local = getLocalParts(instant, timezone);
    const localAsUtc = utcTimestamp(
      local.year,
      local.month - 1,
      local.day,
      local.hour,
      local.minute,
      local.second
    );
    offsets.add(localAsUtc - instant.getTime());
  }

  const candidates = Array.from(offsets)
    .map((offset) => new Date(wallTime - offset))
    .filter((instant) => partsMatch(getLocalParts(instant, timezone), expected))
    .sort((left, right) => left.getTime() - right.getTime());

  if (candidates.length === 0) {
    throw new RangeError(
      'This local time does not exist because the clocks move forward.'
    );
  }

  return candidates[0].toISOString();
}

export function utcToBusinessLocalDateTime(
  utcDateTime: string | Date,
  timezone: string
) {
  const instant =
    utcDateTime instanceof Date ? utcDateTime : new Date(utcDateTime);
  if (!Number.isFinite(instant.getTime())) {
    throw new TypeError('Enter a valid UTC date and time.');
  }

  const parts = getLocalParts(instant, timezone);
  return `${String(parts.year).padStart(4, '0')}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}T${String(parts.hour).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}`;
}
