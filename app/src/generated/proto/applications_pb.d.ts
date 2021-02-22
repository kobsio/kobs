// package: clusters
// file: applications.proto

import * as jspb from "google-protobuf";

export class Application extends jspb.Message {
  getCluster(): string;
  setCluster(value: string): void;

  getNamespace(): string;
  setNamespace(value: string): void;

  getName(): string;
  setName(value: string): void;

  clearLinksList(): void;
  getLinksList(): Array<ApplicationLink>;
  setLinksList(value: Array<ApplicationLink>): void;
  addLinks(value?: ApplicationLink, index?: number): ApplicationLink;

  clearResourcesList(): void;
  getResourcesList(): Array<ApplicationResources>;
  setResourcesList(value: Array<ApplicationResources>): void;
  addResources(value?: ApplicationResources, index?: number): ApplicationResources;

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
    linksList: Array<ApplicationLink.AsObject>,
    resourcesList: Array<ApplicationResources.AsObject>,
  }
}

export class ApplicationLink extends jspb.Message {
  getTitle(): string;
  setTitle(value: string): void;

  getLink(): string;
  setLink(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ApplicationLink.AsObject;
  static toObject(includeInstance: boolean, msg: ApplicationLink): ApplicationLink.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ApplicationLink, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ApplicationLink;
  static deserializeBinaryFromReader(message: ApplicationLink, reader: jspb.BinaryReader): ApplicationLink;
}

export namespace ApplicationLink {
  export type AsObject = {
    title: string,
    link: string,
  }
}

export class ApplicationResources extends jspb.Message {
  clearKindsList(): void;
  getKindsList(): Array<string>;
  setKindsList(value: Array<string>): void;
  addKinds(value: string, index?: number): string;

  getSelector(): string;
  setSelector(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ApplicationResources.AsObject;
  static toObject(includeInstance: boolean, msg: ApplicationResources): ApplicationResources.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ApplicationResources, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ApplicationResources;
  static deserializeBinaryFromReader(message: ApplicationResources, reader: jspb.BinaryReader): ApplicationResources;
}

export namespace ApplicationResources {
  export type AsObject = {
    kindsList: Array<string>,
    selector: string,
  }
}

