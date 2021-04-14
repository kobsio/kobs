// package: plugins.kiali
// file: kiali.proto

import * as kiali_pb from "./kiali_pb";
import {grpc} from "@improbable-eng/grpc-web";

type KialiGetNamespaces = {
  readonly methodName: string;
  readonly service: typeof Kiali;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof kiali_pb.GetNamespacesRequest;
  readonly responseType: typeof kiali_pb.GetNamespacesResponse;
};

type KialiGetGraph = {
  readonly methodName: string;
  readonly service: typeof Kiali;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof kiali_pb.GetGraphRequest;
  readonly responseType: typeof kiali_pb.GetGraphResponse;
};

export class Kiali {
  static readonly serviceName: string;
  static readonly GetNamespaces: KialiGetNamespaces;
  static readonly GetGraph: KialiGetGraph;
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

export class KialiClient {
  readonly serviceHost: string;

  constructor(serviceHost: string, options?: grpc.RpcOptions);
  getNamespaces(
    requestMessage: kiali_pb.GetNamespacesRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: kiali_pb.GetNamespacesResponse|null) => void
  ): UnaryResponse;
  getNamespaces(
    requestMessage: kiali_pb.GetNamespacesRequest,
    callback: (error: ServiceError|null, responseMessage: kiali_pb.GetNamespacesResponse|null) => void
  ): UnaryResponse;
  getGraph(
    requestMessage: kiali_pb.GetGraphRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: kiali_pb.GetGraphResponse|null) => void
  ): UnaryResponse;
  getGraph(
    requestMessage: kiali_pb.GetGraphRequest,
    callback: (error: ServiceError|null, responseMessage: kiali_pb.GetGraphResponse|null) => void
  ): UnaryResponse;
}

