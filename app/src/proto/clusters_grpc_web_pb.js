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


var application_pb = require('./application_pb.js')

var team_pb = require('./team_pb.js')

var template_pb = require('./template_pb.js')
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
 *   !proto.clusters.GetCRDsRequest,
 *   !proto.clusters.GetCRDsResponse>}
 */
const methodDescriptor_Clusters_GetCRDs = new grpc.web.MethodDescriptor(
  '/clusters.Clusters/GetCRDs',
  grpc.web.MethodType.UNARY,
  proto.clusters.GetCRDsRequest,
  proto.clusters.GetCRDsResponse,
  /**
   * @param {!proto.clusters.GetCRDsRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.clusters.GetCRDsResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.clusters.GetCRDsRequest,
 *   !proto.clusters.GetCRDsResponse>}
 */
const methodInfo_Clusters_GetCRDs = new grpc.web.AbstractClientBase.MethodInfo(
  proto.clusters.GetCRDsResponse,
  /**
   * @param {!proto.clusters.GetCRDsRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.clusters.GetCRDsResponse.deserializeBinary
);


/**
 * @param {!proto.clusters.GetCRDsRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.clusters.GetCRDsResponse)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.clusters.GetCRDsResponse>|undefined}
 *     The XHR Node Readable Stream
 */
proto.clusters.ClustersClient.prototype.getCRDs =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/clusters.Clusters/GetCRDs',
      request,
      metadata || {},
      methodDescriptor_Clusters_GetCRDs,
      callback);
};


/**
 * @param {!proto.clusters.GetCRDsRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.clusters.GetCRDsResponse>}
 *     Promise that resolves to the response
 */
proto.clusters.ClustersPromiseClient.prototype.getCRDs =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/clusters.Clusters/GetCRDs',
      request,
      metadata || {},
      methodDescriptor_Clusters_GetCRDs);
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


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.clusters.GetLogsRequest,
 *   !proto.clusters.GetLogsResponse>}
 */
const methodDescriptor_Clusters_GetLogs = new grpc.web.MethodDescriptor(
  '/clusters.Clusters/GetLogs',
  grpc.web.MethodType.UNARY,
  proto.clusters.GetLogsRequest,
  proto.clusters.GetLogsResponse,
  /**
   * @param {!proto.clusters.GetLogsRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.clusters.GetLogsResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.clusters.GetLogsRequest,
 *   !proto.clusters.GetLogsResponse>}
 */
const methodInfo_Clusters_GetLogs = new grpc.web.AbstractClientBase.MethodInfo(
  proto.clusters.GetLogsResponse,
  /**
   * @param {!proto.clusters.GetLogsRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.clusters.GetLogsResponse.deserializeBinary
);


/**
 * @param {!proto.clusters.GetLogsRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.clusters.GetLogsResponse)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.clusters.GetLogsResponse>|undefined}
 *     The XHR Node Readable Stream
 */
proto.clusters.ClustersClient.prototype.getLogs =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/clusters.Clusters/GetLogs',
      request,
      metadata || {},
      methodDescriptor_Clusters_GetLogs,
      callback);
};


/**
 * @param {!proto.clusters.GetLogsRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.clusters.GetLogsResponse>}
 *     Promise that resolves to the response
 */
proto.clusters.ClustersPromiseClient.prototype.getLogs =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/clusters.Clusters/GetLogs',
      request,
      metadata || {},
      methodDescriptor_Clusters_GetLogs);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.clusters.GetApplicationsRequest,
 *   !proto.clusters.GetApplicationsResponse>}
 */
const methodDescriptor_Clusters_GetApplications = new grpc.web.MethodDescriptor(
  '/clusters.Clusters/GetApplications',
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
const methodInfo_Clusters_GetApplications = new grpc.web.AbstractClientBase.MethodInfo(
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
proto.clusters.ClustersClient.prototype.getApplications =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/clusters.Clusters/GetApplications',
      request,
      metadata || {},
      methodDescriptor_Clusters_GetApplications,
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
proto.clusters.ClustersPromiseClient.prototype.getApplications =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/clusters.Clusters/GetApplications',
      request,
      metadata || {},
      methodDescriptor_Clusters_GetApplications);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.clusters.GetApplicationRequest,
 *   !proto.clusters.GetApplicationResponse>}
 */
const methodDescriptor_Clusters_GetApplication = new grpc.web.MethodDescriptor(
  '/clusters.Clusters/GetApplication',
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
const methodInfo_Clusters_GetApplication = new grpc.web.AbstractClientBase.MethodInfo(
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
proto.clusters.ClustersClient.prototype.getApplication =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/clusters.Clusters/GetApplication',
      request,
      metadata || {},
      methodDescriptor_Clusters_GetApplication,
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
proto.clusters.ClustersPromiseClient.prototype.getApplication =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/clusters.Clusters/GetApplication',
      request,
      metadata || {},
      methodDescriptor_Clusters_GetApplication);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.clusters.GetApplicationsTopologyRequest,
 *   !proto.clusters.GetApplicationsTopologyResponse>}
 */
const methodDescriptor_Clusters_GetApplicationsTopology = new grpc.web.MethodDescriptor(
  '/clusters.Clusters/GetApplicationsTopology',
  grpc.web.MethodType.UNARY,
  proto.clusters.GetApplicationsTopologyRequest,
  proto.clusters.GetApplicationsTopologyResponse,
  /**
   * @param {!proto.clusters.GetApplicationsTopologyRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.clusters.GetApplicationsTopologyResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.clusters.GetApplicationsTopologyRequest,
 *   !proto.clusters.GetApplicationsTopologyResponse>}
 */
const methodInfo_Clusters_GetApplicationsTopology = new grpc.web.AbstractClientBase.MethodInfo(
  proto.clusters.GetApplicationsTopologyResponse,
  /**
   * @param {!proto.clusters.GetApplicationsTopologyRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.clusters.GetApplicationsTopologyResponse.deserializeBinary
);


/**
 * @param {!proto.clusters.GetApplicationsTopologyRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.clusters.GetApplicationsTopologyResponse)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.clusters.GetApplicationsTopologyResponse>|undefined}
 *     The XHR Node Readable Stream
 */
proto.clusters.ClustersClient.prototype.getApplicationsTopology =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/clusters.Clusters/GetApplicationsTopology',
      request,
      metadata || {},
      methodDescriptor_Clusters_GetApplicationsTopology,
      callback);
};


/**
 * @param {!proto.clusters.GetApplicationsTopologyRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.clusters.GetApplicationsTopologyResponse>}
 *     Promise that resolves to the response
 */
proto.clusters.ClustersPromiseClient.prototype.getApplicationsTopology =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/clusters.Clusters/GetApplicationsTopology',
      request,
      metadata || {},
      methodDescriptor_Clusters_GetApplicationsTopology);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.clusters.GetTeamsRequest,
 *   !proto.clusters.GetTeamsResponse>}
 */
const methodDescriptor_Clusters_GetTeams = new grpc.web.MethodDescriptor(
  '/clusters.Clusters/GetTeams',
  grpc.web.MethodType.UNARY,
  proto.clusters.GetTeamsRequest,
  proto.clusters.GetTeamsResponse,
  /**
   * @param {!proto.clusters.GetTeamsRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.clusters.GetTeamsResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.clusters.GetTeamsRequest,
 *   !proto.clusters.GetTeamsResponse>}
 */
const methodInfo_Clusters_GetTeams = new grpc.web.AbstractClientBase.MethodInfo(
  proto.clusters.GetTeamsResponse,
  /**
   * @param {!proto.clusters.GetTeamsRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.clusters.GetTeamsResponse.deserializeBinary
);


/**
 * @param {!proto.clusters.GetTeamsRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.clusters.GetTeamsResponse)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.clusters.GetTeamsResponse>|undefined}
 *     The XHR Node Readable Stream
 */
proto.clusters.ClustersClient.prototype.getTeams =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/clusters.Clusters/GetTeams',
      request,
      metadata || {},
      methodDescriptor_Clusters_GetTeams,
      callback);
};


/**
 * @param {!proto.clusters.GetTeamsRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.clusters.GetTeamsResponse>}
 *     Promise that resolves to the response
 */
proto.clusters.ClustersPromiseClient.prototype.getTeams =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/clusters.Clusters/GetTeams',
      request,
      metadata || {},
      methodDescriptor_Clusters_GetTeams);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.clusters.GetTeamRequest,
 *   !proto.clusters.GetTeamResponse>}
 */
const methodDescriptor_Clusters_GetTeam = new grpc.web.MethodDescriptor(
  '/clusters.Clusters/GetTeam',
  grpc.web.MethodType.UNARY,
  proto.clusters.GetTeamRequest,
  proto.clusters.GetTeamResponse,
  /**
   * @param {!proto.clusters.GetTeamRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.clusters.GetTeamResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.clusters.GetTeamRequest,
 *   !proto.clusters.GetTeamResponse>}
 */
const methodInfo_Clusters_GetTeam = new grpc.web.AbstractClientBase.MethodInfo(
  proto.clusters.GetTeamResponse,
  /**
   * @param {!proto.clusters.GetTeamRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.clusters.GetTeamResponse.deserializeBinary
);


/**
 * @param {!proto.clusters.GetTeamRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.clusters.GetTeamResponse)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.clusters.GetTeamResponse>|undefined}
 *     The XHR Node Readable Stream
 */
proto.clusters.ClustersClient.prototype.getTeam =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/clusters.Clusters/GetTeam',
      request,
      metadata || {},
      methodDescriptor_Clusters_GetTeam,
      callback);
};


/**
 * @param {!proto.clusters.GetTeamRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.clusters.GetTeamResponse>}
 *     Promise that resolves to the response
 */
proto.clusters.ClustersPromiseClient.prototype.getTeam =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/clusters.Clusters/GetTeam',
      request,
      metadata || {},
      methodDescriptor_Clusters_GetTeam);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.clusters.GetTemplatesRequest,
 *   !proto.clusters.GetTemplatesResponse>}
 */
const methodDescriptor_Clusters_GetTemplates = new grpc.web.MethodDescriptor(
  '/clusters.Clusters/GetTemplates',
  grpc.web.MethodType.UNARY,
  proto.clusters.GetTemplatesRequest,
  proto.clusters.GetTemplatesResponse,
  /**
   * @param {!proto.clusters.GetTemplatesRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.clusters.GetTemplatesResponse.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.clusters.GetTemplatesRequest,
 *   !proto.clusters.GetTemplatesResponse>}
 */
const methodInfo_Clusters_GetTemplates = new grpc.web.AbstractClientBase.MethodInfo(
  proto.clusters.GetTemplatesResponse,
  /**
   * @param {!proto.clusters.GetTemplatesRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.clusters.GetTemplatesResponse.deserializeBinary
);


/**
 * @param {!proto.clusters.GetTemplatesRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.clusters.GetTemplatesResponse)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.clusters.GetTemplatesResponse>|undefined}
 *     The XHR Node Readable Stream
 */
proto.clusters.ClustersClient.prototype.getTemplates =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/clusters.Clusters/GetTemplates',
      request,
      metadata || {},
      methodDescriptor_Clusters_GetTemplates,
      callback);
};


/**
 * @param {!proto.clusters.GetTemplatesRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.clusters.GetTemplatesResponse>}
 *     Promise that resolves to the response
 */
proto.clusters.ClustersPromiseClient.prototype.getTemplates =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/clusters.Clusters/GetTemplates',
      request,
      metadata || {},
      methodDescriptor_Clusters_GetTemplates);
};


module.exports = proto.clusters;

