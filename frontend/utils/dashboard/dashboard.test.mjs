import assert from 'node:assert/strict';
import test from 'node:test';
import { centsToRupees, rupeesToCents } from './format.ts';
import {
  businessLocalDateTimeToUtc,
  utcToBusinessLocalDateTime
} from './timezone.ts';
import { validateWorkingHours } from './working-hours.ts';

test('price conversion stores and displays rupees as integer paise', () => {
  assert.equal(rupeesToCents('125.50'), 12550);
  assert.equal(rupeesToCents(0), 0);
  assert.equal(centsToRupees(12550), 125.5);
  assert.throws(() => rupeesToCents('1.999'), TypeError);
  assert.throws(() => centsToRupees(-1), RangeError);
});

test('timezone conversion round-trips a normal business-local time', () => {
  const utc = businessLocalDateTimeToUtc('2024-07-01T09:00', 'Asia/Kolkata');
  assert.equal(utc, '2024-07-01T03:30:00.000Z');
  assert.equal(
    utcToBusinessLocalDateTime(utc, 'Asia/Kolkata'),
    '2024-07-01T09:00'
  );
});

test('timezone conversion rejects nonexistent spring-forward local times', () => {
  assert.throws(
    () => businessLocalDateTimeToUtc('2024-03-10T02:30', 'America/New_York'),
    /does not exist/
  );
});

test('timezone conversion resolves fall-back ambiguity to the earlier instant', () => {
  assert.equal(
    businessLocalDateTimeToUtc('2024-11-03T01:30', 'America/New_York'),
    '2024-11-03T05:30:00.000Z'
  );
});

test('weekly hours accept separate ranges for a lunch break', () => {
  assert.equal(
    validateWorkingHours([
      { day_of_week: 1, start_time: '09:00', end_time: '13:00' },
      { day_of_week: 1, start_time: '14:00', end_time: '18:00' }
    ]).valid,
    true
  );
});

test('weekly hours reject overlaps, invalid clock times, and reversed ranges', () => {
  assert.equal(
    validateWorkingHours([
      { day_of_week: 1, start_time: '09:00', end_time: '13:00' },
      { day_of_week: 1, start_time: '12:30', end_time: '17:00' }
    ]).valid,
    false
  );
  assert.equal(
    validateWorkingHours([
      { day_of_week: 1, start_time: '14:00', end_time: '13:00' }
    ]).valid,
    false
  );
  assert.equal(
    validateWorkingHours([
      { day_of_week: 1, start_time: '25:00', end_time: '26:00' }
    ]).valid,
    false
  );
});
