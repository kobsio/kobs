// package: plugins
// file: plugins.proto

var plugins_pb = require("./plugins_pb");
var grpc = require("@improbable-eng/grpc-web").grpc;

var Plugins = (function () {
  function Plugins() {}
  Plugins.serviceName = "plugins.Plugins";
  return Plugins;
}());

Plugins.GetPlugins = {
  methodName: "GetPlugins",
  service: Plugins,
  requestStream: false,
  responseStream: false,
  requestType: plugins_pb.GetPluginsRequest,
  responseType: plugins_pb.GetPluginsResponse
};

exports.Plugins = Plugins;

function PluginsClient(serviceHost, options) {
  this.serviceHost = serviceHost;
  this.options = options || {};
}

PluginsClient.prototype.getPlugins = function getPlugins(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Plugins.GetPlugins, {
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

exports.PluginsClient = PluginsClient;

