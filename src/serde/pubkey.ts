import { secp256k1 } from '@noble/curves/secp256k1';
import { ASSOCIATED_TOKEN_PROGRAM_ID } from '../constants';
import { TOKEN_PROGRAM_ID } from '../constants';
import { Pubkey } from '../struct/pubkey';
import { sha256 } from '@noble/hashes/sha256';

export const systemProgram = () => {
  const tmp = new Uint8Array(32);
  tmp[31] = 1;
  return tmp as Pubkey;
};

export const fromHex = (hex: string) => {
  const data = Buffer.from(hex, 'hex');
  const tmp = new Uint8Array(32);
  tmp.set(data.subarray(0, 32));
  return tmp as Pubkey;
};

export const toHex = (pubkey: Pubkey): string => {
  return Buffer.from(pubkey).toString('hex');
};

export const isSystemProgram = (pubkey: Pubkey) => {
  return pubkey === systemProgram();
};

export const MAX_SEED_LENGTH = 32;
export const MAX_SEEDS = 16;

/**
 * Get the address of the associated token account for a given mint and owner
 *
 * @param mint                     Token mint account
 * @param owner                    Owner of the new account
 * @param allowOwnerOffCurve       Allow the owner account to be a PDA (Program Derived Address)
 * @param programId                SPL Token program account
 * @param associatedTokenProgramId SPL Associated Token program account
 *
 * @return Address of the associated token account and bump seed
 */
export function getAssociatedTokenAddress(
  mint: Pubkey,
  owner: Pubkey,
  allowOwnerOffCurve = false,
  programId = TOKEN_PROGRAM_ID,
  associatedTokenProgramId = ASSOCIATED_TOKEN_PROGRAM_ID,
): Pubkey {
  if (!allowOwnerOffCurve && !isOnCurve(owner)) {
    throw new Error('Owner is not on curve');
  }

  const [address] = findProgramAddress(
    [owner, programId, mint],
    associatedTokenProgramId,
  );
  return address;
}

/**
 * Finds a valid program address and its corresponding bump seed
 *
 * @param seeds                    Array of seeds to derive the program address
 * @param programId                The program address to derive from
 *
 * @return A tuple of [program address, bump seed]
 * @throws Error if no valid program address is found or if max seeds are exceeded
 */
export function findProgramAddress(
  seeds: Array<Buffer | Uint8Array>,
  programId: Pubkey,
): [Pubkey, number] {
  if (seeds.length > MAX_SEEDS) {
    throw new Error(`Max seeds exceeded: ${seeds.length} > ${MAX_SEEDS}`);
  }

  let nonce = 255;
  let address;
  while (nonce !== 0) {
    try {
      const seedsWithNonce = seeds.concat(Buffer.from([nonce]));
      address = createProgramAddress(seedsWithNonce, programId);
      return [address, nonce];
    } catch (err) {
      if (err instanceof TypeError) {
        throw err;
      }
      if (
        err instanceof Error &&
        err.message === 'Invalid seeds, address must fall off the curve'
      ) {
        nonce--;
        continue;
      }
      throw err;
    }
  }
  throw new Error('Unable to find a viable program address nonce');
}

/**
 * Creates a program address from a set of seeds
 *
 * @param seeds                    Array of seeds to derive the program address
 * @param programId                The program address to derive from
 *
 * @return The derived program address
 * @throws Error if seeds exceed max length or if resulting address is on the curve
 */
function createProgramAddress(
  seeds: Array<Buffer | Uint8Array>,
  programId: Pubkey,
): Pubkey {
  // Validate seeds length
  if (seeds.length > MAX_SEEDS) {
    throw new Error(`Max seeds exceeded: ${seeds.length} > ${MAX_SEEDS}`);
  }

  // Concatenate everything into a single buffer
  let buffer = Buffer.alloc(0);
  for (const seed of seeds) {
    if (seed.length > MAX_SEED_LENGTH) {
      throw new Error(
        `Max seed length exceeded: ${seed.length} > ${MAX_SEED_LENGTH}`,
      );
    }
    buffer = Buffer.concat([buffer, Buffer.from(seed)]);
  }

  // Add program id to the buffer
  buffer = Buffer.concat([buffer, Buffer.from(programId)]);

  // Calculate SHA256 hash
  const hash = sha256(buffer);

  // Check if resulting pubkey is on the curve
  if (isOnCurve(hash)) {
    throw new Error('Invalid seeds, address must fall off the curve');
  }

  return hash;
}

/**
 * Checks if a public key lies on the secp256k1 curve
 *
 * @param pubkey                   The public key to check
 *
 * @return True if the public key is on the curve, false otherwise
 */
function isOnCurve(pubkey: Pubkey): boolean {
  try {
    // Attempt to parse the pubkey as a secp256k1 public key
    secp256k1.ProjectivePoint.fromHex(pubkey);
    return true;
  } catch (e) {
    return false;
  }
}
