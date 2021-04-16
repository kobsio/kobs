// package: plugins.opsgenie
// file: opsgenie.proto

import * as jspb from "google-protobuf";

export class GetAlertsRequest extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  getQuery(): string;
  setQuery(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetAlertsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetAlertsRequest): GetAlertsRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetAlertsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetAlertsRequest;
  static deserializeBinaryFromReader(message: GetAlertsRequest, reader: jspb.BinaryReader): GetAlertsRequest;
}

export namespace GetAlertsRequest {
  export type AsObject = {
    name: string,
    query: string,
  }
}

export class GetAlertsResponse extends jspb.Message {
  clearAlertsList(): void;
  getAlertsList(): Array<Alert>;
  setAlertsList(value: Array<Alert>): void;
  addAlerts(value?: Alert, index?: number): Alert;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetAlertsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetAlertsResponse): GetAlertsResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetAlertsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetAlertsResponse;
  static deserializeBinaryFromReader(message: GetAlertsResponse, reader: jspb.BinaryReader): GetAlertsResponse;
}

export namespace GetAlertsResponse {
  export type AsObject = {
    alertsList: Array<Alert.AsObject>,
  }
}

export class GetAlertRequest extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  getId(): string;
  setId(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetAlertRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetAlertRequest): GetAlertRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetAlertRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetAlertRequest;
  static deserializeBinaryFromReader(message: GetAlertRequest, reader: jspb.BinaryReader): GetAlertRequest;
}

export namespace GetAlertRequest {
  export type AsObject = {
    name: string,
    id: string,
  }
}

export class GetAlertResponse extends jspb.Message {
  hasAlert(): boolean;
  clearAlert(): void;
  getAlert(): Alert | undefined;
  setAlert(value?: Alert): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetAlertResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetAlertResponse): GetAlertResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetAlertResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetAlertResponse;
  static deserializeBinaryFromReader(message: GetAlertResponse, reader: jspb.BinaryReader): GetAlertResponse;
}

export namespace GetAlertResponse {
  export type AsObject = {
    alert?: Alert.AsObject,
  }
}

export class Alert extends jspb.Message {
  getId(): string;
  setId(value: string): void;

  getTinyid(): string;
  setTinyid(value: string): void;

  getAlias(): string;
  setAlias(value: string): void;

  getMessage(): string;
  setMessage(value: string): void;

  getStatus(): string;
  setStatus(value: string): void;

  getAcknowledged(): boolean;
  setAcknowledged(value: boolean): void;

  getIsseen(): boolean;
  setIsseen(value: boolean): void;

  clearTagsList(): void;
  getTagsList(): Array<string>;
  setTagsList(value: Array<string>): void;
  addTags(value: string, index?: number): string;

  getSnoozed(): boolean;
  setSnoozed(value: boolean): void;

  getSnoozeduntil(): number;
  setSnoozeduntil(value: number): void;

  getCount(): number;
  setCount(value: number): void;

  getLastoccuredat(): number;
  setLastoccuredat(value: number): void;

  getCreatedat(): number;
  setCreatedat(value: number): void;

  getUpdatedat(): number;
  setUpdatedat(value: number): void;

  getSource(): string;
  setSource(value: string): void;

  getOwner(): string;
  setOwner(value: string): void;

  getPriority(): string;
  setPriority(value: string): void;

  clearRespondersList(): void;
  getRespondersList(): Array<string>;
  setRespondersList(value: Array<string>): void;
  addResponders(value: string, index?: number): string;

  getDescription(): string;
  setDescription(value: string): void;

  getDetailsMap(): jspb.Map<string, string>;
  clearDetailsMap(): void;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Alert.AsObject;
  static toObject(includeInstance: boolean, msg: Alert): Alert.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Alert, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Alert;
  static deserializeBinaryFromReader(message: Alert, reader: jspb.BinaryReader): Alert;
}

export namespace Alert {
  export type AsObject = {
    id: string,
    tinyid: string,
    alias: string,
    message: string,
    status: string,
    acknowledged: boolean,
    isseen: boolean,
    tagsList: Array<string>,
    snoozed: boolean,
    snoozeduntil: number,
    count: number,
    lastoccuredat: number,
    createdat: number,
    updatedat: number,
    source: string,
    owner: string,
    priority: string,
    respondersList: Array<string>,
    description: string,
    detailsMap: Array<[string, string]>,
  }
}

export class Spec extends jspb.Message {
  clearQueriesList(): void;
  getQueriesList(): Array<Query>;
  setQueriesList(value: Array<Query>): void;
  addQueries(value?: Query, index?: number): Query;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Spec.AsObject;
  static toObject(includeInstance: boolean, msg: Spec): Spec.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Spec, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Spec;
  static deserializeBinaryFromReader(message: Spec, reader: jspb.BinaryReader): Spec;
}

export namespace Spec {
  export type AsObject = {
    queriesList: Array<Query.AsObject>,
  }
}

export class Query extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  getQuery(): string;
  setQuery(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Query.AsObject;
  static toObject(includeInstance: boolean, msg: Query): Query.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Query, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Query;
  static deserializeBinaryFromReader(message: Query, reader: jspb.BinaryReader): Query;
}

export namespace Query {
  export type AsObject = {
    name: string,
    query: string,
  }
}

