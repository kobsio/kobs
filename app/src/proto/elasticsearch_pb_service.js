// package: plugins.elasticsearch
// file: elasticsearch.proto

var elasticsearch_pb = require("./elasticsearch_pb");
var grpc = require("@improbable-eng/grpc-web").grpc;

var Elasticsearch = (function () {
  function Elasticsearch() {}
  Elasticsearch.serviceName = "plugins.elasticsearch.Elasticsearch";
  return Elasticsearch;
}());

Elasticsearch.GetLogs = {
  methodName: "GetLogs",
  service: Elasticsearch,
  requestStream: false,
  responseStream: false,
  requestType: elasticsearch_pb.GetLogsRequest,
  responseType: elasticsearch_pb.GetLogsResponse
};

exports.Elasticsearch = Elasticsearch;

function ElasticsearchClient(serviceHost, options) {
  this.serviceHost = serviceHost;
  this.options = options || {};
}

ElasticsearchClient.prototype.getLogs = function getLogs(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Elasticsearch.GetLogs, {
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

exports.ElasticsearchClient = ElasticsearchClient;

