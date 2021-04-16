// package: plugins.opsgenie
// file: opsgenie.proto

var opsgenie_pb = require("./opsgenie_pb");
var grpc = require("@improbable-eng/grpc-web").grpc;

var Opsgenie = (function () {
  function Opsgenie() {}
  Opsgenie.serviceName = "plugins.opsgenie.Opsgenie";
  return Opsgenie;
}());

Opsgenie.GetAlerts = {
  methodName: "GetAlerts",
  service: Opsgenie,
  requestStream: false,
  responseStream: false,
  requestType: opsgenie_pb.GetAlertsRequest,
  responseType: opsgenie_pb.GetAlertsResponse
};

Opsgenie.GetAlert = {
  methodName: "GetAlert",
  service: Opsgenie,
  requestStream: false,
  responseStream: false,
  requestType: opsgenie_pb.GetAlertRequest,
  responseType: opsgenie_pb.GetAlertResponse
};

exports.Opsgenie = Opsgenie;

function OpsgenieClient(serviceHost, options) {
  this.serviceHost = serviceHost;
  this.options = options || {};
}

OpsgenieClient.prototype.getAlerts = function getAlerts(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Opsgenie.GetAlerts, {
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

OpsgenieClient.prototype.getAlert = function getAlert(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Opsgenie.GetAlert, {
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

exports.OpsgenieClient = OpsgenieClient;

