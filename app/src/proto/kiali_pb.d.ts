// package: plugins.kiali
// file: kiali.proto

import * as jspb from "google-protobuf";

export class GetNamespacesRequest extends jspb.Message {
  getName(): string;
  setName(value: string): void;

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
    name: string,
  }
}

export class GetNamespacesResponse extends jspb.Message {
  clearNamespacesList(): void;
  getNamespacesList(): Array<Namespace>;
  setNamespacesList(value: Array<Namespace>): void;
  addNamespaces(value?: Namespace, index?: number): Namespace;

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
    namespacesList: Array<Namespace.AsObject>,
  }
}

export class Namespace extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  getLabelsMap(): jspb.Map<string, string>;
  clearLabelsMap(): void;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Namespace.AsObject;
  static toObject(includeInstance: boolean, msg: Namespace): Namespace.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Namespace, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Namespace;
  static deserializeBinaryFromReader(message: Namespace, reader: jspb.BinaryReader): Namespace;
}

export namespace Namespace {
  export type AsObject = {
    name: string,
    labelsMap: Array<[string, string]>,
  }
}

export class GetGraphRequest extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  getDuration(): number;
  setDuration(value: number): void;

  getGraphtype(): string;
  setGraphtype(value: string): void;

  getInjectservicenodes(): boolean;
  setInjectservicenodes(value: boolean): void;

  getGroupby(): string;
  setGroupby(value: string): void;

  clearAppendersList(): void;
  getAppendersList(): Array<string>;
  setAppendersList(value: Array<string>): void;
  addAppenders(value: string, index?: number): string;

  clearNamespacesList(): void;
  getNamespacesList(): Array<string>;
  setNamespacesList(value: Array<string>): void;
  addNamespaces(value: string, index?: number): string;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetGraphRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetGraphRequest): GetGraphRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetGraphRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetGraphRequest;
  static deserializeBinaryFromReader(message: GetGraphRequest, reader: jspb.BinaryReader): GetGraphRequest;
}

export namespace GetGraphRequest {
  export type AsObject = {
    name: string,
    duration: number,
    graphtype: string,
    injectservicenodes: boolean,
    groupby: string,
    appendersList: Array<string>,
    namespacesList: Array<string>,
  }
}

export class GetGraphResponse extends jspb.Message {
  getTimestamp(): number;
  setTimestamp(value: number): void;

  getDuration(): number;
  setDuration(value: number): void;

  getGraphtype(): string;
  setGraphtype(value: string): void;

  hasElements(): boolean;
  clearElements(): void;
  getElements(): Elements | undefined;
  setElements(value?: Elements): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetGraphResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetGraphResponse): GetGraphResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetGraphResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetGraphResponse;
  static deserializeBinaryFromReader(message: GetGraphResponse, reader: jspb.BinaryReader): GetGraphResponse;
}

export namespace GetGraphResponse {
  export type AsObject = {
    timestamp: number,
    duration: number,
    graphtype: string,
    elements?: Elements.AsObject,
  }
}

export class Elements extends jspb.Message {
  clearNodesList(): void;
  getNodesList(): Array<NodeWrapper>;
  setNodesList(value: Array<NodeWrapper>): void;
  addNodes(value?: NodeWrapper, index?: number): NodeWrapper;

  clearEdgesList(): void;
  getEdgesList(): Array<EdgeWrapper>;
  setEdgesList(value: Array<EdgeWrapper>): void;
  addEdges(value?: EdgeWrapper, index?: number): EdgeWrapper;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Elements.AsObject;
  static toObject(includeInstance: boolean, msg: Elements): Elements.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Elements, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Elements;
  static deserializeBinaryFromReader(message: Elements, reader: jspb.BinaryReader): Elements;
}

export namespace Elements {
  export type AsObject = {
    nodesList: Array<NodeWrapper.AsObject>,
    edgesList: Array<EdgeWrapper.AsObject>,
  }
}

export class NodeWrapper extends jspb.Message {
  hasData(): boolean;
  clearData(): void;
  getData(): Node | undefined;
  setData(value?: Node): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): NodeWrapper.AsObject;
  static toObject(includeInstance: boolean, msg: NodeWrapper): NodeWrapper.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: NodeWrapper, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): NodeWrapper;
  static deserializeBinaryFromReader(message: NodeWrapper, reader: jspb.BinaryReader): NodeWrapper;
}

export namespace NodeWrapper {
  export type AsObject = {
    data?: Node.AsObject,
  }
}

export class EdgeWrapper extends jspb.Message {
  hasData(): boolean;
  clearData(): void;
  getData(): Edge | undefined;
  setData(value?: Edge): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): EdgeWrapper.AsObject;
  static toObject(includeInstance: boolean, msg: EdgeWrapper): EdgeWrapper.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: EdgeWrapper, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): EdgeWrapper;
  static deserializeBinaryFromReader(message: EdgeWrapper, reader: jspb.BinaryReader): EdgeWrapper;
}

export namespace EdgeWrapper {
  export type AsObject = {
    data?: Edge.AsObject,
  }
}

export class Node extends jspb.Message {
  getId(): string;
  setId(value: string): void;

  getParent(): string;
  setParent(value: string): void;

  getNodetype(): string;
  setNodetype(value: string): void;

  getCluster(): string;
  setCluster(value: string): void;

  getNamespace(): string;
  setNamespace(value: string): void;

  getWorkload(): string;
  setWorkload(value: string): void;

  getApp(): string;
  setApp(value: string): void;

  getVersion(): string;
  setVersion(value: string): void;

  getService(): string;
  setService(value: string): void;

  getAggregate(): string;
  setAggregate(value: string): void;

  clearDestservicesList(): void;
  getDestservicesList(): Array<ServiceName>;
  setDestservicesList(value: Array<ServiceName>): void;
  addDestservices(value?: ServiceName, index?: number): ServiceName;

  clearTrafficList(): void;
  getTrafficList(): Array<ProtocolTraffic>;
  setTrafficList(value: Array<ProtocolTraffic>): void;
  addTraffic(value?: ProtocolTraffic, index?: number): ProtocolTraffic;

  getHascb(): boolean;
  setHascb(value: boolean): void;

  getHashealthconfigMap(): jspb.Map<string, string>;
  clearHashealthconfigMap(): void;
  getHasmissingsc(): boolean;
  setHasmissingsc(value: boolean): void;

  getHasvs(): boolean;
  setHasvs(value: boolean): void;

  getIsbox(): string;
  setIsbox(value: string): void;

  getIsdead(): boolean;
  setIsdead(value: boolean): void;

  getIsidle(): boolean;
  setIsidle(value: boolean): void;

  getIsinaccessible(): boolean;
  setIsinaccessible(value: boolean): void;

  getIsoutside(): boolean;
  setIsoutside(value: boolean): void;

  getIsroot(): boolean;
  setIsroot(value: boolean): void;

  hasIsserviceentry(): boolean;
  clearIsserviceentry(): void;
  getIsserviceentry(): SEInfo | undefined;
  setIsserviceentry(value?: SEInfo): void;

  getNodelabel(): string;
  setNodelabel(value: string): void;

  getNodelabelfull(): string;
  setNodelabelfull(value: string): void;

  getNodeimage(): string;
  setNodeimage(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Node.AsObject;
  static toObject(includeInstance: boolean, msg: Node): Node.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Node, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Node;
  static deserializeBinaryFromReader(message: Node, reader: jspb.BinaryReader): Node;
}

export namespace Node {
  export type AsObject = {
    id: string,
    parent: string,
    nodetype: string,
    cluster: string,
    namespace: string,
    workload: string,
    app: string,
    version: string,
    service: string,
    aggregate: string,
    destservicesList: Array<ServiceName.AsObject>,
    trafficList: Array<ProtocolTraffic.AsObject>,
    hascb: boolean,
    hashealthconfigMap: Array<[string, string]>,
    hasmissingsc: boolean,
    hasvs: boolean,
    isbox: string,
    isdead: boolean,
    isidle: boolean,
    isinaccessible: boolean,
    isoutside: boolean,
    isroot: boolean,
    isserviceentry?: SEInfo.AsObject,
    nodelabel: string,
    nodelabelfull: string,
    nodeimage: string,
  }
}

export class Edge extends jspb.Message {
  getId(): string;
  setId(value: string): void;

  getSource(): string;
  setSource(value: string): void;

  getTarget(): string;
  setTarget(value: string): void;

  getDestprincipal(): string;
  setDestprincipal(value: string): void;

  getIsmtls(): string;
  setIsmtls(value: string): void;

  getResponsetime(): string;
  setResponsetime(value: string): void;

  getSourceprincipal(): string;
  setSourceprincipal(value: string): void;

  hasTraffic(): boolean;
  clearTraffic(): void;
  getTraffic(): ProtocolTraffic | undefined;
  setTraffic(value?: ProtocolTraffic): void;

  getEdgelabel(): string;
  setEdgelabel(value: string): void;

  getEdgetype(): string;
  setEdgetype(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Edge.AsObject;
  static toObject(includeInstance: boolean, msg: Edge): Edge.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Edge, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Edge;
  static deserializeBinaryFromReader(message: Edge, reader: jspb.BinaryReader): Edge;
}

export namespace Edge {
  export type AsObject = {
    id: string,
    source: string,
    target: string,
    destprincipal: string,
    ismtls: string,
    responsetime: string,
    sourceprincipal: string,
    traffic?: ProtocolTraffic.AsObject,
    edgelabel: string,
    edgetype: string,
  }
}

export class ServiceName extends jspb.Message {
  getCluster(): string;
  setCluster(value: string): void;

  getNamespace(): string;
  setNamespace(value: string): void;

  getName(): string;
  setName(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ServiceName.AsObject;
  static toObject(includeInstance: boolean, msg: ServiceName): ServiceName.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ServiceName, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ServiceName;
  static deserializeBinaryFromReader(message: ServiceName, reader: jspb.BinaryReader): ServiceName;
}

export namespace ServiceName {
  export type AsObject = {
    cluster: string,
    namespace: string,
    name: string,
  }
}

export class ProtocolTraffic extends jspb.Message {
  getProtocol(): string;
  setProtocol(value: string): void;

  getRatesMap(): jspb.Map<string, string>;
  clearRatesMap(): void;
  getResponsesMap(): jspb.Map<string, Response>;
  clearResponsesMap(): void;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ProtocolTraffic.AsObject;
  static toObject(includeInstance: boolean, msg: ProtocolTraffic): ProtocolTraffic.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ProtocolTraffic, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ProtocolTraffic;
  static deserializeBinaryFromReader(message: ProtocolTraffic, reader: jspb.BinaryReader): ProtocolTraffic;
}

export namespace ProtocolTraffic {
  export type AsObject = {
    protocol: string,
    ratesMap: Array<[string, string]>,
    responsesMap: Array<[string, Response.AsObject]>,
  }
}

export class SEInfo extends jspb.Message {
  getLocation(): string;
  setLocation(value: string): void;

  clearHostsList(): void;
  getHostsList(): Array<string>;
  setHostsList(value: Array<string>): void;
  addHosts(value: string, index?: number): string;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SEInfo.AsObject;
  static toObject(includeInstance: boolean, msg: SEInfo): SEInfo.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SEInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SEInfo;
  static deserializeBinaryFromReader(message: SEInfo, reader: jspb.BinaryReader): SEInfo;
}

export namespace SEInfo {
  export type AsObject = {
    location: string,
    hostsList: Array<string>,
  }
}

export class Response extends jspb.Message {
  getFlagsMap(): jspb.Map<string, string>;
  clearFlagsMap(): void;
  getHostsMap(): jspb.Map<string, string>;
  clearHostsMap(): void;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Response.AsObject;
  static toObject(includeInstance: boolean, msg: Response): Response.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Response, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Response;
  static deserializeBinaryFromReader(message: Response, reader: jspb.BinaryReader): Response;
}

export namespace Response {
  export type AsObject = {
    flagsMap: Array<[string, string]>,
    hostsMap: Array<[string, string]>,
  }
}

