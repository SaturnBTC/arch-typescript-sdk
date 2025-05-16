import { Schema } from 'borsh';

export interface MessageHeader {
  num_required_signatures: number;
  num_readonly_signed_accounts: number;
  num_readonly_unsigned_accounts: number;
}

export const MessageHeaderSchema: Schema = {
  struct: {
    num_required_signatures: 'u8',
    num_readonly_signed_accounts: 'u8',
    num_readonly_unsigned_accounts: 'u8',
  },
};
