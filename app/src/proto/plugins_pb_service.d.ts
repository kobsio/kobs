// package: plugins
// file: plugins.proto

import * as plugins_pb from "./plugins_pb";
import {grpc} from "@improbable-eng/grpc-web";

type PluginsGetPlugins = {
  readonly methodName: string;
  readonly service: typeof Plugins;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof plugins_pb.GetPluginsRequest;
  readonly responseType: typeof plugins_pb.GetPluginsResponse;
};

export class Plugins {
  static readonly serviceName: string;
  static readonly GetPlugins: PluginsGetPlugins;
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

export class PluginsClient {
  readonly serviceHost: string;

  constructor(serviceHost: string, options?: grpc.RpcOptions);
  getPlugins(
    requestMessage: plugins_pb.GetPluginsRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: plugins_pb.GetPluginsResponse|null) => void
  ): UnaryResponse;
  getPlugins(
    requestMessage: plugins_pb.GetPluginsRequest,
    callback: (error: ServiceError|null, responseMessage: plugins_pb.GetPluginsResponse|null) => void
  ): UnaryResponse;
}

