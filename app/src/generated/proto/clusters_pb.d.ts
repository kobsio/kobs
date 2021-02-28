// package: clusters
// file: clusters.proto

import * as jspb from "google-protobuf";
import * as application_pb from "./application_pb";

export class GetClustersRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetClustersRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetClustersRequest): GetClustersRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetClustersRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetClustersRequest;
  static deserializeBinaryFromReader(message: GetClustersRequest, reader: jspb.BinaryReader): GetClustersRequest;
}

export namespace GetClustersRequest {
  export type AsObject = {
  }
}

export class GetClustersResponse extends jspb.Message {
  clearClustersList(): void;
  getClustersList(): Array<string>;
  setClustersList(value: Array<string>): void;
  addClusters(value: string, index?: number): string;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetClustersResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetClustersResponse): GetClustersResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetClustersResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetClustersResponse;
  static deserializeBinaryFromReader(message: GetClustersResponse, reader: jspb.BinaryReader): GetClustersResponse;
}

export namespace GetClustersResponse {
  export type AsObject = {
    clustersList: Array<string>,
  }
}

export class GetNamespacesRequest extends jspb.Message {
  clearClustersList(): void;
  getClustersList(): Array<string>;
  setClustersList(value: Array<string>): void;
  addClusters(value: string, index?: number): string;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetNamespacesRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetNamespacesRequest): GetNamespacesRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetNamespacesRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetNamespacesRequest;
  static deserializeBinaryFromReader(message: GetNamespacesRequest, reader: jspb.BinaryReader): GetNamespacesRequest;
}

export namespace GetNamespacesRequest {
  export type AsObject = {
    clustersList: Array<string>,
  }
}

export class GetNamespacesResponse extends jspb.Message {
  clearNamespacesList(): void;
  getNamespacesList(): Array<string>;
  setNamespacesList(value: Array<string>): void;
  addNamespaces(value: string, index?: number): string;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetNamespacesResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetNamespacesResponse): GetNamespacesResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetNamespacesResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetNamespacesResponse;
  static deserializeBinaryFromReader(message: GetNamespacesResponse, reader: jspb.BinaryReader): GetNamespacesResponse;
}

export namespace GetNamespacesResponse {
  export type AsObject = {
    namespacesList: Array<string>,
  }
}

export class GetResourcesRequest extends jspb.Message {
  clearClustersList(): void;
  getClustersList(): Array<string>;
  setClustersList(value: Array<string>): void;
  addClusters(value: string, index?: number): string;

  clearNamespacesList(): void;
  getNamespacesList(): Array<string>;
  setNamespacesList(value: Array<string>): void;
  addNamespaces(value: string, index?: number): string;

  getPath(): string;
  setPath(value: string): void;

  getResource(): string;
  setResource(value: string): void;

  getParamname(): string;
  setParamname(value: string): void;

  getParam(): string;
  setParam(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetResourcesRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetResourcesRequest): GetResourcesRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetResourcesRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetResourcesRequest;
  static deserializeBinaryFromReader(message: GetResourcesRequest, reader: jspb.BinaryReader): GetResourcesRequest;
}

export namespace GetResourcesRequest {
  export type AsObject = {
    clustersList: Array<string>,
    namespacesList: Array<string>,
    path: string,
    resource: string,
    paramname: string,
    param: string,
  }
}

export class GetResourcesResponse extends jspb.Message {
  clearResourcesList(): void;
  getResourcesList(): Array<Resources>;
  setResourcesList(value: Array<Resources>): void;
  addResources(value?: Resources, index?: number): Resources;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetResourcesResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetResourcesResponse): GetResourcesResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetResourcesResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetResourcesResponse;
  static deserializeBinaryFromReader(message: GetResourcesResponse, reader: jspb.BinaryReader): GetResourcesResponse;
}

export namespace GetResourcesResponse {
  export type AsObject = {
    resourcesList: Array<Resources.AsObject>,
  }
}

export class Resources extends jspb.Message {
  getCluster(): string;
  setCluster(value: string): void;

  getNamespace(): string;
  setNamespace(value: string): void;

  getResourcelist(): string;
  setResourcelist(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Resources.AsObject;
  static toObject(includeInstance: boolean, msg: Resources): Resources.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Resources, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Resources;
  static deserializeBinaryFromReader(message: Resources, reader: jspb.BinaryReader): Resources;
}

export namespace Resources {
  export type AsObject = {
    cluster: string,
    namespace: string,
    resourcelist: string,
  }
}

export class GetApplicationsRequest extends jspb.Message {
  clearClustersList(): void;
  getClustersList(): Array<string>;
  setClustersList(value: Array<string>): void;
  addClusters(value: string, index?: number): string;

  clearNamespacesList(): void;
  getNamespacesList(): Array<string>;
  setNamespacesList(value: Array<string>): void;
  addNamespaces(value: string, index?: number): string;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetApplicationsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetApplicationsRequest): GetApplicationsRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetApplicationsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetApplicationsRequest;
  static deserializeBinaryFromReader(message: GetApplicationsRequest, reader: jspb.BinaryReader): GetApplicationsRequest;
}

export namespace GetApplicationsRequest {
  export type AsObject = {
    clustersList: Array<string>,
    namespacesList: Array<string>,
  }
}

export class GetApplicationsResponse extends jspb.Message {
  clearApplicationsList(): void;
  getApplicationsList(): Array<application_pb.Application>;
  setApplicationsList(value: Array<application_pb.Application>): void;
  addApplications(value?: application_pb.Application, index?: number): application_pb.Application;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetApplicationsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetApplicationsResponse): GetApplicationsResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetApplicationsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetApplicationsResponse;
  static deserializeBinaryFromReader(message: GetApplicationsResponse, reader: jspb.BinaryReader): GetApplicationsResponse;
}

export namespace GetApplicationsResponse {
  export type AsObject = {
    applicationsList: Array<application_pb.Application.AsObject>,
  }
}

export class GetApplicationRequest extends jspb.Message {
  getCluster(): string;
  setCluster(value: string): void;

  getNamespace(): string;
  setNamespace(value: string): void;

  getName(): string;
  setName(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetApplicationRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetApplicationRequest): GetApplicationRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetApplicationRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetApplicationRequest;
  static deserializeBinaryFromReader(message: GetApplicationRequest, reader: jspb.BinaryReader): GetApplicationRequest;
}

export namespace GetApplicationRequest {
  export type AsObject = {
    cluster: string,
    namespace: string,
    name: string,
  }
}

export class GetApplicationResponse extends jspb.Message {
  hasApplication(): boolean;
  clearApplication(): void;
  getApplication(): application_pb.Application | undefined;
  setApplication(value?: application_pb.Application): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetApplicationResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetApplicationResponse): GetApplicationResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetApplicationResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetApplicationResponse;
  static deserializeBinaryFromReader(message: GetApplicationResponse, reader: jspb.BinaryReader): GetApplicationResponse;
}

export namespace GetApplicationResponse {
  export type AsObject = {
    application?: application_pb.Application.AsObject,
  }
}

