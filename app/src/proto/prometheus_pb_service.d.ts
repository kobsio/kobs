// package: plugins.prometheus
// file: prometheus.proto

import * as prometheus_pb from "./prometheus_pb";
import {grpc} from "@improbable-eng/grpc-web";

type PrometheusGetVariables = {
  readonly methodName: string;
  readonly service: typeof Prometheus;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof prometheus_pb.GetVariablesRequest;
  readonly responseType: typeof prometheus_pb.GetVariablesResponse;
};

type PrometheusGetMetrics = {
  readonly methodName: string;
  readonly service: typeof Prometheus;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof prometheus_pb.GetMetricsRequest;
  readonly responseType: typeof prometheus_pb.GetMetricsResponse;
};

type PrometheusMetricLookup = {
  readonly methodName: string;
  readonly service: typeof Prometheus;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof prometheus_pb.MetricLookupRequest;
  readonly responseType: typeof prometheus_pb.MetricLookupResponse;
};

type PrometheusGetTableData = {
  readonly methodName: string;
  readonly service: typeof Prometheus;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof prometheus_pb.GetTableDataRequest;
  readonly responseType: typeof prometheus_pb.GetTableDataResponse;
};

export class Prometheus {
  static readonly serviceName: string;
  static readonly GetVariables: PrometheusGetVariables;
  static readonly GetMetrics: PrometheusGetMetrics;
  static readonly MetricLookup: PrometheusMetricLookup;
  static readonly GetTableData: PrometheusGetTableData;
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

export class PrometheusClient {
  readonly serviceHost: string;

  constructor(serviceHost: string, options?: grpc.RpcOptions);
  getVariables(
    requestMessage: prometheus_pb.GetVariablesRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: prometheus_pb.GetVariablesResponse|null) => void
  ): UnaryResponse;
  getVariables(
    requestMessage: prometheus_pb.GetVariablesRequest,
    callback: (error: ServiceError|null, responseMessage: prometheus_pb.GetVariablesResponse|null) => void
  ): UnaryResponse;
  getMetrics(
    requestMessage: prometheus_pb.GetMetricsRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: prometheus_pb.GetMetricsResponse|null) => void
  ): UnaryResponse;
  getMetrics(
    requestMessage: prometheus_pb.GetMetricsRequest,
    callback: (error: ServiceError|null, responseMessage: prometheus_pb.GetMetricsResponse|null) => void
  ): UnaryResponse;
  metricLookup(
    requestMessage: prometheus_pb.MetricLookupRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: prometheus_pb.MetricLookupResponse|null) => void
  ): UnaryResponse;
  metricLookup(
    requestMessage: prometheus_pb.MetricLookupRequest,
    callback: (error: ServiceError|null, responseMessage: prometheus_pb.MetricLookupResponse|null) => void
  ): UnaryResponse;
  getTableData(
    requestMessage: prometheus_pb.GetTableDataRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: prometheus_pb.GetTableDataResponse|null) => void
  ): UnaryResponse;
  getTableData(
    requestMessage: prometheus_pb.GetTableDataRequest,
    callback: (error: ServiceError|null, responseMessage: prometheus_pb.GetTableDataResponse|null) => void
  ): UnaryResponse;
}

