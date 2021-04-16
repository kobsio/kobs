// package: plugins
// file: plugins.proto

import * as jspb from "google-protobuf";
import * as prometheus_pb from "./prometheus_pb";
import * as elasticsearch_pb from "./elasticsearch_pb";
import * as jaeger_pb from "./jaeger_pb";
import * as opsgenie_pb from "./opsgenie_pb";

export class GetPluginsRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetPluginsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetPluginsRequest): GetPluginsRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetPluginsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetPluginsRequest;
  static deserializeBinaryFromReader(message: GetPluginsRequest, reader: jspb.BinaryReader): GetPluginsRequest;
}

export namespace GetPluginsRequest {
  export type AsObject = {
  }
}

export class GetPluginsResponse extends jspb.Message {
  clearPluginsList(): void;
  getPluginsList(): Array<PluginShort>;
  setPluginsList(value: Array<PluginShort>): void;
  addPlugins(value?: PluginShort, index?: number): PluginShort;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetPluginsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetPluginsResponse): GetPluginsResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetPluginsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetPluginsResponse;
  static deserializeBinaryFromReader(message: GetPluginsResponse, reader: jspb.BinaryReader): GetPluginsResponse;
}

export namespace GetPluginsResponse {
  export type AsObject = {
    pluginsList: Array<PluginShort.AsObject>,
  }
}

export class PluginShort extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  getDescription(): string;
  setDescription(value: string): void;

  getType(): string;
  setType(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PluginShort.AsObject;
  static toObject(includeInstance: boolean, msg: PluginShort): PluginShort.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PluginShort, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PluginShort;
  static deserializeBinaryFromReader(message: PluginShort, reader: jspb.BinaryReader): PluginShort;
}

export namespace PluginShort {
  export type AsObject = {
    name: string,
    description: string,
    type: string,
  }
}

export class Plugin extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  getDisplayname(): string;
  setDisplayname(value: string): void;

  hasPrometheus(): boolean;
  clearPrometheus(): void;
  getPrometheus(): prometheus_pb.Spec | undefined;
  setPrometheus(value?: prometheus_pb.Spec): void;

  hasElasticsearch(): boolean;
  clearElasticsearch(): void;
  getElasticsearch(): elasticsearch_pb.Spec | undefined;
  setElasticsearch(value?: elasticsearch_pb.Spec): void;

  hasJaeger(): boolean;
  clearJaeger(): void;
  getJaeger(): jaeger_pb.Spec | undefined;
  setJaeger(value?: jaeger_pb.Spec): void;

  hasOpsgenie(): boolean;
  clearOpsgenie(): void;
  getOpsgenie(): opsgenie_pb.Spec | undefined;
  setOpsgenie(value?: opsgenie_pb.Spec): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Plugin.AsObject;
  static toObject(includeInstance: boolean, msg: Plugin): Plugin.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Plugin, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Plugin;
  static deserializeBinaryFromReader(message: Plugin, reader: jspb.BinaryReader): Plugin;
}

export namespace Plugin {
  export type AsObject = {
    name: string,
    displayname: string,
    prometheus?: prometheus_pb.Spec.AsObject,
    elasticsearch?: elasticsearch_pb.Spec.AsObject,
    jaeger?: jaeger_pb.Spec.AsObject,
    opsgenie?: opsgenie_pb.Spec.AsObject,
  }
}

