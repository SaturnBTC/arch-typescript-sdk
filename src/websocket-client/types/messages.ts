import { EventTopic } from './events';
import { EventFilter } from './filters';

export interface SubscribeRequest {
  topic: EventTopic;
  filter: EventFilter;
  request_id?: string;
}

export interface UnsubscribeRequest {
  topic: EventTopic;
  subscriptionId: string;
}

export enum SubscriptionStatus {
  Subscribed = 'Subscribed',
  Unsubscribed = 'Unsubscribed',
  Error = 'Error',
}

export interface SubscriptionResponse {
  status: SubscriptionStatus;
  subscriptionId: string;
  topic: EventTopic;
  request_id?: string;
}

export interface UnsubscribeResponse {
  status: SubscriptionStatus;
  subscriptionId: string;
  message: string;
}
