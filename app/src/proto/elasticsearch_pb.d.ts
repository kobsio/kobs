// package: plugins.elasticsearch
// file: elasticsearch.proto

import * as jspb from "google-protobuf";

export class GetLogsRequest extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  getScrollid(): string;
  setScrollid(value: string): void;

  getTimestart(): number;
  setTimestart(value: number): void;

  getTimeend(): number;
  setTimeend(value: number): void;

  hasQuery(): boolean;
  clearQuery(): void;
  getQuery(): Query | undefined;
  setQuery(value?: Query): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetLogsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetLogsRequest): GetLogsRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetLogsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetLogsRequest;
  static deserializeBinaryFromReader(message: GetLogsRequest, reader: jspb.BinaryReader): GetLogsRequest;
}

export namespace GetLogsRequest {
  export type AsObject = {
    name: string,
    scrollid: string,
    timestart: number,
    timeend: number,
    query?: Query.AsObject,
  }
}

export class GetLogsResponse extends jspb.Message {
  getScrollid(): string;
  setScrollid(value: string): void;

  getHits(): number;
  setHits(value: number): void;

  getTook(): number;
  setTook(value: number): void;

  getLogs(): string;
  setLogs(value: string): void;

  clearBucketsList(): void;
  getBucketsList(): Array<Bucket>;
  setBucketsList(value: Array<Bucket>): void;
  addBuckets(value?: Bucket, index?: number): Bucket;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetLogsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetLogsResponse): GetLogsResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetLogsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetLogsResponse;
  static deserializeBinaryFromReader(message: GetLogsResponse, reader: jspb.BinaryReader): GetLogsResponse;
}

export namespace GetLogsResponse {
  export type AsObject = {
    scrollid: string,
    hits: number,
    took: number,
    logs: string,
    bucketsList: Array<Bucket.AsObject>,
  }
}

export class Bucket extends jspb.Message {
  getX(): number;
  setX(value: number): void;

  getY(): number;
  setY(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Bucket.AsObject;
  static toObject(includeInstance: boolean, msg: Bucket): Bucket.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Bucket, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Bucket;
  static deserializeBinaryFromReader(message: Bucket, reader: jspb.BinaryReader): Bucket;
}

export namespace Bucket {
  export type AsObject = {
    x: number,
    y: number,
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

  clearFieldsList(): void;
  getFieldsList(): Array<string>;
  setFieldsList(value: Array<string>): void;
  addFields(value: string, index?: number): string;

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
    fieldsList: Array<string>,
  }
}

