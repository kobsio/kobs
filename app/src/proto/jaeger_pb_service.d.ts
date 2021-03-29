// package: plugins.jaeger
// file: jaeger.proto

import * as jaeger_pb from "./jaeger_pb";
import {grpc} from "@improbable-eng/grpc-web";

type JaegerGetServices = {
  readonly methodName: string;
  readonly service: typeof Jaeger;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof jaeger_pb.GetServicesRequest;
  readonly responseType: typeof jaeger_pb.GetServicesResponse;
};

type JaegerGetOperations = {
  readonly methodName: string;
  readonly service: typeof Jaeger;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof jaeger_pb.GetOperationsRequest;
  readonly responseType: typeof jaeger_pb.GetOperationsResponse;
};

type JaegerGetTraces = {
  readonly methodName: string;
  readonly service: typeof Jaeger;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof jaeger_pb.GetTracesRequest;
  readonly responseType: typeof jaeger_pb.GetTracesResponse;
};

type JaegerGetTrace = {
  readonly methodName: string;
  readonly service: typeof Jaeger;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof jaeger_pb.GetTraceRequest;
  readonly responseType: typeof jaeger_pb.GetTraceResponse;
};

export class Jaeger {
  static readonly serviceName: string;
  static readonly GetServices: JaegerGetServices;
  static readonly GetOperations: JaegerGetOperations;
  static readonly GetTraces: JaegerGetTraces;
  static readonly GetTrace: JaegerGetTrace;
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

export class JaegerClient {
  readonly serviceHost: string;

  constructor(serviceHost: string, options?: grpc.RpcOptions);
  getServices(
    requestMessage: jaeger_pb.GetServicesRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: jaeger_pb.GetServicesResponse|null) => void
  ): UnaryResponse;
  getServices(
    requestMessage: jaeger_pb.GetServicesRequest,
    callback: (error: ServiceError|null, responseMessage: jaeger_pb.GetServicesResponse|null) => void
  ): UnaryResponse;
  getOperations(
    requestMessage: jaeger_pb.GetOperationsRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: jaeger_pb.GetOperationsResponse|null) => void
  ): UnaryResponse;
  getOperations(
    requestMessage: jaeger_pb.GetOperationsRequest,
    callback: (error: ServiceError|null, responseMessage: jaeger_pb.GetOperationsResponse|null) => void
  ): UnaryResponse;
  getTraces(
    requestMessage: jaeger_pb.GetTracesRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: jaeger_pb.GetTracesResponse|null) => void
  ): UnaryResponse;
  getTraces(
    requestMessage: jaeger_pb.GetTracesRequest,
    callback: (error: ServiceError|null, responseMessage: jaeger_pb.GetTracesResponse|null) => void
  ): UnaryResponse;
  getTrace(
    requestMessage: jaeger_pb.GetTraceRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: jaeger_pb.GetTraceResponse|null) => void
  ): UnaryResponse;
  getTrace(
    requestMessage: jaeger_pb.GetTraceRequest,
    callback: (error: ServiceError|null, responseMessage: jaeger_pb.GetTraceResponse|null) => void
  ): UnaryResponse;
}

