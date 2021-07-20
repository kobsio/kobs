import { IPluginTimes } from '@kobsio/plugin-core';

// IOptions is the interface for the options on the Opsgenie page.
export interface IOptions {
  query: string;
  type: string;
  times: IPluginTimes;
}

// IPanelOptions is the interface for the options property for the Opsgenie panel component.
export interface IPanelOptions {
  type?: string;
  query?: string;
}

// IAlert implements the structure of an Opsgenie alert, how it is returned from the Opsgenie API.
export interface IAlert {
  seen?: boolean;
  id?: string;
  tinyId?: string;
  alias?: string;
  message?: string;
  status?: string;
  acknowledged?: boolean;
  isSeen?: boolean;
  tags?: string[];
  snoozed?: boolean;
  snoozedUntil?: string;
  count?: number;
  lastOccuredAt?: string;
  createdAt?: string;
  updatedAt?: string;
  source?: string;
  owner?: string;
  priority?: string;
  responders?: IResponder[];
  integration?: IIntegration;
  report?: IReport;
}

export interface IResponder {
  type?: string;
  name?: string;
  id?: string;
  username?: string;
}

export interface IIntegration {
  id?: string;
  name?: string;
  type?: string;
}

export interface IReport {
  ackTime?: number;
  closeTime?: number;
  acknowledgedBy?: string;
  closedBy?: string;
}

export interface IAlertDetails {
  description?: string;
  details?: IDetails;
}

export interface IDetails {
  [key: string]: string;
}

// ILog is the interface which implements the structure for the result of a logs request for alerts and incidents from
// the Opsgenie API.
export interface ILog {
  log?: string;
  type?: string;
  owner?: string;
  createdAt?: string;
  offset?: string;
}

// INote is the interface which implements the structure for the result of a notes request for alerts and incidents from
// the Opsgenie API.
export interface INote {
  note?: string;
  owner?: string;
  createdAt?: string;
  offset?: string;
}

// IIncident is the interface which implements the structure for an incident returned by the Opsgenie API.
export interface IIncident {
  id?: string;
  serviceId?: string;
  tinyId?: string;
  message?: string;
  status?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  priority?: string;
  ownerTeam?: string;
  responders?: IResponder[];
  extraProperties?: IExtraProperties;
}

export interface IExtraProperties {
  [key: string]: string;
}

// ITimelineEntry is the interface for a single entry in the incident timeline.
export interface ITimelineEntry {
  id?: string;
  group?: string;
  type?: string;
  eventTime?: string;
  hidden?: boolean;
  actor?: IActor;
  description?: IDescription;
  lastEdit?: ILastEdit;
}

export interface IActor {
  name?: string;
  type?: string;
}

export interface IDescription {
  name?: string;
  type?: string;
}

export interface ILastEdit {
  editTime?: string;
  actor?: IActor;
}
