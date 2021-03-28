package jaeger

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	jaegerProto "github.com/kobsio/kobs/pkg/api/plugins/jaeger/proto"
	pluginsProto "github.com/kobsio/kobs/pkg/api/plugins/plugins/proto"
	"github.com/kobsio/kobs/pkg/api/plugins/plugins/shared"

	"github.com/sirupsen/logrus"
	"google.golang.org/grpc"
)

var (
	log = logrus.WithFields(logrus.Fields{"package": "jaeger"})
)

type Config struct {
	Name        string `yaml:"name"`
	Description string `yaml:"description"`
	Address     string `yaml:"address"`
	Username    string `yaml:"username"`
	Password    string `yaml:"password"`
	Token       string `yaml:"token"`
}

// ResponseDataServices is the structure of the response for a services request against the Jaeger API.
type ResponseDataServices struct {
	Data []string `json:"data"`
}

// ResponseDataOperations is the structure of the response for a operations request against the Jaeger API.
type ResponseDataOperations struct {
	Data []*jaegerProto.Operation `json:"data"`
}

// ResponseError is the structure for a failed Jaeger API request.
type ResponseError struct {
	Errors []struct {
		Code int    `json:"code"`
		Msg  string `json:"msg"`
	} `json:"errors"`
}

type Instance struct {
	name    string
	address string
	client  *http.Client
}

// doRequest is a helper function to run a request against a Jaeger instance for the given path. It returns the body or
// if the request failed the error message.
func (i *Instance) doRequest(url string) ([]byte, error) {
	req, err := http.NewRequest(http.MethodGet, fmt.Sprintf("%s%s", i.address, url), nil)
	if err != nil {
		return nil, err
	}

	resp, err := i.client.Do(req)
	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()

	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		body, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			return nil, err
		}

		return body, nil
	}

	var res ResponseError

	err = json.NewDecoder(resp.Body).Decode(&res)
	if err != nil {
		return nil, err
	}

	if len(res.Errors) > 0 {
		return nil, fmt.Errorf(res.Errors[0].Msg)
	}

	return nil, fmt.Errorf("%v", res)
}

type Jaeger struct {
	jaegerProto.UnimplementedJaegerServer
	instances []*Instance
}

func (j *Jaeger) getInstace(name string) *Instance {
	for _, i := range j.instances {
		if i.name == name {
			return i
		}
	}

	return nil
}

func (j *Jaeger) GetOperations(ctx context.Context, getOperationsRequest *jaegerProto.GetOperationsRequest) (*jaegerProto.GetOperationsResponse, error) {
	if getOperationsRequest == nil {
		return nil, fmt.Errorf("request data is missing")
	}

	instance := j.getInstace(getOperationsRequest.Name)
	if instance == nil {
		return nil, fmt.Errorf("invalid name for Jaeger plugin")
	}

	log.WithFields(logrus.Fields{"service": getOperationsRequest.Service}).Tracef("GetOperations")

	var services []string
	var service string
	if getOperationsRequest.Service == "" {
		body, err := instance.doRequest("/api/services")
		if err != nil {
			return nil, err
		}

		var response ResponseDataServices
		err = json.Unmarshal(body, &response)
		if err != nil {
			return nil, err
		}

		services = response.Data
		service = services[0]

		log.WithFields(logrus.Fields{"count": len(services)}).Tracef("GetOperations retrieved services")
	} else {
		service = getOperationsRequest.Service
	}

	body, err := instance.doRequest(fmt.Sprintf("/api/operations?service=%s", service))
	if err != nil {
		return nil, err
	}

	var response ResponseDataOperations
	err = json.Unmarshal(body, &response)
	if err != nil {
		return nil, err
	}

	log.WithFields(logrus.Fields{"count": len(response.Data)}).Tracef("GetOperations retrieved operations")

	return &jaegerProto.GetOperationsResponse{
		Services:   services,
		Operations: response.Data,
	}, nil
}

func (j *Jaeger) GetTraces(ctx context.Context, getTracesRequest *jaegerProto.GetTracesRequest) (*jaegerProto.GetTracesResponse, error) {
	if getTracesRequest == nil {
		return nil, fmt.Errorf("request data is missing")
	}

	instance := j.getInstace(getTracesRequest.Name)
	if instance == nil {
		return nil, fmt.Errorf("invalid name for Jaeger plugin")
	}

	log.WithFields(logrus.Fields{"service": getTracesRequest.Service, "operation": getTracesRequest.Operation, "tags": getTracesRequest.Tags}).Tracef("GetTraces")

	body, err := instance.doRequest(fmt.Sprintf("/api/traces?end=%d&limit=%s&lookback=custom&maxDuration=%s&minDuration=%s&operation=%s&service=%s&start=%d", getTracesRequest.TimeEnd*1000000, getTracesRequest.Limit, getTracesRequest.MaxDuration, getTracesRequest.MinDuration, getTracesRequest.Operation, getTracesRequest.Service, getTracesRequest.TimeStart*1000000))
	if err != nil {
		return nil, err
	}

	return &jaegerProto.GetTracesResponse{
		Traces: string(body),
	}, nil
}

func (j *Jaeger) GetTrace(ctx context.Context, getTraceRequest *jaegerProto.GetTraceRequest) (*jaegerProto.GetTraceResponse, error) {
	if getTraceRequest == nil {
		return nil, fmt.Errorf("request data is missing")
	}

	instance := j.getInstace(getTraceRequest.Name)
	if instance == nil {
		return nil, fmt.Errorf("invalid name for Jaeger plugin")
	}

	log.WithFields(logrus.Fields{"traceID": getTraceRequest.TraceID}).Tracef("GetTrace")

	body, err := instance.doRequest(fmt.Sprintf("/api/traces/%s", getTraceRequest.TraceID))
	if err != nil {
		return nil, err
	}

	return &jaegerProto.GetTraceResponse{
		Traces: string(body),
	}, nil
}

func Register(cfg []Config, grpcServer *grpc.Server) ([]*pluginsProto.PluginShort, error) {
	log.Tracef("Register Jaeger Plugin.")

	var pluginDetails []*pluginsProto.PluginShort
	var instances []*Instance

	for _, config := range cfg {
		roundTripper := shared.DefaultRoundTripper

		if config.Username != "" && config.Password != "" {
			roundTripper = shared.BasicAuthTransport{
				Transport: roundTripper,
				Username:  config.Username,
				Password:  config.Password,
			}
		}

		if config.Token != "" {
			roundTripper = shared.TokenAuthTransporter{
				Transport: roundTripper,
				Token:     config.Token,
			}
		}

		pluginDetails = append(pluginDetails, &pluginsProto.PluginShort{
			Name:        config.Name,
			Description: config.Description,
			Type:        "jaeger",
		})
		instances = append(instances, &Instance{
			name:    config.Name,
			address: config.Address,
			client: &http.Client{
				Transport: roundTripper,
			},
		})
	}

	jaegerProto.RegisterJaegerServer(grpcServer, &Jaeger{
		instances: instances,
	})

	return pluginDetails, nil
}
