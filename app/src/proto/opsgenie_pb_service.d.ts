// package: plugins.opsgenie
// file: opsgenie.proto

import * as opsgenie_pb from "./opsgenie_pb";
import {grpc} from "@improbable-eng/grpc-web";

type OpsgenieGetAlerts = {
  readonly methodName: string;
  readonly service: typeof Opsgenie;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof opsgenie_pb.GetAlertsRequest;
  readonly responseType: typeof opsgenie_pb.GetAlertsResponse;
};

type OpsgenieGetAlert = {
  readonly methodName: string;
  readonly service: typeof Opsgenie;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof opsgenie_pb.GetAlertRequest;
  readonly responseType: typeof opsgenie_pb.GetAlertResponse;
};

export class Opsgenie {
  static readonly serviceName: string;
  static readonly GetAlerts: OpsgenieGetAlerts;
  static readonly GetAlert: OpsgenieGetAlert;
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

export class OpsgenieClient {
  readonly serviceHost: string;

  constructor(serviceHost: string, options?: grpc.RpcOptions);
  getAlerts(
    requestMessage: opsgenie_pb.GetAlertsRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: opsgenie_pb.GetAlertsResponse|null) => void
  ): UnaryResponse;
  getAlerts(
    requestMessage: opsgenie_pb.GetAlertsRequest,
    callback: (error: ServiceError|null, responseMessage: opsgenie_pb.GetAlertsResponse|null) => void
  ): UnaryResponse;
  getAlert(
    requestMessage: opsgenie_pb.GetAlertRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: opsgenie_pb.GetAlertResponse|null) => void
  ): UnaryResponse;
  getAlert(
    requestMessage: opsgenie_pb.GetAlertRequest,
    callback: (error: ServiceError|null, responseMessage: opsgenie_pb.GetAlertResponse|null) => void
  ): UnaryResponse;
}

