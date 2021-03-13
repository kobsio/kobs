// package: application
// file: application.proto

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

  hasMetrics(): boolean;
  clearMetrics(): void;
  getMetrics(): ApplicationMetrics | undefined;
  setMetrics(value?: ApplicationMetrics): void;

  hasLogs(): boolean;
  clearLogs(): void;
  getLogs(): ApplicationLogs | undefined;
  setLogs(value?: ApplicationLogs): void;

  hasTraces(): boolean;
  clearTraces(): void;
  getTraces(): ApplicationTraces | undefined;
  setTraces(value?: ApplicationTraces): void;

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
    metrics?: ApplicationMetrics.AsObject,
    logs?: ApplicationLogs.AsObject,
    traces?: ApplicationTraces.AsObject,
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

export class ApplicationMetrics extends jspb.Message {
  getDatasource(): string;
  setDatasource(value: string): void;

  hasHealth(): boolean;
  clearHealth(): void;
  getHealth(): ApplicationMetricsChart | undefined;
  setHealth(value?: ApplicationMetricsChart): void;

  clearVariablesList(): void;
  getVariablesList(): Array<ApplicationMetricsVariable>;
  setVariablesList(value: Array<ApplicationMetricsVariable>): void;
  addVariables(value?: ApplicationMetricsVariable, index?: number): ApplicationMetricsVariable;

  clearChartsList(): void;
  getChartsList(): Array<ApplicationMetricsChart>;
  setChartsList(value: Array<ApplicationMetricsChart>): void;
  addCharts(value?: ApplicationMetricsChart, index?: number): ApplicationMetricsChart;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ApplicationMetrics.AsObject;
  static toObject(includeInstance: boolean, msg: ApplicationMetrics): ApplicationMetrics.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ApplicationMetrics, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ApplicationMetrics;
  static deserializeBinaryFromReader(message: ApplicationMetrics, reader: jspb.BinaryReader): ApplicationMetrics;
}

export namespace ApplicationMetrics {
  export type AsObject = {
    datasource: string,
    health?: ApplicationMetricsChart.AsObject,
    variablesList: Array<ApplicationMetricsVariable.AsObject>,
    chartsList: Array<ApplicationMetricsChart.AsObject>,
  }
}

export class ApplicationMetricsVariable extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  getLabel(): string;
  setLabel(value: string): void;

  getQuery(): string;
  setQuery(value: string): void;

  getAllowall(): boolean;
  setAllowall(value: boolean): void;

  clearValuesList(): void;
  getValuesList(): Array<string>;
  setValuesList(value: Array<string>): void;
  addValues(value: string, index?: number): string;

  getValue(): string;
  setValue(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ApplicationMetricsVariable.AsObject;
  static toObject(includeInstance: boolean, msg: ApplicationMetricsVariable): ApplicationMetricsVariable.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ApplicationMetricsVariable, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ApplicationMetricsVariable;
  static deserializeBinaryFromReader(message: ApplicationMetricsVariable, reader: jspb.BinaryReader): ApplicationMetricsVariable;
}

export namespace ApplicationMetricsVariable {
  export type AsObject = {
    name: string,
    label: string,
    query: string,
    allowall: boolean,
    valuesList: Array<string>,
    value: string,
  }
}

export class ApplicationMetricsChart extends jspb.Message {
  getTitle(): string;
  setTitle(value: string): void;

  getType(): string;
  setType(value: string): void;

  getUnit(): string;
  setUnit(value: string): void;

  getStacked(): boolean;
  setStacked(value: boolean): void;

  getSize(): number;
  setSize(value: number): void;

  clearQueriesList(): void;
  getQueriesList(): Array<ApplicationMetricsQuery>;
  setQueriesList(value: Array<ApplicationMetricsQuery>): void;
  addQueries(value?: ApplicationMetricsQuery, index?: number): ApplicationMetricsQuery;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ApplicationMetricsChart.AsObject;
  static toObject(includeInstance: boolean, msg: ApplicationMetricsChart): ApplicationMetricsChart.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ApplicationMetricsChart, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ApplicationMetricsChart;
  static deserializeBinaryFromReader(message: ApplicationMetricsChart, reader: jspb.BinaryReader): ApplicationMetricsChart;
}

export namespace ApplicationMetricsChart {
  export type AsObject = {
    title: string,
    type: string,
    unit: string,
    stacked: boolean,
    size: number,
    queriesList: Array<ApplicationMetricsQuery.AsObject>,
  }
}

export class ApplicationMetricsQuery extends jspb.Message {
  getQuery(): string;
  setQuery(value: string): void;

  getLabel(): string;
  setLabel(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ApplicationMetricsQuery.AsObject;
  static toObject(includeInstance: boolean, msg: ApplicationMetricsQuery): ApplicationMetricsQuery.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ApplicationMetricsQuery, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ApplicationMetricsQuery;
  static deserializeBinaryFromReader(message: ApplicationMetricsQuery, reader: jspb.BinaryReader): ApplicationMetricsQuery;
}

export namespace ApplicationMetricsQuery {
  export type AsObject = {
    query: string,
    label: string,
  }
}

export class ApplicationLogs extends jspb.Message {
  getDatasource(): string;
  setDatasource(value: string): void;

  clearQueriesList(): void;
  getQueriesList(): Array<ApplicationLogsQuery>;
  setQueriesList(value: Array<ApplicationLogsQuery>): void;
  addQueries(value?: ApplicationLogsQuery, index?: number): ApplicationLogsQuery;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ApplicationLogs.AsObject;
  static toObject(includeInstance: boolean, msg: ApplicationLogs): ApplicationLogs.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ApplicationLogs, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ApplicationLogs;
  static deserializeBinaryFromReader(message: ApplicationLogs, reader: jspb.BinaryReader): ApplicationLogs;
}

export namespace ApplicationLogs {
  export type AsObject = {
    datasource: string,
    queriesList: Array<ApplicationLogsQuery.AsObject>,
  }
}

export class ApplicationLogsQuery extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  getQuery(): string;
  setQuery(value: string): void;

  clearFieldsList(): void;
  getFieldsList(): Array<string>;
  setFieldsList(value: Array<string>): void;
  addFields(value: string, index?: number): string;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ApplicationLogsQuery.AsObject;
  static toObject(includeInstance: boolean, msg: ApplicationLogsQuery): ApplicationLogsQuery.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ApplicationLogsQuery, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ApplicationLogsQuery;
  static deserializeBinaryFromReader(message: ApplicationLogsQuery, reader: jspb.BinaryReader): ApplicationLogsQuery;
}

export namespace ApplicationLogsQuery {
  export type AsObject = {
    name: string,
    query: string,
    fieldsList: Array<string>,
  }
}

export class ApplicationTraces extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ApplicationTraces.AsObject;
  static toObject(includeInstance: boolean, msg: ApplicationTraces): ApplicationTraces.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ApplicationTraces, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ApplicationTraces;
  static deserializeBinaryFromReader(message: ApplicationTraces, reader: jspb.BinaryReader): ApplicationTraces;
}

export namespace ApplicationTraces {
  export type AsObject = {
  }
}

