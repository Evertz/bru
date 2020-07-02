export const EventType = {
  STATE_EVENT: 'state',
  TARGETS_EVENT: 'targets',
  INVOCATION_DETAILS_EVENT: 'details',
  PROGRESS_EVENT: 'progress',
  HOST_DETAILS_EVENT: 'host',
  WORKSPACE_STATUS_EVENT: 'workspacestatus',
  COMMAND_LINE: 'commandline',
  FETCHED_EVENT: 'fetched',
};

export interface BesEventData<T> {
  /**
   * Payload data for this event
   */
  payload?: T | undefined,

  /**
   * The invocationId associated with this event
   */
  invocationId: string;
}

export interface BesEvent<T> {
  /**
   * The event type
   */
  event: string;

  /**
   * Event data for this event type
   */
  data: BesEventData<T>;
}

export function BesEventFactory<T>(event: string, invocationId: string, payload: T): BesEvent<T> {
  return {
    event,
    data: {
      invocationId,
      payload
    }
  }
}
