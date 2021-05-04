/**
 * @fileoverview gRPC-Web generated client stub for plugins.kiali
 * @enhanceable
 * @public
 */

// GENERATED CODE -- DO NOT EDIT!


/* eslint-disable */
// @ts-nocheck



const grpc = {};
grpc.web = require('grpc-web');

const proto = {};
proto.plugins = {};
proto.plugins.kiali = require('./kiali_pb.js');

/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?Object} options
 * @constructor
 * @struct
 * @final
 */
proto.plugins.kiali.KialiClient =
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
proto.plugins.kiali.KialiPromiseClient =
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
 *   !proto.plugins.kiali.GetNamespacesRequest,
 *   !proto.plugins.kiali.GetNamespacesResponse>}
 */
const methodDescriptor_Kiali_GetNamespaces = new grpc.web.MethodDescriptor(
  '/plugins.kiali.Kiali/GetNamespaces',
  grpc.web.MethodType.UNARY,
  proto.plugins.kiali.GetNamespacesRequest,
  proto.plugins.kiali.GetNamespacesResponse,
  /**
   * @param {!proto.plugins.kiali.GetNamespacesRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.plugins.kiali.GetNamespacesResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.plugins.kiali.GetNamespacesRequest,
 *   !proto.plugins.kiali.GetNamespacesResponse>}
 */
const methodInfo_Kiali_GetNamespaces = new grpc.web.AbstractClientBase.MethodInfo(
  proto.plugins.kiali.GetNamespacesResponse,
  /**
   * @param {!proto.plugins.kiali.GetNamespacesRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.plugins.kiali.GetNamespacesResponse.deserializeBinary
);


/**
 * @param {!proto.plugins.kiali.GetNamespacesRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.plugins.kiali.GetNamespacesResponse)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.plugins.kiali.GetNamespacesResponse>|undefined}
 *     The XHR Node Readable Stream
 */
proto.plugins.kiali.KialiClient.prototype.getNamespaces =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/plugins.kiali.Kiali/GetNamespaces',
      request,
      metadata || {},
      methodDescriptor_Kiali_GetNamespaces,
      callback);
};


/**
 * @param {!proto.plugins.kiali.GetNamespacesRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.plugins.kiali.GetNamespacesResponse>}
 *     Promise that resolves to the response
 */
proto.plugins.kiali.KialiPromiseClient.prototype.getNamespaces =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/plugins.kiali.Kiali/GetNamespaces',
      request,
      metadata || {},
      methodDescriptor_Kiali_GetNamespaces);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.plugins.kiali.GetGraphRequest,
 *   !proto.plugins.kiali.GetGraphResponse>}
 */
const methodDescriptor_Kiali_GetGraph = new grpc.web.MethodDescriptor(
  '/plugins.kiali.Kiali/GetGraph',
  grpc.web.MethodType.UNARY,
  proto.plugins.kiali.GetGraphRequest,
  proto.plugins.kiali.GetGraphResponse,
  /**
   * @param {!proto.plugins.kiali.GetGraphRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.plugins.kiali.GetGraphResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.plugins.kiali.GetGraphRequest,
 *   !proto.plugins.kiali.GetGraphResponse>}
 */
const methodInfo_Kiali_GetGraph = new grpc.web.AbstractClientBase.MethodInfo(
  proto.plugins.kiali.GetGraphResponse,
  /**
   * @param {!proto.plugins.kiali.GetGraphRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.plugins.kiali.GetGraphResponse.deserializeBinary
);


/**
 * @param {!proto.plugins.kiali.GetGraphRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.plugins.kiali.GetGraphResponse)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.plugins.kiali.GetGraphResponse>|undefined}
 *     The XHR Node Readable Stream
 */
proto.plugins.kiali.KialiClient.prototype.getGraph =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/plugins.kiali.Kiali/GetGraph',
      request,
      metadata || {},
      methodDescriptor_Kiali_GetGraph,
      callback);
};


/**
 * @param {!proto.plugins.kiali.GetGraphRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.plugins.kiali.GetGraphResponse>}
 *     Promise that resolves to the response
 */
proto.plugins.kiali.KialiPromiseClient.prototype.getGraph =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/plugins.kiali.Kiali/GetGraph',
      request,
      metadata || {},
      methodDescriptor_Kiali_GetGraph);
};


module.exports = proto.plugins.kiali;

