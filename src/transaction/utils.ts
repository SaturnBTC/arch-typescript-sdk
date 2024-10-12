import { Script, ScriptData, Address, Tap, Networks } from '@cmdcode/tapscript';
import { Pubkey } from '../struct/pubkey';
import { fromHex } from '../serde/pubkey';

export function getAccountKeyInOutput(outputScript: Uint8Array): Pubkey {
  const script = Script.decode(outputScript);

  // Find the OP_IF instruction. 99 is the hex value for OP_IF.
  const ifIndex = script.findIndex((instr) => instr === '99');

  if (ifIndex === -1) {
    throw new Error('OP_IF not found in script');
  }

  // The account pubkey should be the next instruction after OP_IF
  const pubkeyInstruction = script[ifIndex + 1];

  if (pubkeyInstruction == undefined) {
    throw new Error('Invalid account key in output');
  }

  return fromHex(pubkeyInstruction);
}

function getFrostUtxoScript(
  serializedXOnlyGroupPubk: Uint8Array,
  accountPubkey: Uint8Array,
): Uint8Array {
  if (serializedXOnlyGroupPubk.length !== 32 || accountPubkey.length !== 32) {
    throw new Error('Invalid public key length');
  }

  const script: ScriptData = [
    serializedXOnlyGroupPubk,
    'OP_CHECKSIG',
    'OP_IF',
    accountPubkey,
    'OP_CHECKSIG',
    'OP_ENDIF',
  ];

  return Script.encode(script);
}

export function buildAccountAddress(
  frostPubkey: Uint8Array,
  accountPubkey: Uint8Array,
  network: Networks,
): string {
  // Create the script
  const script = getFrostUtxoScript(frostPubkey, accountPubkey);

  // Encode the script into a tapleaf
  const tapleaf = Tap.tree.getLeaf(script);

  // Build the tree with the script (weight 1 for Huffman tree)
  // Since the tapscript library doesn't have a Huffman tree builder,
  // we'll simulate it by creating a tree with our single tapleaf.
  const tree = [tapleaf];

  // Finalize the tree to get the root hash
  const rootHash = Tap.tree.getRoot(tree);

  // Compute the taptweak (hash of internal key and root hash)
  const taptweak = Tap.tweak.getTweak(frostPubkey, rootHash);

  // Compute the tweaked public key
  const tweakedPubkey = Tap.tweak.tweakPubKey(frostPubkey, taptweak);

  // Create the address
  const address = Address.p2tr.encode(tweakedPubkey, network);

  return address;
}
