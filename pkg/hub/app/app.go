package app

import (
	"context"
	"io/ioutil"
	"net/http"
	"net/http/httputil"
	"net/url"
	"path"
	"strings"
	"time"

	"github.com/kobsio/kobs/pkg/hub/api"
	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/utils/middleware/recoverer"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

type Config struct {
	Address   string `json:"address" env:"ADDRESS" default:":15219" help:"The address where the app server should listen on."`
	AssetsDir string `json:"assetsDir" env:"ASSETS_DIR" default:"app" help:"The directory for the frontend assets, which should be served via the app server."`
}

// Server is the interface of a app service, which provides the options to start and stop the underlying http server.
type Server interface {
	Start()
	Stop()
}

// server implements the Server interface.
type server struct {
	server *http.Server
}

// Start starts serving the application server.
func (s *server) Start() {
	log.Info(nil, "Application server started", zap.String("address", s.server.Addr))

	if err := s.server.ListenAndServe(); err != nil {
		if err != http.ErrServerClosed {
			log.Error(nil, "Application server died unexpected", zap.Error(err))
		}
	}
}

// Stop terminates the application server gracefully.
func (s *server) Stop() {
	log.Debug(nil, "Start shutdown of the Application server")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	err := s.server.Shutdown(ctx)
	if err != nil {
		log.Error(nil, "Graceful shutdown of the Application server failed", zap.Error(err))
	}
}

// New return a new application server. It creates the underlying http server, with the defined address from the
// configuration.
//
// When you haven't build the React app via "npm build" you can skip serving of the frontend, by passing an empty
// localtion for the `assets` configuration.
func New(config Config, apiConfig api.Config) (Server, error) {
	router := chi.NewRouter()
	router.Use(recoverer.Handler)
	router.Use(middleware.Compress(5))
	router.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"DELETE", "GET", "HEAD", "OPTIONS", "POST", "PUT"},
		AllowedHeaders: []string{"*"},
	}))

	// Serve the React app, when a directory for all assets is defined. We can not just serve the assets via
	// http.FileServer, because then the user would see an error, when he hits the reload button on another page then
	// the root page ("/").
	if config.AssetsDir != "" {
		proxyURL, err := url.Parse("http://localhost" + apiConfig.Address)
		if err != nil {
			return nil, err
		}

		reactApp, err := ioutil.ReadFile(path.Join(config.AssetsDir, "index.html"))
		if err != nil {
			return nil, err
		}

		staticHandler := http.StripPrefix("/", http.FileServer(http.Dir(config.AssetsDir)))
		router.HandleFunc("/*", func(w http.ResponseWriter, r *http.Request) {
			// We redirect requests to the "/api" path to port where the hub is running on. For that we are using the
			// httputil.ReverseProxy.  This can be used to test the production build of the React app locally without
			// the need of another proxy, which handles the redirect.
			if strings.HasPrefix(r.URL.Path, "/api") {
				proxy := httputil.NewSingleHostReverseProxy(proxyURL)
				proxy.FlushInterval = -1
				proxy.ServeHTTP(w, r)
				return
			}

			// If the request path contains "/static/" or one of the listed extensions, we use our static handler to
			// serve the files for our React app.
			// The list of file extensions was generated by executing the following command in the "./bin/app" dir:
			// find . -type f -name '*.*' | sed 's|.*\.||' | sort -u
			if strings.Contains(r.URL.Path, "/static/") ||
				strings.HasSuffix(r.URL.Path, ".css") ||
				strings.HasSuffix(r.URL.Path, ".ico") ||
				strings.HasSuffix(r.URL.Path, ".jpg") ||
				strings.HasSuffix(r.URL.Path, ".js") ||
				strings.HasSuffix(r.URL.Path, ".json") ||
				strings.HasSuffix(r.URL.Path, ".map") ||
				strings.HasSuffix(r.URL.Path, ".png") ||
				strings.HasSuffix(r.URL.Path, ".svg") ||
				strings.HasSuffix(r.URL.Path, ".txt") ||
				strings.HasSuffix(r.URL.Path, ".woff") ||
				strings.HasSuffix(r.URL.Path, ".woff2") ||
				strings.HasSuffix(r.URL.Path, ".xml") {
				staticHandler.ServeHTTP(w, r)
				return
			}

			render.HTML(w, r, string(reactApp))
		})
	}

	return &server{
		server: &http.Server{
			Addr:    config.Address,
			Handler: router,
		},
	}, nil
}
