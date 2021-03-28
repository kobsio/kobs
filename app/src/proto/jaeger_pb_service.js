// package: plugins.jaeger
// file: jaeger.proto

var jaeger_pb = require("./jaeger_pb");
var grpc = require("@improbable-eng/grpc-web").grpc;

var Jaeger = (function () {
  function Jaeger() {}
  Jaeger.serviceName = "plugins.jaeger.Jaeger";
  return Jaeger;
}());

Jaeger.GetOperations = {
  methodName: "GetOperations",
  service: Jaeger,
  requestStream: false,
  responseStream: false,
  requestType: jaeger_pb.GetOperationsRequest,
  responseType: jaeger_pb.GetOperationsResponse
};

Jaeger.GetTraces = {
  methodName: "GetTraces",
  service: Jaeger,
  requestStream: false,
  responseStream: false,
  requestType: jaeger_pb.GetTracesRequest,
  responseType: jaeger_pb.GetTracesResponse
};

Jaeger.GetTrace = {
  methodName: "GetTrace",
  service: Jaeger,
  requestStream: false,
  responseStream: false,
  requestType: jaeger_pb.GetTraceRequest,
  responseType: jaeger_pb.GetTraceResponse
};

exports.Jaeger = Jaeger;

function JaegerClient(serviceHost, options) {
  this.serviceHost = serviceHost;
  this.options = options || {};
}

JaegerClient.prototype.getOperations = function getOperations(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Jaeger.GetOperations, {
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

JaegerClient.prototype.getTraces = function getTraces(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Jaeger.GetTraces, {
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

JaegerClient.prototype.getTrace = function getTrace(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Jaeger.GetTrace, {
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

exports.JaegerClient = JaegerClient;

