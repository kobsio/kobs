package api

import (
	"context"
	"net/http"
	"time"

	"github.com/kobsio/kobs/pkg/client/api/applications"
	"github.com/kobsio/kobs/pkg/client/api/dashboards"
	"github.com/kobsio/kobs/pkg/client/api/resources"
	"github.com/kobsio/kobs/pkg/client/api/teams"
	"github.com/kobsio/kobs/pkg/client/api/users"
	"github.com/kobsio/kobs/pkg/client/kubernetes"
	"github.com/kobsio/kobs/pkg/client/middleware/tokenauth"
	"github.com/kobsio/kobs/pkg/client/plugins"
	"github.com/kobsio/kobs/pkg/hub/middleware/recoverer"
	"github.com/kobsio/kobs/pkg/instrument"
	"github.com/kobsio/kobs/pkg/instrument/log"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

type Config struct {
	Applications applications.Config `embed:"" prefix:"applications." envprefix:"APPLICATIONS_"`
	Dashboards   dashboards.Config   `embed:"" prefix:"dashboards." envprefix:"DASHBOARDS_"`
	Resources    resources.Config    `embed:"" prefix:"resources." envprefix:"RESOURCES_"`
	Teams        teams.Config        `embed:"" prefix:"teams." envprefix:"TEAMS_"`
	Users        users.Config        `embed:"" prefix:"users." envprefix:"USERS_"`
	Address      string              `env:"ADDRESS" default:":15221" help:"The address where the client API should listen on."`
	Token        string              `env:"TOKEN" default:"" help:"The token which is used to protect the client API."`
}

// Server is the interface of a client service, which provides the options to start and stop the underlying http
// server.
type Server interface {
	Start()
	Stop()
}

// server implements the Server interface.
type server struct {
	server *http.Server
}

// Start starts serving the client server.
func (s *server) Start() {
	log.Info(nil, "Client server started", zap.String("address", s.server.Addr))

	if err := s.server.ListenAndServe(); err != nil {
		if err != http.ErrServerClosed {
			log.Error(nil, "Client server died unexpected", zap.Error(err))
		}
	}
}

// Stop terminates the client server gracefully.
func (s *server) Stop() {
	log.Debug(nil, "Start shutdown of the client server")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	err := s.server.Shutdown(ctx)
	if err != nil {
		log.Error(nil, "Graceful shutdown of the client server failed", zap.Error(err))
	}
}

// New return a new client server. It creates the underlying http server, with the given name, address and token.
//
// We exclude the health check from all middlewares, because the health check just returns 200. Therefore we do not need
// our defined middlewares like request id, metrics, auth or loggin. This also makes it easier to analyze the logs in a
// Kubernetes cluster where the health check is called every x seconds, because we generate less logs.
func New(config Config, kubernetesClient kubernetes.Client, pluginsClient plugins.Client) (Server, error) {
	router := chi.NewRouter()
	router.Use(recoverer.Handler)
	router.Use(middleware.Compress(5))
	router.Use(middleware.RequestID)
	router.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"DELETE", "GET", "HEAD", "OPTIONS", "POST", "PUT"},
		AllowedHeaders: []string{"*"},
	}))

	router.Get("/api/health", func(w http.ResponseWriter, r *http.Request) {
		render.JSON(w, r, nil)
	})

	router.Route("/api", func(r chi.Router) {
		r.Use(instrument.Handler())
		r.Use(tokenauth.Handler(config.Token))

		r.Mount("/applications", applications.Mount(config.Applications, kubernetesClient))
		r.Mount("/dashboards", dashboards.Mount(config.Dashboards, kubernetesClient))
		r.Mount("/resources", resources.Mount(config.Resources, kubernetesClient))
		r.Mount("/teams", teams.Mount(config.Teams, kubernetesClient))
		r.Mount("/users", users.Mount(config.Users, kubernetesClient))
		r.Mount("/plugins", pluginsClient.Mount())
	})

	return &server{
		server: &http.Server{
			Addr:    config.Address,
			Handler: router,
		},
	}, nil
}
