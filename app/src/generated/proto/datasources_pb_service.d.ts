// package: datasources
// file: datasources.proto

import * as datasources_pb from "./datasources_pb";
import {grpc} from "@improbable-eng/grpc-web";

type DatasourcesGetDatasources = {
  readonly methodName: string;
  readonly service: typeof Datasources;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof datasources_pb.GetDatasourcesRequest;
  readonly responseType: typeof datasources_pb.GetDatasourcesResponse;
};

type DatasourcesGetDatasource = {
  readonly methodName: string;
  readonly service: typeof Datasources;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof datasources_pb.GetDatasourceRequest;
  readonly responseType: typeof datasources_pb.GetDatasourceResponse;
};

type DatasourcesGetVariables = {
  readonly methodName: string;
  readonly service: typeof Datasources;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof datasources_pb.GetVariablesRequest;
  readonly responseType: typeof datasources_pb.GetVariablesResponse;
};

type DatasourcesGetMetrics = {
  readonly methodName: string;
  readonly service: typeof Datasources;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof datasources_pb.GetMetricsRequest;
  readonly responseType: typeof datasources_pb.GetMetricsResponse;
};

type DatasourcesGetLogs = {
  readonly methodName: string;
  readonly service: typeof Datasources;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof datasources_pb.GetLogsRequest;
  readonly responseType: typeof datasources_pb.GetLogsResponse;
};

type DatasourcesGetTraces = {
  readonly methodName: string;
  readonly service: typeof Datasources;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof datasources_pb.GetTracesRequest;
  readonly responseType: typeof datasources_pb.GetTracesResponse;
};

export class Datasources {
  static readonly serviceName: string;
  static readonly GetDatasources: DatasourcesGetDatasources;
  static readonly GetDatasource: DatasourcesGetDatasource;
  static readonly GetVariables: DatasourcesGetVariables;
  static readonly GetMetrics: DatasourcesGetMetrics;
  static readonly GetLogs: DatasourcesGetLogs;
  static readonly GetTraces: DatasourcesGetTraces;
}

export type ServiceError = { message: string, code: number; metadata: grpc.Metadata }
export type Status = { details: string, code: number; metadata: grpc.Metadata }

interface UnaryResponse {
  cancel(): void;
}
interface ResponseStream<T> {
  cancel(): void;
  on(type: 'data', handler: (message: T) => void): ResponseStream<T>;
  on(type: 'end', handler: (status?: Status) => void): ResponseStream<T>;
  on(type: 'status', handler: (status: Status) => void): ResponseStream<T>;
}
interface RequestStream<T> {
  write(message: T): RequestStream<T>;
  end(): void;
  cancel(): void;
  on(type: 'end', handler: (status?: Status) => void): RequestStream<T>;
  on(type: 'status', handler: (status: Status) => void): RequestStream<T>;
}
interface BidirectionalStream<ReqT, ResT> {
  write(message: ReqT): BidirectionalStream<ReqT, ResT>;
  end(): void;
  cancel(): void;
  on(type: 'data', handler: (message: ResT) => void): BidirectionalStream<ReqT, ResT>;
  on(type: 'end', handler: (status?: Status) => void): BidirectionalStream<ReqT, ResT>;
  on(type: 'status', handler: (status: Status) => void): BidirectionalStream<ReqT, ResT>;
}

export class DatasourcesClient {
  readonly serviceHost: string;

  constructor(serviceHost: string, options?: grpc.RpcOptions);
  getDatasources(
    requestMessage: datasources_pb.GetDatasourcesRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: datasources_pb.GetDatasourcesResponse|null) => void
  ): UnaryResponse;
  getDatasources(
    requestMessage: datasources_pb.GetDatasourcesRequest,
    callback: (error: ServiceError|null, responseMessage: datasources_pb.GetDatasourcesResponse|null) => void
  ): UnaryResponse;
  getDatasource(
    requestMessage: datasources_pb.GetDatasourceRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: datasources_pb.GetDatasourceResponse|null) => void
  ): UnaryResponse;
  getDatasource(
    requestMessage: datasources_pb.GetDatasourceRequest,
    callback: (error: ServiceError|null, responseMessage: datasources_pb.GetDatasourceResponse|null) => void
  ): UnaryResponse;
  getVariables(
    requestMessage: datasources_pb.GetVariablesRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: datasources_pb.GetVariablesResponse|null) => void
  ): UnaryResponse;
  getVariables(
    requestMessage: datasources_pb.GetVariablesRequest,
    callback: (error: ServiceError|null, responseMessage: datasources_pb.GetVariablesResponse|null) => void
  ): UnaryResponse;
  getMetrics(
    requestMessage: datasources_pb.GetMetricsRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: datasources_pb.GetMetricsResponse|null) => void
  ): UnaryResponse;
  getMetrics(
    requestMessage: datasources_pb.GetMetricsRequest,
    callback: (error: ServiceError|null, responseMessage: datasources_pb.GetMetricsResponse|null) => void
  ): UnaryResponse;
  getLogs(
    requestMessage: datasources_pb.GetLogsRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: datasources_pb.GetLogsResponse|null) => void
  ): UnaryResponse;
  getLogs(
    requestMessage: datasources_pb.GetLogsRequest,
    callback: (error: ServiceError|null, responseMessage: datasources_pb.GetLogsResponse|null) => void
  ): UnaryResponse;
  getTraces(
    requestMessage: datasources_pb.GetTracesRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: datasources_pb.GetTracesResponse|null) => void
  ): UnaryResponse;
  getTraces(
    requestMessage: datasources_pb.GetTracesRequest,
    callback: (error: ServiceError|null, responseMessage: datasources_pb.GetTracesResponse|null) => void
  ): UnaryResponse;
}

