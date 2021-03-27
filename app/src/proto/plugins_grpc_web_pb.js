/**
 * @fileoverview gRPC-Web generated client stub for plugins
 * @enhanceable
 * @public
 */

// GENERATED CODE -- DO NOT EDIT!


/* eslint-disable */
// @ts-nocheck



const grpc = {};
grpc.web = require('grpc-web');


var prometheus_pb = require('./prometheus_pb.js')

var elasticsearch_pb = require('./elasticsearch_pb.js')
const proto = {};
proto.plugins = require('./plugins_pb.js');

/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?Object} options
 * @constructor
 * @struct
 * @final
 */
proto.plugins.PluginsClient =
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
proto.plugins.PluginsPromiseClient =
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
 *   !proto.plugins.GetPluginsRequest,
 *   !proto.plugins.GetPluginsResponse>}
 */
const methodDescriptor_Plugins_GetPlugins = new grpc.web.MethodDescriptor(
  '/plugins.Plugins/GetPlugins',
  grpc.web.MethodType.UNARY,
  proto.plugins.GetPluginsRequest,
  proto.plugins.GetPluginsResponse,
  /**
   * @param {!proto.plugins.GetPluginsRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.plugins.GetPluginsResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.plugins.GetPluginsRequest,
 *   !proto.plugins.GetPluginsResponse>}
 */
const methodInfo_Plugins_GetPlugins = new grpc.web.AbstractClientBase.MethodInfo(
  proto.plugins.GetPluginsResponse,
  /**
   * @param {!proto.plugins.GetPluginsRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.plugins.GetPluginsResponse.deserializeBinary
);


/**
 * @param {!proto.plugins.GetPluginsRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.plugins.GetPluginsResponse)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.plugins.GetPluginsResponse>|undefined}
 *     The XHR Node Readable Stream
 */
proto.plugins.PluginsClient.prototype.getPlugins =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/plugins.Plugins/GetPlugins',
      request,
      metadata || {},
      methodDescriptor_Plugins_GetPlugins,
      callback);
};


/**
 * @param {!proto.plugins.GetPluginsRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.plugins.GetPluginsResponse>}
 *     Promise that resolves to the response
 */
proto.plugins.PluginsPromiseClient.prototype.getPlugins =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/plugins.Plugins/GetPlugins',
      request,
      metadata || {},
      methodDescriptor_Plugins_GetPlugins);
};


module.exports = proto.plugins;

