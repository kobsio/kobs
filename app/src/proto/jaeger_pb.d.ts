// package: plugins.jaeger
// file: jaeger.proto

import * as jspb from "google-protobuf";

export class GetOperationsRequest extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  getService(): string;
  setService(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetOperationsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetOperationsRequest): GetOperationsRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetOperationsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetOperationsRequest;
  static deserializeBinaryFromReader(message: GetOperationsRequest, reader: jspb.BinaryReader): GetOperationsRequest;
}

export namespace GetOperationsRequest {
  export type AsObject = {
    name: string,
    service: string,
  }
}

export class GetOperationsResponse extends jspb.Message {
  clearServicesList(): void;
  getServicesList(): Array<string>;
  setServicesList(value: Array<string>): void;
  addServices(value: string, index?: number): string;

  clearOperationsList(): void;
  getOperationsList(): Array<Operation>;
  setOperationsList(value: Array<Operation>): void;
  addOperations(value?: Operation, index?: number): Operation;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetOperationsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetOperationsResponse): GetOperationsResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetOperationsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetOperationsResponse;
  static deserializeBinaryFromReader(message: GetOperationsResponse, reader: jspb.BinaryReader): GetOperationsResponse;
}

export namespace GetOperationsResponse {
  export type AsObject = {
    servicesList: Array<string>,
    operationsList: Array<Operation.AsObject>,
  }
}

export class GetTracesRequest extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  getLimit(): string;
  setLimit(value: string): void;

  getMaxduration(): string;
  setMaxduration(value: string): void;

  getMinduration(): string;
  setMinduration(value: string): void;

  getService(): string;
  setService(value: string): void;

  getOperation(): string;
  setOperation(value: string): void;

  getTags(): string;
  setTags(value: string): void;

  getTimestart(): number;
  setTimestart(value: number): void;

  getTimeend(): number;
  setTimeend(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetTracesRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetTracesRequest): GetTracesRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetTracesRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetTracesRequest;
  static deserializeBinaryFromReader(message: GetTracesRequest, reader: jspb.BinaryReader): GetTracesRequest;
}

export namespace GetTracesRequest {
  export type AsObject = {
    name: string,
    limit: string,
    maxduration: string,
    minduration: string,
    service: string,
    operation: string,
    tags: string,
    timestart: number,
    timeend: number,
  }
}

export class GetTracesResponse extends jspb.Message {
  getTraces(): string;
  setTraces(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetTracesResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetTracesResponse): GetTracesResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetTracesResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetTracesResponse;
  static deserializeBinaryFromReader(message: GetTracesResponse, reader: jspb.BinaryReader): GetTracesResponse;
}

export namespace GetTracesResponse {
  export type AsObject = {
    traces: string,
  }
}

export class GetTraceRequest extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  getTraceid(): string;
  setTraceid(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetTraceRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetTraceRequest): GetTraceRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetTraceRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetTraceRequest;
  static deserializeBinaryFromReader(message: GetTraceRequest, reader: jspb.BinaryReader): GetTraceRequest;
}

export namespace GetTraceRequest {
  export type AsObject = {
    name: string,
    traceid: string,
  }
}

export class GetTraceResponse extends jspb.Message {
  getTraces(): string;
  setTraces(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetTraceResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetTraceResponse): GetTraceResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetTraceResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetTraceResponse;
  static deserializeBinaryFromReader(message: GetTraceResponse, reader: jspb.BinaryReader): GetTraceResponse;
}

export namespace GetTraceResponse {
  export type AsObject = {
    traces: string,
  }
}

export class Operation extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  getSpankind(): string;
  setSpankind(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Operation.AsObject;
  static toObject(includeInstance: boolean, msg: Operation): Operation.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Operation, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Operation;
  static deserializeBinaryFromReader(message: Operation, reader: jspb.BinaryReader): Operation;
}

export namespace Operation {
  export type AsObject = {
    name: string,
    spankind: string,
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

  getService(): string;
  setService(value: string): void;

  getOperation(): string;
  setOperation(value: string): void;

  getTags(): string;
  setTags(value: string): void;

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
    service: string,
    operation: string,
    tags: string,
  }
}

