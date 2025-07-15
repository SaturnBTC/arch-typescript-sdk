export enum WebSocketErrorType {
  ConnectionFailed = 'ConnectionFailed',
  SendFailed = 'SendFailed',
  ParseError = 'ParseError',
  SubscriptionFailed = 'SubscriptionFailed',
  UnsubscriptionFailed = 'UnsubscriptionFailed',
  Other = 'Other',
}

export class WebSocketError extends Error {
  constructor(
    public type: WebSocketErrorType,
    message: string,
    public originalError?: Error,
  ) {
    super(message);
    this.name = 'WebSocketError';
  }
}
