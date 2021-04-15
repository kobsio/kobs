// package: plugins.prometheus
// file: prometheus.proto

var prometheus_pb = require("./prometheus_pb");
var grpc = require("@improbable-eng/grpc-web").grpc;

var Prometheus = (function () {
  function Prometheus() {}
  Prometheus.serviceName = "plugins.prometheus.Prometheus";
  return Prometheus;
}());

Prometheus.GetVariables = {
  methodName: "GetVariables",
  service: Prometheus,
  requestStream: false,
  responseStream: false,
  requestType: prometheus_pb.GetVariablesRequest,
  responseType: prometheus_pb.GetVariablesResponse
};

Prometheus.GetMetrics = {
  methodName: "GetMetrics",
  service: Prometheus,
  requestStream: false,
  responseStream: false,
  requestType: prometheus_pb.GetMetricsRequest,
  responseType: prometheus_pb.GetMetricsResponse
};

Prometheus.MetricLookup = {
  methodName: "MetricLookup",
  service: Prometheus,
  requestStream: false,
  responseStream: false,
  requestType: prometheus_pb.MetricLookupRequest,
  responseType: prometheus_pb.MetricLookupResponse
};

exports.Prometheus = Prometheus;

function PrometheusClient(serviceHost, options) {
  this.serviceHost = serviceHost;
  this.options = options || {};
}

PrometheusClient.prototype.getVariables = function getVariables(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Prometheus.GetVariables, {
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

PrometheusClient.prototype.getMetrics = function getMetrics(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Prometheus.GetMetrics, {
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

PrometheusClient.prototype.metricLookup = function metricLookup(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Prometheus.MetricLookup, {
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

exports.PrometheusClient = PrometheusClient;

