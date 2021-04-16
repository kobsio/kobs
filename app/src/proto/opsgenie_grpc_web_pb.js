/**
 * @fileoverview gRPC-Web generated client stub for plugins.opsgenie
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
proto.plugins.opsgenie = require('./opsgenie_pb.js');

/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?Object} options
 * @constructor
 * @struct
 * @final
 */
proto.plugins.opsgenie.OpsgenieClient =
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
proto.plugins.opsgenie.OpsgeniePromiseClient =
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
 *   !proto.plugins.opsgenie.GetAlertsRequest,
 *   !proto.plugins.opsgenie.GetAlertsResponse>}
 */
const methodDescriptor_Opsgenie_GetAlerts = new grpc.web.MethodDescriptor(
  '/plugins.opsgenie.Opsgenie/GetAlerts',
  grpc.web.MethodType.UNARY,
  proto.plugins.opsgenie.GetAlertsRequest,
  proto.plugins.opsgenie.GetAlertsResponse,
  /**
   * @param {!proto.plugins.opsgenie.GetAlertsRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.plugins.opsgenie.GetAlertsResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.plugins.opsgenie.GetAlertsRequest,
 *   !proto.plugins.opsgenie.GetAlertsResponse>}
 */
const methodInfo_Opsgenie_GetAlerts = new grpc.web.AbstractClientBase.MethodInfo(
  proto.plugins.opsgenie.GetAlertsResponse,
  /**
   * @param {!proto.plugins.opsgenie.GetAlertsRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.plugins.opsgenie.GetAlertsResponse.deserializeBinary
);


/**
 * @param {!proto.plugins.opsgenie.GetAlertsRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.plugins.opsgenie.GetAlertsResponse)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.plugins.opsgenie.GetAlertsResponse>|undefined}
 *     The XHR Node Readable Stream
 */
proto.plugins.opsgenie.OpsgenieClient.prototype.getAlerts =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/plugins.opsgenie.Opsgenie/GetAlerts',
      request,
      metadata || {},
      methodDescriptor_Opsgenie_GetAlerts,
      callback);
};


/**
 * @param {!proto.plugins.opsgenie.GetAlertsRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.plugins.opsgenie.GetAlertsResponse>}
 *     Promise that resolves to the response
 */
proto.plugins.opsgenie.OpsgeniePromiseClient.prototype.getAlerts =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/plugins.opsgenie.Opsgenie/GetAlerts',
      request,
      metadata || {},
      methodDescriptor_Opsgenie_GetAlerts);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.plugins.opsgenie.GetAlertRequest,
 *   !proto.plugins.opsgenie.GetAlertResponse>}
 */
const methodDescriptor_Opsgenie_GetAlert = new grpc.web.MethodDescriptor(
  '/plugins.opsgenie.Opsgenie/GetAlert',
  grpc.web.MethodType.UNARY,
  proto.plugins.opsgenie.GetAlertRequest,
  proto.plugins.opsgenie.GetAlertResponse,
  /**
   * @param {!proto.plugins.opsgenie.GetAlertRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.plugins.opsgenie.GetAlertResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.plugins.opsgenie.GetAlertRequest,
 *   !proto.plugins.opsgenie.GetAlertResponse>}
 */
const methodInfo_Opsgenie_GetAlert = new grpc.web.AbstractClientBase.MethodInfo(
  proto.plugins.opsgenie.GetAlertResponse,
  /**
   * @param {!proto.plugins.opsgenie.GetAlertRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.plugins.opsgenie.GetAlertResponse.deserializeBinary
);


/**
 * @param {!proto.plugins.opsgenie.GetAlertRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.plugins.opsgenie.GetAlertResponse)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.plugins.opsgenie.GetAlertResponse>|undefined}
 *     The XHR Node Readable Stream
 */
proto.plugins.opsgenie.OpsgenieClient.prototype.getAlert =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/plugins.opsgenie.Opsgenie/GetAlert',
      request,
      metadata || {},
      methodDescriptor_Opsgenie_GetAlert,
      callback);
};


/**
 * @param {!proto.plugins.opsgenie.GetAlertRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.plugins.opsgenie.GetAlertResponse>}
 *     Promise that resolves to the response
 */
proto.plugins.opsgenie.OpsgeniePromiseClient.prototype.getAlert =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/plugins.opsgenie.Opsgenie/GetAlert',
      request,
      metadata || {},
      methodDescriptor_Opsgenie_GetAlert);
};


module.exports = proto.plugins.opsgenie;

