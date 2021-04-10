// package: application
// file: application.proto

import * as jspb from "google-protobuf";
import * as plugins_pb from "./plugins_pb";

export class Application extends jspb.Message {
  getCluster(): string;
  setCluster(value: string): void;

  getNamespace(): string;
  setNamespace(value: string): void;

  getName(): string;
  setName(value: string): void;

  hasDetails(): boolean;
  clearDetails(): void;
  getDetails(): Details | undefined;
  setDetails(value?: Details): void;

  clearTeamsList(): void;
  getTeamsList(): Array<string>;
  setTeamsList(value: Array<string>): void;
  addTeams(value: string, index?: number): string;

  clearResourcesList(): void;
  getResourcesList(): Array<Resources>;
  setResourcesList(value: Array<Resources>): void;
  addResources(value?: Resources, index?: number): Resources;

  clearDependenciesList(): void;
  getDependenciesList(): Array<Dependency>;
  setDependenciesList(value: Array<Dependency>): void;
  addDependencies(value?: Dependency, index?: number): Dependency;

  clearPluginsList(): void;
  getPluginsList(): Array<plugins_pb.Plugin>;
  setPluginsList(value: Array<plugins_pb.Plugin>): void;
  addPlugins(value?: plugins_pb.Plugin, index?: number): plugins_pb.Plugin;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Application.AsObject;
  static toObject(includeInstance: boolean, msg: Application): Application.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Application, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Application;
  static deserializeBinaryFromReader(message: Application, reader: jspb.BinaryReader): Application;
}

export namespace Application {
  export type AsObject = {
    cluster: string,
    namespace: string,
    name: string,
    details?: Details.AsObject,
    teamsList: Array<string>,
    resourcesList: Array<Resources.AsObject>,
    dependenciesList: Array<Dependency.AsObject>,
    pluginsList: Array<plugins_pb.Plugin.AsObject>,
  }
}

export class Details extends jspb.Message {
  getDescription(): string;
  setDescription(value: string): void;

  clearLinksList(): void;
  getLinksList(): Array<Link>;
  setLinksList(value: Array<Link>): void;
  addLinks(value?: Link, index?: number): Link;

  hasPlugin(): boolean;
  clearPlugin(): void;
  getPlugin(): plugins_pb.Plugin | undefined;
  setPlugin(value?: plugins_pb.Plugin): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Details.AsObject;
  static toObject(includeInstance: boolean, msg: Details): Details.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Details, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Details;
  static deserializeBinaryFromReader(message: Details, reader: jspb.BinaryReader): Details;
}

export namespace Details {
  export type AsObject = {
    description: string,
    linksList: Array<Link.AsObject>,
    plugin?: plugins_pb.Plugin.AsObject,
  }
}

export class Link extends jspb.Message {
  getTitle(): string;
  setTitle(value: string): void;

  getLink(): string;
  setLink(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Link.AsObject;
  static toObject(includeInstance: boolean, msg: Link): Link.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Link, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Link;
  static deserializeBinaryFromReader(message: Link, reader: jspb.BinaryReader): Link;
}

export namespace Link {
  export type AsObject = {
    title: string,
    link: string,
  }
}

export class Resources extends jspb.Message {
  clearNamespacesList(): void;
  getNamespacesList(): Array<string>;
  setNamespacesList(value: Array<string>): void;
  addNamespaces(value: string, index?: number): string;

  clearKindsList(): void;
  getKindsList(): Array<string>;
  setKindsList(value: Array<string>): void;
  addKinds(value: string, index?: number): string;

  getSelector(): string;
  setSelector(value: string): void;

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
    namespacesList: Array<string>,
    kindsList: Array<string>,
    selector: string,
  }
}

export class Dependency extends jspb.Message {
  getCluster(): string;
  setCluster(value: string): void;

  getNamespace(): string;
  setNamespace(value: string): void;

  getName(): string;
  setName(value: string): void;

  getDescription(): string;
  setDescription(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Dependency.AsObject;
  static toObject(includeInstance: boolean, msg: Dependency): Dependency.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Dependency, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Dependency;
  static deserializeBinaryFromReader(message: Dependency, reader: jspb.BinaryReader): Dependency;
}

export namespace Dependency {
  export type AsObject = {
    cluster: string,
    namespace: string,
    name: string,
    description: string,
  }
}

