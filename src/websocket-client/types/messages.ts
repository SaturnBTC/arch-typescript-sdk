import { EventTopic } from './events';
import { EventFilter } from './filters';

export interface SubscribeRequest {
  topic: EventTopic;
  filter: EventFilter;
  request_id?: string;
}

export interface WebSocketSubscribeRequest {
  method: 'subscribe';
  params: SubscribeRequest;
}

export interface UnsubscribeRequest {
  topic: EventTopic;
  subscription_id: string;
}

export interface WebSocketUnsubscribeRequest {
  method: 'unsubscribe';
  params: UnsubscribeRequest;
}

export enum SubscriptionStatus {
  Subscribed = 'Subscribed',
  Unsubscribed = 'Unsubscribed',
  Error = 'Error',
}

export interface SubscriptionResponse {
  status: SubscriptionStatus;
  subscription_id: string;
  topic: EventTopic;
  request_id?: string;
}

export interface UnsubscribeResponse {
  status: SubscriptionStatus;
  subscription_id: string;
  message: string;
}

export interface SubscriptionErrorResponse {
  status: SubscriptionStatus;
  error: string;
}

export type WebSocketMessage =
  | { topic: EventTopic; data: any }
  | SubscriptionResponse
  | UnsubscribeResponse
  | SubscriptionErrorResponse;
