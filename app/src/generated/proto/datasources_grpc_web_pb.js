/**
 * @fileoverview gRPC-Web generated client stub for datasources
 * @enhanceable
 * @public
 */

// GENERATED CODE -- DO NOT EDIT!


/* eslint-disable */
// @ts-nocheck



const grpc = {};
grpc.web = require('grpc-web');


var application_pb = require('./application_pb.js')
const proto = {};
proto.datasources = require('./datasources_pb.js');

/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?Object} options
 * @constructor
 * @struct
 * @final
 */
proto.datasources.DatasourcesClient =
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
proto.datasources.DatasourcesPromiseClient =
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
 *   !proto.datasources.GetDatasourceRequest,
 *   !proto.datasources.GetDatasourceResponse>}
 */
const methodDescriptor_Datasources_GetDatasource = new grpc.web.MethodDescriptor(
  '/datasources.Datasources/GetDatasource',
  grpc.web.MethodType.UNARY,
  proto.datasources.GetDatasourceRequest,
  proto.datasources.GetDatasourceResponse,
  /**
   * @param {!proto.datasources.GetDatasourceRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.datasources.GetDatasourceResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.datasources.GetDatasourceRequest,
 *   !proto.datasources.GetDatasourceResponse>}
 */
const methodInfo_Datasources_GetDatasource = new grpc.web.AbstractClientBase.MethodInfo(
  proto.datasources.GetDatasourceResponse,
  /**
   * @param {!proto.datasources.GetDatasourceRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.datasources.GetDatasourceResponse.deserializeBinary
);


/**
 * @param {!proto.datasources.GetDatasourceRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.datasources.GetDatasourceResponse)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.datasources.GetDatasourceResponse>|undefined}
 *     The XHR Node Readable Stream
 */
proto.datasources.DatasourcesClient.prototype.getDatasource =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/datasources.Datasources/GetDatasource',
      request,
      metadata || {},
      methodDescriptor_Datasources_GetDatasource,
      callback);
};


/**
 * @param {!proto.datasources.GetDatasourceRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.datasources.GetDatasourceResponse>}
 *     Promise that resolves to the response
 */
proto.datasources.DatasourcesPromiseClient.prototype.getDatasource =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/datasources.Datasources/GetDatasource',
      request,
      metadata || {},
      methodDescriptor_Datasources_GetDatasource);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.datasources.GetVariablesRequest,
 *   !proto.datasources.GetVariablesResponse>}
 */
const methodDescriptor_Datasources_GetVariables = new grpc.web.MethodDescriptor(
  '/datasources.Datasources/GetVariables',
  grpc.web.MethodType.UNARY,
  proto.datasources.GetVariablesRequest,
  proto.datasources.GetVariablesResponse,
  /**
   * @param {!proto.datasources.GetVariablesRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.datasources.GetVariablesResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.datasources.GetVariablesRequest,
 *   !proto.datasources.GetVariablesResponse>}
 */
const methodInfo_Datasources_GetVariables = new grpc.web.AbstractClientBase.MethodInfo(
  proto.datasources.GetVariablesResponse,
  /**
   * @param {!proto.datasources.GetVariablesRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.datasources.GetVariablesResponse.deserializeBinary
);


/**
 * @param {!proto.datasources.GetVariablesRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.datasources.GetVariablesResponse)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.datasources.GetVariablesResponse>|undefined}
 *     The XHR Node Readable Stream
 */
proto.datasources.DatasourcesClient.prototype.getVariables =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/datasources.Datasources/GetVariables',
      request,
      metadata || {},
      methodDescriptor_Datasources_GetVariables,
      callback);
};


/**
 * @param {!proto.datasources.GetVariablesRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.datasources.GetVariablesResponse>}
 *     Promise that resolves to the response
 */
proto.datasources.DatasourcesPromiseClient.prototype.getVariables =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/datasources.Datasources/GetVariables',
      request,
      metadata || {},
      methodDescriptor_Datasources_GetVariables);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.datasources.GetMetricsRequest,
 *   !proto.datasources.GetMetricsResponse>}
 */
const methodDescriptor_Datasources_GetMetrics = new grpc.web.MethodDescriptor(
  '/datasources.Datasources/GetMetrics',
  grpc.web.MethodType.UNARY,
  proto.datasources.GetMetricsRequest,
  proto.datasources.GetMetricsResponse,
  /**
   * @param {!proto.datasources.GetMetricsRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.datasources.GetMetricsResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.datasources.GetMetricsRequest,
 *   !proto.datasources.GetMetricsResponse>}
 */
const methodInfo_Datasources_GetMetrics = new grpc.web.AbstractClientBase.MethodInfo(
  proto.datasources.GetMetricsResponse,
  /**
   * @param {!proto.datasources.GetMetricsRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.datasources.GetMetricsResponse.deserializeBinary
);


/**
 * @param {!proto.datasources.GetMetricsRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.datasources.GetMetricsResponse)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.datasources.GetMetricsResponse>|undefined}
 *     The XHR Node Readable Stream
 */
proto.datasources.DatasourcesClient.prototype.getMetrics =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/datasources.Datasources/GetMetrics',
      request,
      metadata || {},
      methodDescriptor_Datasources_GetMetrics,
      callback);
};


/**
 * @param {!proto.datasources.GetMetricsRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.datasources.GetMetricsResponse>}
 *     Promise that resolves to the response
 */
proto.datasources.DatasourcesPromiseClient.prototype.getMetrics =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/datasources.Datasources/GetMetrics',
      request,
      metadata || {},
      methodDescriptor_Datasources_GetMetrics);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.datasources.GetLogsRequest,
 *   !proto.datasources.GetLogsResponse>}
 */
const methodDescriptor_Datasources_GetLogs = new grpc.web.MethodDescriptor(
  '/datasources.Datasources/GetLogs',
  grpc.web.MethodType.UNARY,
  proto.datasources.GetLogsRequest,
  proto.datasources.GetLogsResponse,
  /**
   * @param {!proto.datasources.GetLogsRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.datasources.GetLogsResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.datasources.GetLogsRequest,
 *   !proto.datasources.GetLogsResponse>}
 */
const methodInfo_Datasources_GetLogs = new grpc.web.AbstractClientBase.MethodInfo(
  proto.datasources.GetLogsResponse,
  /**
   * @param {!proto.datasources.GetLogsRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.datasources.GetLogsResponse.deserializeBinary
);


/**
 * @param {!proto.datasources.GetLogsRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.datasources.GetLogsResponse)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.datasources.GetLogsResponse>|undefined}
 *     The XHR Node Readable Stream
 */
proto.datasources.DatasourcesClient.prototype.getLogs =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/datasources.Datasources/GetLogs',
      request,
      metadata || {},
      methodDescriptor_Datasources_GetLogs,
      callback);
};


/**
 * @param {!proto.datasources.GetLogsRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.datasources.GetLogsResponse>}
 *     Promise that resolves to the response
 */
proto.datasources.DatasourcesPromiseClient.prototype.getLogs =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/datasources.Datasources/GetLogs',
      request,
      metadata || {},
      methodDescriptor_Datasources_GetLogs);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.datasources.GetTracesRequest,
 *   !proto.datasources.GetTracesResponse>}
 */
const methodDescriptor_Datasources_GetTraces = new grpc.web.MethodDescriptor(
  '/datasources.Datasources/GetTraces',
  grpc.web.MethodType.UNARY,
  proto.datasources.GetTracesRequest,
  proto.datasources.GetTracesResponse,
  /**
   * @param {!proto.datasources.GetTracesRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.datasources.GetTracesResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.datasources.GetTracesRequest,
 *   !proto.datasources.GetTracesResponse>}
 */
const methodInfo_Datasources_GetTraces = new grpc.web.AbstractClientBase.MethodInfo(
  proto.datasources.GetTracesResponse,
  /**
   * @param {!proto.datasources.GetTracesRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.datasources.GetTracesResponse.deserializeBinary
);


/**
 * @param {!proto.datasources.GetTracesRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.datasources.GetTracesResponse)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.datasources.GetTracesResponse>|undefined}
 *     The XHR Node Readable Stream
 */
proto.datasources.DatasourcesClient.prototype.getTraces =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/datasources.Datasources/GetTraces',
      request,
      metadata || {},
      methodDescriptor_Datasources_GetTraces,
      callback);
};


/**
 * @param {!proto.datasources.GetTracesRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.datasources.GetTracesResponse>}
 *     Promise that resolves to the response
 */
proto.datasources.DatasourcesPromiseClient.prototype.getTraces =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/datasources.Datasources/GetTraces',
      request,
      metadata || {},
      methodDescriptor_Datasources_GetTraces);
};


module.exports = proto.datasources;

