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

type ClustersGetCRDs = {
  readonly methodName: string;
  readonly service: typeof Clusters;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof clusters_pb.GetCRDsRequest;
  readonly responseType: typeof clusters_pb.GetCRDsResponse;
};

type ClustersGetResources = {
  readonly methodName: string;
  readonly service: typeof Clusters;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof clusters_pb.GetResourcesRequest;
  readonly responseType: typeof clusters_pb.GetResourcesResponse;
};

type ClustersGetLogs = {
  readonly methodName: string;
  readonly service: typeof Clusters;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof clusters_pb.GetLogsRequest;
  readonly responseType: typeof clusters_pb.GetLogsResponse;
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

type ClustersGetApplicationsTopology = {
  readonly methodName: string;
  readonly service: typeof Clusters;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof clusters_pb.GetApplicationsTopologyRequest;
  readonly responseType: typeof clusters_pb.GetApplicationsTopologyResponse;
};

type ClustersGetTeams = {
  readonly methodName: string;
  readonly service: typeof Clusters;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof clusters_pb.GetTeamsRequest;
  readonly responseType: typeof clusters_pb.GetTeamsResponse;
};

type ClustersGetTeam = {
  readonly methodName: string;
  readonly service: typeof Clusters;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof clusters_pb.GetTeamRequest;
  readonly responseType: typeof clusters_pb.GetTeamResponse;
};

type ClustersGetTemplates = {
  readonly methodName: string;
  readonly service: typeof Clusters;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof clusters_pb.GetTemplatesRequest;
  readonly responseType: typeof clusters_pb.GetTemplatesResponse;
};

export class Clusters {
  static readonly serviceName: string;
  static readonly GetClusters: ClustersGetClusters;
  static readonly GetNamespaces: ClustersGetNamespaces;
  static readonly GetCRDs: ClustersGetCRDs;
  static readonly GetResources: ClustersGetResources;
  static readonly GetLogs: ClustersGetLogs;
  static readonly GetApplications: ClustersGetApplications;
  static readonly GetApplication: ClustersGetApplication;
  static readonly GetApplicationsTopology: ClustersGetApplicationsTopology;
  static readonly GetTeams: ClustersGetTeams;
  static readonly GetTeam: ClustersGetTeam;
  static readonly GetTemplates: ClustersGetTemplates;
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
  getCRDs(
    requestMessage: clusters_pb.GetCRDsRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: clusters_pb.GetCRDsResponse|null) => void
  ): UnaryResponse;
  getCRDs(
    requestMessage: clusters_pb.GetCRDsRequest,
    callback: (error: ServiceError|null, responseMessage: clusters_pb.GetCRDsResponse|null) => void
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
  getLogs(
    requestMessage: clusters_pb.GetLogsRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: clusters_pb.GetLogsResponse|null) => void
  ): UnaryResponse;
  getLogs(
    requestMessage: clusters_pb.GetLogsRequest,
    callback: (error: ServiceError|null, responseMessage: clusters_pb.GetLogsResponse|null) => void
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
  getApplicationsTopology(
    requestMessage: clusters_pb.GetApplicationsTopologyRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: clusters_pb.GetApplicationsTopologyResponse|null) => void
  ): UnaryResponse;
  getApplicationsTopology(
    requestMessage: clusters_pb.GetApplicationsTopologyRequest,
    callback: (error: ServiceError|null, responseMessage: clusters_pb.GetApplicationsTopologyResponse|null) => void
  ): UnaryResponse;
  getTeams(
    requestMessage: clusters_pb.GetTeamsRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: clusters_pb.GetTeamsResponse|null) => void
  ): UnaryResponse;
  getTeams(
    requestMessage: clusters_pb.GetTeamsRequest,
    callback: (error: ServiceError|null, responseMessage: clusters_pb.GetTeamsResponse|null) => void
  ): UnaryResponse;
  getTeam(
    requestMessage: clusters_pb.GetTeamRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: clusters_pb.GetTeamResponse|null) => void
  ): UnaryResponse;
  getTeam(
    requestMessage: clusters_pb.GetTeamRequest,
    callback: (error: ServiceError|null, responseMessage: clusters_pb.GetTeamResponse|null) => void
  ): UnaryResponse;
  getTemplates(
    requestMessage: clusters_pb.GetTemplatesRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: clusters_pb.GetTemplatesResponse|null) => void
  ): UnaryResponse;
  getTemplates(
    requestMessage: clusters_pb.GetTemplatesRequest,
    callback: (error: ServiceError|null, responseMessage: clusters_pb.GetTemplatesResponse|null) => void
  ): UnaryResponse;
}

