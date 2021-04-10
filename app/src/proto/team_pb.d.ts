// package: team
// file: team.proto

import * as jspb from "google-protobuf";

export class Team extends jspb.Message {
  getCluster(): string;
  setCluster(value: string): void;

  getNamespace(): string;
  setNamespace(value: string): void;

  getName(): string;
  setName(value: string): void;

  getDescription(): string;
  setDescription(value: string): void;

  getLogo(): string;
  setLogo(value: string): void;

  clearLinksList(): void;
  getLinksList(): Array<Link>;
  setLinksList(value: Array<Link>): void;
  addLinks(value?: Link, index?: number): Link;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Team.AsObject;
  static toObject(includeInstance: boolean, msg: Team): Team.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Team, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Team;
  static deserializeBinaryFromReader(message: Team, reader: jspb.BinaryReader): Team;
}

export namespace Team {
  export type AsObject = {
    cluster: string,
    namespace: string,
    name: string,
    description: string,
    logo: string,
    linksList: Array<Link.AsObject>,
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

