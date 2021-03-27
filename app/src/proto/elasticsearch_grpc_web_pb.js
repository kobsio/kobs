/**
 * @fileoverview gRPC-Web generated client stub for plugins.elasticsearch
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
proto.plugins.elasticsearch = require('./elasticsearch_pb.js');

/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?Object} options
 * @constructor
 * @struct
 * @final
 */
proto.plugins.elasticsearch.ElasticsearchClient =
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
proto.plugins.elasticsearch.ElasticsearchPromiseClient =
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
 *   !proto.plugins.elasticsearch.GetLogsRequest,
 *   !proto.plugins.elasticsearch.GetLogsResponse>}
 */
const methodDescriptor_Elasticsearch_GetLogs = new grpc.web.MethodDescriptor(
  '/plugins.elasticsearch.Elasticsearch/GetLogs',
  grpc.web.MethodType.UNARY,
  proto.plugins.elasticsearch.GetLogsRequest,
  proto.plugins.elasticsearch.GetLogsResponse,
  /**
   * @param {!proto.plugins.elasticsearch.GetLogsRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.plugins.elasticsearch.GetLogsResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.plugins.elasticsearch.GetLogsRequest,
 *   !proto.plugins.elasticsearch.GetLogsResponse>}
 */
const methodInfo_Elasticsearch_GetLogs = new grpc.web.AbstractClientBase.MethodInfo(
  proto.plugins.elasticsearch.GetLogsResponse,
  /**
   * @param {!proto.plugins.elasticsearch.GetLogsRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.plugins.elasticsearch.GetLogsResponse.deserializeBinary
);


/**
 * @param {!proto.plugins.elasticsearch.GetLogsRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.plugins.elasticsearch.GetLogsResponse)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.plugins.elasticsearch.GetLogsResponse>|undefined}
 *     The XHR Node Readable Stream
 */
proto.plugins.elasticsearch.ElasticsearchClient.prototype.getLogs =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/plugins.elasticsearch.Elasticsearch/GetLogs',
      request,
      metadata || {},
      methodDescriptor_Elasticsearch_GetLogs,
      callback);
};


/**
 * @param {!proto.plugins.elasticsearch.GetLogsRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.plugins.elasticsearch.GetLogsResponse>}
 *     Promise that resolves to the response
 */
proto.plugins.elasticsearch.ElasticsearchPromiseClient.prototype.getLogs =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/plugins.elasticsearch.Elasticsearch/GetLogs',
      request,
      metadata || {},
      methodDescriptor_Elasticsearch_GetLogs);
};


module.exports = proto.plugins.elasticsearch;

