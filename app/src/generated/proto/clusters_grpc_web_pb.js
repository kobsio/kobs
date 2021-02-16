/**
 * @fileoverview gRPC-Web generated client stub for clusters
 * @enhanceable
 * @public
 */

// GENERATED CODE -- DO NOT EDIT!


/* eslint-disable */
// @ts-nocheck



const grpc = {};
grpc.web = require('grpc-web');

const proto = {};
proto.clusters = require('./clusters_pb.js');

/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?Object} options
 * @constructor
 * @struct
 * @final
 */
proto.clusters.ClustersClient =
    function(hostname, credentials, options) {
  if (!options) options = {};
  options['format'] = 'text';

  /**
   * @private @const {!grpc.web.GrpcWebClientBase} The client
   */
  this.client_ = new grpc.web.GrpcWebClientBase(options);

  /**
   * @private @const {string} The hostname
   */
  this.hostname_ = hostname;

};


/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?Object} options
 * @constructor
 * @struct
 * @final
 */
proto.clusters.ClustersPromiseClient =
    function(hostname, credentials, options) {
  if (!options) options = {};
  options['format'] = 'text';

  /**
   * @private @const {!grpc.web.GrpcWebClientBase} The client
   */
  this.client_ = new grpc.web.GrpcWebClientBase(options);

  /**
   * @private @const {string} The hostname
   */
  this.hostname_ = hostname;

};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.clusters.GetClustersRequest,
 *   !proto.clusters.GetClustersResponse>}
 */
const methodDescriptor_Clusters_GetClusters = new grpc.web.MethodDescriptor(
  '/clusters.Clusters/GetClusters',
  grpc.web.MethodType.UNARY,
  proto.clusters.GetClustersRequest,
  proto.clusters.GetClustersResponse,
  /**
   * @param {!proto.clusters.GetClustersRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.clusters.GetClustersResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.clusters.GetClustersRequest,
 *   !proto.clusters.GetClustersResponse>}
 */
const methodInfo_Clusters_GetClusters = new grpc.web.AbstractClientBase.MethodInfo(
  proto.clusters.GetClustersResponse,
  /**
   * @param {!proto.clusters.GetClustersRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.clusters.GetClustersResponse.deserializeBinary
);


/**
 * @param {!proto.clusters.GetClustersRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.clusters.GetClustersResponse)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.clusters.GetClustersResponse>|undefined}
 *     The XHR Node Readable Stream
 */
proto.clusters.ClustersClient.prototype.getClusters =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/clusters.Clusters/GetClusters',
      request,
      metadata || {},
      methodDescriptor_Clusters_GetClusters,
      callback);
};


/**
 * @param {!proto.clusters.GetClustersRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.clusters.GetClustersResponse>}
 *     Promise that resolves to the response
 */
proto.clusters.ClustersPromiseClient.prototype.getClusters =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/clusters.Clusters/GetClusters',
      request,
      metadata || {},
      methodDescriptor_Clusters_GetClusters);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.clusters.GetNamespacesRequest,
 *   !proto.clusters.GetNamespacesResponse>}
 */
const methodDescriptor_Clusters_GetNamespaces = new grpc.web.MethodDescriptor(
  '/clusters.Clusters/GetNamespaces',
  grpc.web.MethodType.UNARY,
  proto.clusters.GetNamespacesRequest,
  proto.clusters.GetNamespacesResponse,
  /**
   * @param {!proto.clusters.GetNamespacesRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.clusters.GetNamespacesResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.clusters.GetNamespacesRequest,
 *   !proto.clusters.GetNamespacesResponse>}
 */
const methodInfo_Clusters_GetNamespaces = new grpc.web.AbstractClientBase.MethodInfo(
  proto.clusters.GetNamespacesResponse,
  /**
   * @param {!proto.clusters.GetNamespacesRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.clusters.GetNamespacesResponse.deserializeBinary
);


/**
 * @param {!proto.clusters.GetNamespacesRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.clusters.GetNamespacesResponse)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.clusters.GetNamespacesResponse>|undefined}
 *     The XHR Node Readable Stream
 */
proto.clusters.ClustersClient.prototype.getNamespaces =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/clusters.Clusters/GetNamespaces',
      request,
      metadata || {},
      methodDescriptor_Clusters_GetNamespaces,
      callback);
};


/**
 * @param {!proto.clusters.GetNamespacesRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.clusters.GetNamespacesResponse>}
 *     Promise that resolves to the response
 */
proto.clusters.ClustersPromiseClient.prototype.getNamespaces =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/clusters.Clusters/GetNamespaces',
      request,
      metadata || {},
      methodDescriptor_Clusters_GetNamespaces);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.clusters.GetResourcesRequest,
 *   !proto.clusters.GetResourcesResponse>}
 */
const methodDescriptor_Clusters_GetResources = new grpc.web.MethodDescriptor(
  '/clusters.Clusters/GetResources',
  grpc.web.MethodType.UNARY,
  proto.clusters.GetResourcesRequest,
  proto.clusters.GetResourcesResponse,
  /**
   * @param {!proto.clusters.GetResourcesRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.clusters.GetResourcesResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.clusters.GetResourcesRequest,
 *   !proto.clusters.GetResourcesResponse>}
 */
const methodInfo_Clusters_GetResources = new grpc.web.AbstractClientBase.MethodInfo(
  proto.clusters.GetResourcesResponse,
  /**
   * @param {!proto.clusters.GetResourcesRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.clusters.GetResourcesResponse.deserializeBinary
);


/**
 * @param {!proto.clusters.GetResourcesRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.clusters.GetResourcesResponse)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.clusters.GetResourcesResponse>|undefined}
 *     The XHR Node Readable Stream
 */
proto.clusters.ClustersClient.prototype.getResources =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/clusters.Clusters/GetResources',
      request,
      metadata || {},
      methodDescriptor_Clusters_GetResources,
      callback);
};


/**
 * @param {!proto.clusters.GetResourcesRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.clusters.GetResourcesResponse>}
 *     Promise that resolves to the response
 */
proto.clusters.ClustersPromiseClient.prototype.getResources =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/clusters.Clusters/GetResources',
      request,
      metadata || {},
      methodDescriptor_Clusters_GetResources);
};


module.exports = proto.clusters;

