// package: clusters
// file: clusters.proto

import * as clusters_pb from "./clusters_pb";
import {grpc} from "@improbable-eng/grpc-web";

type ClustersGetClusters = {
  readonly methodName: string;
  readonly service: typeof Clusters;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof clusters_pb.GetClustersRequest;
  readonly responseType: typeof clusters_pb.GetClustersResponse;
};

type ClustersGetNamespaces = {
  readonly methodName: string;
  readonly service: typeof Clusters;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof clusters_pb.GetNamespacesRequest;
  readonly responseType: typeof clusters_pb.GetNamespacesResponse;
};

type ClustersGetResources = {
  readonly methodName: string;
  readonly service: typeof Clusters;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof clusters_pb.GetResourcesRequest;
  readonly responseType: typeof clusters_pb.GetResourcesResponse;
};

type ClustersGetApplications = {
  readonly methodName: string;
  readonly service: typeof Clusters;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof clusters_pb.GetApplicationsRequest;
  readonly responseType: typeof clusters_pb.GetApplicationsResponse;
};

type ClustersGetApplication = {
  readonly methodName: string;
  readonly service: typeof Clusters;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof clusters_pb.GetApplicationRequest;
  readonly responseType: typeof clusters_pb.GetApplicationResponse;
};

export class Clusters {
  static readonly serviceName: string;
  static readonly GetClusters: ClustersGetClusters;
  static readonly GetNamespaces: ClustersGetNamespaces;
  static readonly GetResources: ClustersGetResources;
  static readonly GetApplications: ClustersGetApplications;
  static readonly GetApplication: ClustersGetApplication;
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

export class ClustersClient {
  readonly serviceHost: string;

  constructor(serviceHost: string, options?: grpc.RpcOptions);
  getClusters(
    requestMessage: clusters_pb.GetClustersRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: clusters_pb.GetClustersResponse|null) => void
  ): UnaryResponse;
  getClusters(
    requestMessage: clusters_pb.GetClustersRequest,
    callback: (error: ServiceError|null, responseMessage: clusters_pb.GetClustersResponse|null) => void
  ): UnaryResponse;
  getNamespaces(
    requestMessage: clusters_pb.GetNamespacesRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: clusters_pb.GetNamespacesResponse|null) => void
  ): UnaryResponse;
  getNamespaces(
    requestMessage: clusters_pb.GetNamespacesRequest,
    callback: (error: ServiceError|null, responseMessage: clusters_pb.GetNamespacesResponse|null) => void
  ): UnaryResponse;
  getResources(
    requestMessage: clusters_pb.GetResourcesRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: clusters_pb.GetResourcesResponse|null) => void
  ): UnaryResponse;
  getResources(
    requestMessage: clusters_pb.GetResourcesRequest,
    callback: (error: ServiceError|null, responseMessage: clusters_pb.GetResourcesResponse|null) => void
  ): UnaryResponse;
  getApplications(
    requestMessage: clusters_pb.GetApplicationsRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: clusters_pb.GetApplicationsResponse|null) => void
  ): UnaryResponse;
  getApplications(
    requestMessage: clusters_pb.GetApplicationsRequest,
    callback: (error: ServiceError|null, responseMessage: clusters_pb.GetApplicationsResponse|null) => void
  ): UnaryResponse;
  getApplication(
    requestMessage: clusters_pb.GetApplicationRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: clusters_pb.GetApplicationResponse|null) => void
  ): UnaryResponse;
  getApplication(
    requestMessage: clusters_pb.GetApplicationRequest,
    callback: (error: ServiceError|null, responseMessage: clusters_pb.GetApplicationResponse|null) => void
  ): UnaryResponse;
}

