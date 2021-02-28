package api

import (
	"net"
	"os"

	"github.com/kobsio/kobs/pkg/api/clusters"
	"github.com/kobsio/kobs/pkg/api/datasources"
	"github.com/kobsio/kobs/pkg/api/datasources/datasource"
	"github.com/kobsio/kobs/pkg/generated/proto"

	"github.com/sirupsen/logrus"
	flag "github.com/spf13/pflag"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
)

var (
	log     = logrus.WithFields(logrus.Fields{"package": "api"})
	address string
)

// init is used to define all flags, which are needed for the API server. We have to define the address, where
// the API server is listen on.
func init() {
	defaultAddress := ":15220"
	if os.Getenv("KOBS_API_ADDRESS") != "" {
		defaultAddress = os.Getenv("KOBS_API_ADDRESS")
	}

	flag.StringVar(&address, "api.address", defaultAddress, "The address, where the API server is listen on.")
}

// Server implements the API server. The API server is used to serve the GRPC server.
type Server struct {
	listener net.Listener
	server   *grpc.Server
}

// Start starts serving the API server.
func (s *Server) Start() {
	log.Infof("API server listen on %s.", s.listener.Addr())
	s.server.Serve(s.listener)
}

// Stop terminates the API server gracefully.
func (s *Server) Stop() {
	log.Debugf("Start shutdown of the API server.")
	s.server.GracefulStop()
}

// New return a new API server.
func New(clustersConfig clusters.Config, datasourcesConfig []datasource.Config) (*Server, error) {
	listener, err := net.Listen("tcp", address)
	if err != nil {
		return nil, err
	}

	c, err := clusters.Load(clustersConfig)
	if err != nil {
		return nil, err
	}

	d, err := datasources.Load(datasourcesConfig)
	if err != nil {
		return nil, err
	}

	grpcServer := grpc.NewServer()
	reflection.Register(grpcServer)
	proto.RegisterClustersServer(grpcServer, c)
	proto.RegisterDatasourcesServer(grpcServer, d)

	return &Server{
		listener: listener,
		server:   grpcServer,
	}, nil
}
