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
proto.clusters = require('./applications_pb.js');

/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?Object} options
 * @constructor
 * @struct
 * @final
 */
proto.clusters.ApplicationsClient =
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
proto.clusters.ApplicationsPromiseClient =
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
 *   !proto.clusters.GetApplicationsRequest,
 *   !proto.clusters.GetApplicationsResponse>}
 */
const methodDescriptor_Applications_GetApplications = new grpc.web.MethodDescriptor(
  '/clusters.Applications/GetApplications',
  grpc.web.MethodType.UNARY,
  proto.clusters.GetApplicationsRequest,
  proto.clusters.GetApplicationsResponse,
  /**
   * @param {!proto.clusters.GetApplicationsRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.clusters.GetApplicationsResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.clusters.GetApplicationsRequest,
 *   !proto.clusters.GetApplicationsResponse>}
 */
const methodInfo_Applications_GetApplications = new grpc.web.AbstractClientBase.MethodInfo(
  proto.clusters.GetApplicationsResponse,
  /**
   * @param {!proto.clusters.GetApplicationsRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.clusters.GetApplicationsResponse.deserializeBinary
);


/**
 * @param {!proto.clusters.GetApplicationsRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.clusters.GetApplicationsResponse)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.clusters.GetApplicationsResponse>|undefined}
 *     The XHR Node Readable Stream
 */
proto.clusters.ApplicationsClient.prototype.getApplications =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/clusters.Applications/GetApplications',
      request,
      metadata || {},
      methodDescriptor_Applications_GetApplications,
      callback);
};


/**
 * @param {!proto.clusters.GetApplicationsRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.clusters.GetApplicationsResponse>}
 *     Promise that resolves to the response
 */
proto.clusters.ApplicationsPromiseClient.prototype.getApplications =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/clusters.Applications/GetApplications',
      request,
      metadata || {},
      methodDescriptor_Applications_GetApplications);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.clusters.GetApplicationRequest,
 *   !proto.clusters.GetApplicationResponse>}
 */
const methodDescriptor_Applications_GetApplication = new grpc.web.MethodDescriptor(
  '/clusters.Applications/GetApplication',
  grpc.web.MethodType.UNARY,
  proto.clusters.GetApplicationRequest,
  proto.clusters.GetApplicationResponse,
  /**
   * @param {!proto.clusters.GetApplicationRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.clusters.GetApplicationResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.clusters.GetApplicationRequest,
 *   !proto.clusters.GetApplicationResponse>}
 */
const methodInfo_Applications_GetApplication = new grpc.web.AbstractClientBase.MethodInfo(
  proto.clusters.GetApplicationResponse,
  /**
   * @param {!proto.clusters.GetApplicationRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.clusters.GetApplicationResponse.deserializeBinary
);


/**
 * @param {!proto.clusters.GetApplicationRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.clusters.GetApplicationResponse)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.clusters.GetApplicationResponse>|undefined}
 *     The XHR Node Readable Stream
 */
proto.clusters.ApplicationsClient.prototype.getApplication =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/clusters.Applications/GetApplication',
      request,
      metadata || {},
      methodDescriptor_Applications_GetApplication,
      callback);
};


/**
 * @param {!proto.clusters.GetApplicationRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.clusters.GetApplicationResponse>}
 *     Promise that resolves to the response
 */
proto.clusters.ApplicationsPromiseClient.prototype.getApplication =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/clusters.Applications/GetApplication',
      request,
      metadata || {},
      methodDescriptor_Applications_GetApplication);
};


module.exports = proto.clusters;

