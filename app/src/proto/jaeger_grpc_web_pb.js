/**
 * @fileoverview gRPC-Web generated client stub for plugins.jaeger
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
proto.plugins.jaeger = require('./jaeger_pb.js');

/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?Object} options
 * @constructor
 * @struct
 * @final
 */
proto.plugins.jaeger.JaegerClient =
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
proto.plugins.jaeger.JaegerPromiseClient =
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
 *   !proto.plugins.jaeger.GetServicesRequest,
 *   !proto.plugins.jaeger.GetServicesResponse>}
 */
const methodDescriptor_Jaeger_GetServices = new grpc.web.MethodDescriptor(
  '/plugins.jaeger.Jaeger/GetServices',
  grpc.web.MethodType.UNARY,
  proto.plugins.jaeger.GetServicesRequest,
  proto.plugins.jaeger.GetServicesResponse,
  /**
   * @param {!proto.plugins.jaeger.GetServicesRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.plugins.jaeger.GetServicesResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.plugins.jaeger.GetServicesRequest,
 *   !proto.plugins.jaeger.GetServicesResponse>}
 */
const methodInfo_Jaeger_GetServices = new grpc.web.AbstractClientBase.MethodInfo(
  proto.plugins.jaeger.GetServicesResponse,
  /**
   * @param {!proto.plugins.jaeger.GetServicesRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.plugins.jaeger.GetServicesResponse.deserializeBinary
);


/**
 * @param {!proto.plugins.jaeger.GetServicesRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.plugins.jaeger.GetServicesResponse)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.plugins.jaeger.GetServicesResponse>|undefined}
 *     The XHR Node Readable Stream
 */
proto.plugins.jaeger.JaegerClient.prototype.getServices =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/plugins.jaeger.Jaeger/GetServices',
      request,
      metadata || {},
      methodDescriptor_Jaeger_GetServices,
      callback);
};


/**
 * @param {!proto.plugins.jaeger.GetServicesRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.plugins.jaeger.GetServicesResponse>}
 *     Promise that resolves to the response
 */
proto.plugins.jaeger.JaegerPromiseClient.prototype.getServices =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/plugins.jaeger.Jaeger/GetServices',
      request,
      metadata || {},
      methodDescriptor_Jaeger_GetServices);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.plugins.jaeger.GetOperationsRequest,
 *   !proto.plugins.jaeger.GetOperationsResponse>}
 */
const methodDescriptor_Jaeger_GetOperations = new grpc.web.MethodDescriptor(
  '/plugins.jaeger.Jaeger/GetOperations',
  grpc.web.MethodType.UNARY,
  proto.plugins.jaeger.GetOperationsRequest,
  proto.plugins.jaeger.GetOperationsResponse,
  /**
   * @param {!proto.plugins.jaeger.GetOperationsRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.plugins.jaeger.GetOperationsResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.plugins.jaeger.GetOperationsRequest,
 *   !proto.plugins.jaeger.GetOperationsResponse>}
 */
const methodInfo_Jaeger_GetOperations = new grpc.web.AbstractClientBase.MethodInfo(
  proto.plugins.jaeger.GetOperationsResponse,
  /**
   * @param {!proto.plugins.jaeger.GetOperationsRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.plugins.jaeger.GetOperationsResponse.deserializeBinary
);


/**
 * @param {!proto.plugins.jaeger.GetOperationsRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.plugins.jaeger.GetOperationsResponse)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.plugins.jaeger.GetOperationsResponse>|undefined}
 *     The XHR Node Readable Stream
 */
proto.plugins.jaeger.JaegerClient.prototype.getOperations =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/plugins.jaeger.Jaeger/GetOperations',
      request,
      metadata || {},
      methodDescriptor_Jaeger_GetOperations,
      callback);
};


/**
 * @param {!proto.plugins.jaeger.GetOperationsRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.plugins.jaeger.GetOperationsResponse>}
 *     Promise that resolves to the response
 */
proto.plugins.jaeger.JaegerPromiseClient.prototype.getOperations =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/plugins.jaeger.Jaeger/GetOperations',
      request,
      metadata || {},
      methodDescriptor_Jaeger_GetOperations);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.plugins.jaeger.GetTracesRequest,
 *   !proto.plugins.jaeger.GetTracesResponse>}
 */
const methodDescriptor_Jaeger_GetTraces = new grpc.web.MethodDescriptor(
  '/plugins.jaeger.Jaeger/GetTraces',
  grpc.web.MethodType.UNARY,
  proto.plugins.jaeger.GetTracesRequest,
  proto.plugins.jaeger.GetTracesResponse,
  /**
   * @param {!proto.plugins.jaeger.GetTracesRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.plugins.jaeger.GetTracesResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.plugins.jaeger.GetTracesRequest,
 *   !proto.plugins.jaeger.GetTracesResponse>}
 */
const methodInfo_Jaeger_GetTraces = new grpc.web.AbstractClientBase.MethodInfo(
  proto.plugins.jaeger.GetTracesResponse,
  /**
   * @param {!proto.plugins.jaeger.GetTracesRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.plugins.jaeger.GetTracesResponse.deserializeBinary
);


/**
 * @param {!proto.plugins.jaeger.GetTracesRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.plugins.jaeger.GetTracesResponse)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.plugins.jaeger.GetTracesResponse>|undefined}
 *     The XHR Node Readable Stream
 */
proto.plugins.jaeger.JaegerClient.prototype.getTraces =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/plugins.jaeger.Jaeger/GetTraces',
      request,
      metadata || {},
      methodDescriptor_Jaeger_GetTraces,
      callback);
};


/**
 * @param {!proto.plugins.jaeger.GetTracesRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.plugins.jaeger.GetTracesResponse>}
 *     Promise that resolves to the response
 */
proto.plugins.jaeger.JaegerPromiseClient.prototype.getTraces =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/plugins.jaeger.Jaeger/GetTraces',
      request,
      metadata || {},
      methodDescriptor_Jaeger_GetTraces);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.plugins.jaeger.GetTraceRequest,
 *   !proto.plugins.jaeger.GetTraceResponse>}
 */
const methodDescriptor_Jaeger_GetTrace = new grpc.web.MethodDescriptor(
  '/plugins.jaeger.Jaeger/GetTrace',
  grpc.web.MethodType.UNARY,
  proto.plugins.jaeger.GetTraceRequest,
  proto.plugins.jaeger.GetTraceResponse,
  /**
   * @param {!proto.plugins.jaeger.GetTraceRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.plugins.jaeger.GetTraceResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.plugins.jaeger.GetTraceRequest,
 *   !proto.plugins.jaeger.GetTraceResponse>}
 */
const methodInfo_Jaeger_GetTrace = new grpc.web.AbstractClientBase.MethodInfo(
  proto.plugins.jaeger.GetTraceResponse,
  /**
   * @param {!proto.plugins.jaeger.GetTraceRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.plugins.jaeger.GetTraceResponse.deserializeBinary
);


/**
 * @param {!proto.plugins.jaeger.GetTraceRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.plugins.jaeger.GetTraceResponse)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.plugins.jaeger.GetTraceResponse>|undefined}
 *     The XHR Node Readable Stream
 */
proto.plugins.jaeger.JaegerClient.prototype.getTrace =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/plugins.jaeger.Jaeger/GetTrace',
      request,
      metadata || {},
      methodDescriptor_Jaeger_GetTrace,
      callback);
};


/**
 * @param {!proto.plugins.jaeger.GetTraceRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.plugins.jaeger.GetTraceResponse>}
 *     Promise that resolves to the response
 */
proto.plugins.jaeger.JaegerPromiseClient.prototype.getTrace =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/plugins.jaeger.Jaeger/GetTrace',
      request,
      metadata || {},
      methodDescriptor_Jaeger_GetTrace);
};


module.exports = proto.plugins.jaeger;

