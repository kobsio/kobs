/**
 * @fileoverview gRPC-Web generated client stub for plugins.prometheus
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
proto.plugins.prometheus = require('./prometheus_pb.js');

/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?Object} options
 * @constructor
 * @struct
 * @final
 */
proto.plugins.prometheus.PrometheusClient =
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
proto.plugins.prometheus.PrometheusPromiseClient =
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
 *   !proto.plugins.prometheus.GetVariablesRequest,
 *   !proto.plugins.prometheus.GetVariablesResponse>}
 */
const methodDescriptor_Prometheus_GetVariables = new grpc.web.MethodDescriptor(
  '/plugins.prometheus.Prometheus/GetVariables',
  grpc.web.MethodType.UNARY,
  proto.plugins.prometheus.GetVariablesRequest,
  proto.plugins.prometheus.GetVariablesResponse,
  /**
   * @param {!proto.plugins.prometheus.GetVariablesRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.plugins.prometheus.GetVariablesResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.plugins.prometheus.GetVariablesRequest,
 *   !proto.plugins.prometheus.GetVariablesResponse>}
 */
const methodInfo_Prometheus_GetVariables = new grpc.web.AbstractClientBase.MethodInfo(
  proto.plugins.prometheus.GetVariablesResponse,
  /**
   * @param {!proto.plugins.prometheus.GetVariablesRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.plugins.prometheus.GetVariablesResponse.deserializeBinary
);


/**
 * @param {!proto.plugins.prometheus.GetVariablesRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.plugins.prometheus.GetVariablesResponse)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.plugins.prometheus.GetVariablesResponse>|undefined}
 *     The XHR Node Readable Stream
 */
proto.plugins.prometheus.PrometheusClient.prototype.getVariables =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/plugins.prometheus.Prometheus/GetVariables',
      request,
      metadata || {},
      methodDescriptor_Prometheus_GetVariables,
      callback);
};


/**
 * @param {!proto.plugins.prometheus.GetVariablesRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.plugins.prometheus.GetVariablesResponse>}
 *     Promise that resolves to the response
 */
proto.plugins.prometheus.PrometheusPromiseClient.prototype.getVariables =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/plugins.prometheus.Prometheus/GetVariables',
      request,
      metadata || {},
      methodDescriptor_Prometheus_GetVariables);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.plugins.prometheus.GetMetricsRequest,
 *   !proto.plugins.prometheus.GetMetricsResponse>}
 */
const methodDescriptor_Prometheus_GetMetrics = new grpc.web.MethodDescriptor(
  '/plugins.prometheus.Prometheus/GetMetrics',
  grpc.web.MethodType.UNARY,
  proto.plugins.prometheus.GetMetricsRequest,
  proto.plugins.prometheus.GetMetricsResponse,
  /**
   * @param {!proto.plugins.prometheus.GetMetricsRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.plugins.prometheus.GetMetricsResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.plugins.prometheus.GetMetricsRequest,
 *   !proto.plugins.prometheus.GetMetricsResponse>}
 */
const methodInfo_Prometheus_GetMetrics = new grpc.web.AbstractClientBase.MethodInfo(
  proto.plugins.prometheus.GetMetricsResponse,
  /**
   * @param {!proto.plugins.prometheus.GetMetricsRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.plugins.prometheus.GetMetricsResponse.deserializeBinary
);


/**
 * @param {!proto.plugins.prometheus.GetMetricsRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.plugins.prometheus.GetMetricsResponse)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.plugins.prometheus.GetMetricsResponse>|undefined}
 *     The XHR Node Readable Stream
 */
proto.plugins.prometheus.PrometheusClient.prototype.getMetrics =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/plugins.prometheus.Prometheus/GetMetrics',
      request,
      metadata || {},
      methodDescriptor_Prometheus_GetMetrics,
      callback);
};


/**
 * @param {!proto.plugins.prometheus.GetMetricsRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.plugins.prometheus.GetMetricsResponse>}
 *     Promise that resolves to the response
 */
proto.plugins.prometheus.PrometheusPromiseClient.prototype.getMetrics =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/plugins.prometheus.Prometheus/GetMetrics',
      request,
      metadata || {},
      methodDescriptor_Prometheus_GetMetrics);
};


module.exports = proto.plugins.prometheus;

