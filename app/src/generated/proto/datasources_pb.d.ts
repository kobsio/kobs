// package: datasources
// file: datasources.proto

import * as jspb from "google-protobuf";
import * as application_pb from "./application_pb";

export class Datasource extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  getType(): string;
  setType(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Datasource.AsObject;
  static toObject(includeInstance: boolean, msg: Datasource): Datasource.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Datasource, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Datasource;
  static deserializeBinaryFromReader(message: Datasource, reader: jspb.BinaryReader): Datasource;
}

export namespace Datasource {
  export type AsObject = {
    name: string,
    type: string,
  }
}

export class GetDatasourcesRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetDatasourcesRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetDatasourcesRequest): GetDatasourcesRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetDatasourcesRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetDatasourcesRequest;
  static deserializeBinaryFromReader(message: GetDatasourcesRequest, reader: jspb.BinaryReader): GetDatasourcesRequest;
}

export namespace GetDatasourcesRequest {
  export type AsObject = {
  }
}

export class GetDatasourcesResponse extends jspb.Message {
  clearDatasourcesList(): void;
  getDatasourcesList(): Array<Datasource>;
  setDatasourcesList(value: Array<Datasource>): void;
  addDatasources(value?: Datasource, index?: number): Datasource;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetDatasourcesResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetDatasourcesResponse): GetDatasourcesResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetDatasourcesResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetDatasourcesResponse;
  static deserializeBinaryFromReader(message: GetDatasourcesResponse, reader: jspb.BinaryReader): GetDatasourcesResponse;
}

export namespace GetDatasourcesResponse {
  export type AsObject = {
    datasourcesList: Array<Datasource.AsObject>,
  }
}

export class GetDatasourceRequest extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetDatasourceRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetDatasourceRequest): GetDatasourceRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetDatasourceRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetDatasourceRequest;
  static deserializeBinaryFromReader(message: GetDatasourceRequest, reader: jspb.BinaryReader): GetDatasourceRequest;
}

export namespace GetDatasourceRequest {
  export type AsObject = {
    name: string,
  }
}

export class GetDatasourceResponse extends jspb.Message {
  hasDatasource(): boolean;
  clearDatasource(): void;
  getDatasource(): Datasource | undefined;
  setDatasource(value?: Datasource): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetDatasourceResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetDatasourceResponse): GetDatasourceResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetDatasourceResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetDatasourceResponse;
  static deserializeBinaryFromReader(message: GetDatasourceResponse, reader: jspb.BinaryReader): GetDatasourceResponse;
}

export namespace GetDatasourceResponse {
  export type AsObject = {
    datasource?: Datasource.AsObject,
  }
}

export class GetVariablesRequest extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  hasOptions(): boolean;
  clearOptions(): void;
  getOptions(): DatasourceOptions | undefined;
  setOptions(value?: DatasourceOptions): void;

  clearVariablesList(): void;
  getVariablesList(): Array<application_pb.ApplicationMetricsVariable>;
  setVariablesList(value: Array<application_pb.ApplicationMetricsVariable>): void;
  addVariables(value?: application_pb.ApplicationMetricsVariable, index?: number): application_pb.ApplicationMetricsVariable;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetVariablesRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetVariablesRequest): GetVariablesRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetVariablesRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetVariablesRequest;
  static deserializeBinaryFromReader(message: GetVariablesRequest, reader: jspb.BinaryReader): GetVariablesRequest;
}

export namespace GetVariablesRequest {
  export type AsObject = {
    name: string,
    options?: DatasourceOptions.AsObject,
    variablesList: Array<application_pb.ApplicationMetricsVariable.AsObject>,
  }
}

export class GetVariablesResponse extends jspb.Message {
  clearVariablesList(): void;
  getVariablesList(): Array<application_pb.ApplicationMetricsVariable>;
  setVariablesList(value: Array<application_pb.ApplicationMetricsVariable>): void;
  addVariables(value?: application_pb.ApplicationMetricsVariable, index?: number): application_pb.ApplicationMetricsVariable;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetVariablesResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetVariablesResponse): GetVariablesResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetVariablesResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetVariablesResponse;
  static deserializeBinaryFromReader(message: GetVariablesResponse, reader: jspb.BinaryReader): GetVariablesResponse;
}

export namespace GetVariablesResponse {
  export type AsObject = {
    variablesList: Array<application_pb.ApplicationMetricsVariable.AsObject>,
  }
}

export class GetMetricsRequest extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  hasOptions(): boolean;
  clearOptions(): void;
  getOptions(): DatasourceOptions | undefined;
  setOptions(value?: DatasourceOptions): void;

  clearVariablesList(): void;
  getVariablesList(): Array<application_pb.ApplicationMetricsVariable>;
  setVariablesList(value: Array<application_pb.ApplicationMetricsVariable>): void;
  addVariables(value?: application_pb.ApplicationMetricsVariable, index?: number): application_pb.ApplicationMetricsVariable;

  clearQueriesList(): void;
  getQueriesList(): Array<application_pb.ApplicationMetricsQuery>;
  setQueriesList(value: Array<application_pb.ApplicationMetricsQuery>): void;
  addQueries(value?: application_pb.ApplicationMetricsQuery, index?: number): application_pb.ApplicationMetricsQuery;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetMetricsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetMetricsRequest): GetMetricsRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetMetricsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetMetricsRequest;
  static deserializeBinaryFromReader(message: GetMetricsRequest, reader: jspb.BinaryReader): GetMetricsRequest;
}

export namespace GetMetricsRequest {
  export type AsObject = {
    name: string,
    options?: DatasourceOptions.AsObject,
    variablesList: Array<application_pb.ApplicationMetricsVariable.AsObject>,
    queriesList: Array<application_pb.ApplicationMetricsQuery.AsObject>,
  }
}

export class GetMetricsResponse extends jspb.Message {
  clearMetricsList(): void;
  getMetricsList(): Array<DatasourceMetrics>;
  setMetricsList(value: Array<DatasourceMetrics>): void;
  addMetrics(value?: DatasourceMetrics, index?: number): DatasourceMetrics;

  clearInterpolatedqueriesList(): void;
  getInterpolatedqueriesList(): Array<string>;
  setInterpolatedqueriesList(value: Array<string>): void;
  addInterpolatedqueries(value: string, index?: number): string;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetMetricsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetMetricsResponse): GetMetricsResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetMetricsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetMetricsResponse;
  static deserializeBinaryFromReader(message: GetMetricsResponse, reader: jspb.BinaryReader): GetMetricsResponse;
}

export namespace GetMetricsResponse {
  export type AsObject = {
    metricsList: Array<DatasourceMetrics.AsObject>,
    interpolatedqueriesList: Array<string>,
  }
}

export class GetLogsRequest extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  hasOptions(): boolean;
  clearOptions(): void;
  getOptions(): DatasourceOptions | undefined;
  setOptions(value?: DatasourceOptions): void;

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
    options?: DatasourceOptions.AsObject,
  }
}

export class GetLogsResponse extends jspb.Message {
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
  }
}

export class GetTracesRequest extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  hasOptions(): boolean;
  clearOptions(): void;
  getOptions(): DatasourceOptions | undefined;
  setOptions(value?: DatasourceOptions): void;

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
    options?: DatasourceOptions.AsObject,
  }
}

export class GetTracesResponse extends jspb.Message {
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
  }
}

export class DatasourceOptions extends jspb.Message {
  getTimestart(): number;
  setTimestart(value: number): void;

  getTimeend(): number;
  setTimeend(value: number): void;

  getResolution(): string;
  setResolution(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DatasourceOptions.AsObject;
  static toObject(includeInstance: boolean, msg: DatasourceOptions): DatasourceOptions.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DatasourceOptions, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DatasourceOptions;
  static deserializeBinaryFromReader(message: DatasourceOptions, reader: jspb.BinaryReader): DatasourceOptions;
}

export namespace DatasourceOptions {
  export type AsObject = {
    timestart: number,
    timeend: number,
    resolution: string,
  }
}

export class DatasourceMetrics extends jspb.Message {
  getLabel(): string;
  setLabel(value: string): void;

  getMin(): number;
  setMin(value: number): void;

  getMax(): number;
  setMax(value: number): void;

  clearDataList(): void;
  getDataList(): Array<DatasourceMetricsData>;
  setDataList(value: Array<DatasourceMetricsData>): void;
  addData(value?: DatasourceMetricsData, index?: number): DatasourceMetricsData;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DatasourceMetrics.AsObject;
  static toObject(includeInstance: boolean, msg: DatasourceMetrics): DatasourceMetrics.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DatasourceMetrics, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DatasourceMetrics;
  static deserializeBinaryFromReader(message: DatasourceMetrics, reader: jspb.BinaryReader): DatasourceMetrics;
}

export namespace DatasourceMetrics {
  export type AsObject = {
    label: string,
    min: number,
    max: number,
    dataList: Array<DatasourceMetricsData.AsObject>,
  }
}

export class DatasourceMetricsData extends jspb.Message {
  getX(): number;
  setX(value: number): void;

  getY(): number;
  setY(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DatasourceMetricsData.AsObject;
  static toObject(includeInstance: boolean, msg: DatasourceMetricsData): DatasourceMetricsData.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DatasourceMetricsData, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DatasourceMetricsData;
  static deserializeBinaryFromReader(message: DatasourceMetricsData, reader: jspb.BinaryReader): DatasourceMetricsData;
}

export namespace DatasourceMetricsData {
  export type AsObject = {
    x: number,
    y: number,
  }
}

