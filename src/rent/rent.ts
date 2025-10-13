/// Rent Calculation
// pub const DEFAULT_LAMPORTS_PER_BYTE_YEAR: u64 = 1_000_000_000 / 100 * 365 / (1024 * 1024);
// TODO: Temp value as the rent is becoming greater than MIN_LAMPORTS_REQUIRED,
// fix that to a good value then comback to this
export const DEFAULT_LAMPORTS_PER_BYTE_YEAR: bigint = 2n;

/// Default amount of time (in years) the balance has to include rent for the
/// account to be rent exempt.
export const DEFAULT_EXEMPTION_THRESHOLD = 2.0;

/// Account storage overhead for calculation of base rent.
///
/// This is the number of bytes required to store an account with no data. It is
/// added to an accounts data length when calculating [`Rent::minimum_balance`].
export const ACCOUNT_STORAGE_OVERHEAD = 128n;

/**
 * Computes the minimum rent required for an account given its data length.
 */
export function minimumRent(dataLength: number): bigint {
  const bytes = BigInt(dataLength);
  return (ACCOUNT_STORAGE_OVERHEAD + bytes) * DEFAULT_LAMPORTS_PER_BYTE_YEAR;
}

/** Checks if the account is exempt from rent. */
export function isExempt(lamports: bigint, dataLength: number): boolean {
  const rent = minimumRent(dataLength);
  return lamports >= rent;
}
