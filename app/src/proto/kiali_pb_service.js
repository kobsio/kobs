// package: plugins.kiali
// file: kiali.proto

var kiali_pb = require("./kiali_pb");
var grpc = require("@improbable-eng/grpc-web").grpc;

var Kiali = (function () {
  function Kiali() {}
  Kiali.serviceName = "plugins.kiali.Kiali";
  return Kiali;
}());

Kiali.GetNamespaces = {
  methodName: "GetNamespaces",
  service: Kiali,
  requestStream: false,
  responseStream: false,
  requestType: kiali_pb.GetNamespacesRequest,
  responseType: kiali_pb.GetNamespacesResponse
};

Kiali.GetGraph = {
  methodName: "GetGraph",
  service: Kiali,
  requestStream: false,
  responseStream: false,
  requestType: kiali_pb.GetGraphRequest,
  responseType: kiali_pb.GetGraphResponse
};

exports.Kiali = Kiali;

function KialiClient(serviceHost, options) {
  this.serviceHost = serviceHost;
  this.options = options || {};
}

KialiClient.prototype.getNamespaces = function getNamespaces(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Kiali.GetNamespaces, {
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

KialiClient.prototype.getGraph = function getGraph(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Kiali.GetGraph, {
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

exports.KialiClient = KialiClient;

