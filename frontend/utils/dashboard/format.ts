export function centsToRupees(cents: number) {
  if (!Number.isSafeInteger(cents) || cents < 0) {
    throw new RangeError(
      'Amount in cents must be a non-negative safe integer.'
    );
  }
  return cents / 100;
}

export function rupeesToCents(rupees: string | number) {
  const value = String(rupees).trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(value)) {
    throw new TypeError('Enter a rupee amount with no more than two decimals.');
  }

  const [whole, fraction = ''] = value.split('.');
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  if (!Number.isSafeInteger(cents)) {
    throw new RangeError('Rupee amount is too large.');
  }
  return cents;
}

export function formatRupees(cents: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(centsToRupees(cents));
}
