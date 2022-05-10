package app

import (
	"context"
	"io/ioutil"
	"net/http"
	"path"
	"strings"
	"time"

	"github.com/kobsio/kobs/pkg/log"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

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

	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	err := s.server.Shutdown(ctx)
	if err != nil {
		log.Error(nil, "Graceful shutdown of the Application server failed", zap.Error(err))
	}
}

// New return a new application server. It creates the underlying http server, with the defined address from the
// app.address flag.
// When you haven't build the React app via "yarn build" you can skip serving of the frontend, by passing an empty
// localtion for the app.assets flag.
func New(hubAddress, appAddress, appAssetsDir string) (Server, error) {
	router := chi.NewRouter()

	// Serve the React app, when a directory for all assets is defined. We can not just serve the assets via
	// http.FileServer, because then the user would see an error, when he hits the reload button on another page then
	// the root page ("/").
	if appAssetsDir != "" {
		reactApp, err := ioutil.ReadFile(path.Join(appAssetsDir, "index.html"))
		if err != nil {
			return nil, err
		}

		staticHandler := http.StripPrefix("/", http.FileServer(http.Dir(appAssetsDir)))
		router.HandleFunc("/*", func(w http.ResponseWriter, r *http.Request) {
			// We redirect requests to the "/api" path to port where the hub is running on. We have to return 307 as
			// status code, to preserve the used http method. This can be used to test the production build of the React
			// app locally without the need of another proxy, which handles the redirect.
			if strings.HasPrefix(r.URL.Path, "/api") {
				http.Redirect(w, r, "http://localhost:"+hubAddress+r.URL.Path+"?"+r.URL.RawQuery, http.StatusTemporaryRedirect)
				return
			}

			if strings.Contains(r.URL.Path, ".") {
				staticHandler.ServeHTTP(w, r)
				return
			}

			render.HTML(w, r, string(reactApp))
		})
	}

	return &server{
		server: &http.Server{
			Addr:    appAddress,
			Handler: router,
		},
	}, nil
}
