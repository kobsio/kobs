// package: plugins.elasticsearch
// file: elasticsearch.proto

import * as elasticsearch_pb from "./elasticsearch_pb";
import {grpc} from "@improbable-eng/grpc-web";

type ElasticsearchGetLogs = {
  readonly methodName: string;
  readonly service: typeof Elasticsearch;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof elasticsearch_pb.GetLogsRequest;
  readonly responseType: typeof elasticsearch_pb.GetLogsResponse;
};

export class Elasticsearch {
  static readonly serviceName: string;
  static readonly GetLogs: ElasticsearchGetLogs;
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

export class ElasticsearchClient {
  readonly serviceHost: string;

  constructor(serviceHost: string, options?: grpc.RpcOptions);
  getLogs(
    requestMessage: elasticsearch_pb.GetLogsRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: elasticsearch_pb.GetLogsResponse|null) => void
  ): UnaryResponse;
  getLogs(
    requestMessage: elasticsearch_pb.GetLogsRequest,
    callback: (error: ServiceError|null, responseMessage: elasticsearch_pb.GetLogsResponse|null) => void
  ): UnaryResponse;
}

