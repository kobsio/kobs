// package: datasources
// file: datasources.proto

var datasources_pb = require("./datasources_pb");
var grpc = require("@improbable-eng/grpc-web").grpc;

var Datasources = (function () {
  function Datasources() {}
  Datasources.serviceName = "datasources.Datasources";
  return Datasources;
}());

Datasources.GetDatasources = {
  methodName: "GetDatasources",
  service: Datasources,
  requestStream: false,
  responseStream: false,
  requestType: datasources_pb.GetDatasourcesRequest,
  responseType: datasources_pb.GetDatasourcesResponse
};

Datasources.GetDatasource = {
  methodName: "GetDatasource",
  service: Datasources,
  requestStream: false,
  responseStream: false,
  requestType: datasources_pb.GetDatasourceRequest,
  responseType: datasources_pb.GetDatasourceResponse
};

Datasources.GetVariables = {
  methodName: "GetVariables",
  service: Datasources,
  requestStream: false,
  responseStream: false,
  requestType: datasources_pb.GetVariablesRequest,
  responseType: datasources_pb.GetVariablesResponse
};

Datasources.GetMetrics = {
  methodName: "GetMetrics",
  service: Datasources,
  requestStream: false,
  responseStream: false,
  requestType: datasources_pb.GetMetricsRequest,
  responseType: datasources_pb.GetMetricsResponse
};

Datasources.GetLogs = {
  methodName: "GetLogs",
  service: Datasources,
  requestStream: false,
  responseStream: false,
  requestType: datasources_pb.GetLogsRequest,
  responseType: datasources_pb.GetLogsResponse
};

Datasources.GetTraces = {
  methodName: "GetTraces",
  service: Datasources,
  requestStream: false,
  responseStream: false,
  requestType: datasources_pb.GetTracesRequest,
  responseType: datasources_pb.GetTracesResponse
};

exports.Datasources = Datasources;

function DatasourcesClient(serviceHost, options) {
  this.serviceHost = serviceHost;
  this.options = options || {};
}

DatasourcesClient.prototype.getDatasources = function getDatasources(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Datasources.GetDatasources, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

DatasourcesClient.prototype.getDatasource = function getDatasource(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Datasources.GetDatasource, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

DatasourcesClient.prototype.getVariables = function getVariables(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Datasources.GetVariables, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

DatasourcesClient.prototype.getMetrics = function getMetrics(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Datasources.GetMetrics, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

DatasourcesClient.prototype.getLogs = function getLogs(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Datasources.GetLogs, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

DatasourcesClient.prototype.getTraces = function getTraces(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Datasources.GetTraces, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

exports.DatasourcesClient = DatasourcesClient;

