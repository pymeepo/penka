// Pure-function checks for the phone mask (no browser needed).
import { expect, test } from '@playwright/test';
import { formatPhone, isCompletePhone, maskedDigits } from '../src/lib/phone';

const cases: Array<[string, string]> = [
  ['+7 (900) 123-45-67', '9001234567'],
  ['+7 (900) 123-45-6', '900123456'],
  ['+7 (', ''],
  ['+97 (', '9'], // digit typed between «+» and «7»
  ['9+7 (', '9'], // digit typed before «+»
  ['9+7 (00', '900'],
  ['+7 9(', '9'], // digit typed before «(»
  ['+7 (970) 012', '970012'], // a real 7 in the number is kept
  ['89001234567', '9001234567'],
  ['+7 900 123 45 67', '9001234567'],
  ['900-123-45-67', '9001234567'],
];

for (const [input, expected] of cases) {
  test(`maskedDigits(${JSON.stringify(input)}) → ${expected || '∅'}`, () => {
    expect(maskedDigits(input)).toBe(expected);
  });
}

test('formatPhone adds separators only before the next digit', () => {
  expect(formatPhone('900')).toBe('+7 (900');
  expect(formatPhone('9001')).toBe('+7 (900) 1');
  expect(formatPhone('9001234567')).toBe('+7 (900) 123-45-67');
});

test('isCompletePhone needs exactly 10 national digits', () => {
  expect(isCompletePhone('+7 (900) 123-45-67')).toBe(true);
  expect(isCompletePhone('+7 (900) 123-45-6')).toBe(false);
});
