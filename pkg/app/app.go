package app

import (
	"context"
	"io/ioutil"
	"net/http"
	"os"
	"path"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/sirupsen/logrus"
	flag "github.com/spf13/pflag"
)

var (
	log       = logrus.WithFields(logrus.Fields{"package": "app"})
	address   string
	assetsDir string
)

// init is used to define all flags, which are needed for the application server. We have to define the address, where
// the application server is listen on and a asset directory, so that we can pass another location for the React app
// build to the corresponding handler. This can be used within VSCode to use the built-in debugger.
func init() {
	defaultAddress := ":15219"
	if os.Getenv("KOBS_APP_ADDRESS") != "" {
		defaultAddress = os.Getenv("KOBS_APP_ADDRESS")
	}

	defaultAssetsDir := "app/build"
	if os.Getenv("KOBS_APP_ASSETS") != "" {
		defaultAssetsDir = os.Getenv("KOBS_APP_ASSETS")
	}

	flag.StringVar(&address, "app.address", defaultAddress, "The address, where the Application server is listen on.")
	flag.StringVar(&assetsDir, "app.assets", defaultAssetsDir, "The location of the assets directory.")
}

// Server implements the application server. The application server is used to serve the React app and the health
// endpoint.
type Server struct {
	server *http.Server
}

// Start starts serving the application server.
func (s *Server) Start() {
	log.Infof("Application server listen on %s.", s.server.Addr)

	if err := s.server.ListenAndServe(); err != nil {
		if err != http.ErrServerClosed {
			log.WithError(err).Error("Application server died unexpected.")
		} else {
			log.Info("Application server was stopped.")
		}
	}
}

// Stop terminates the application server gracefully.
func (s *Server) Stop() {
	log.Debugf("Start shutdown of the Application server.")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := s.server.Shutdown(ctx)
	if err != nil {
		log.WithError(err).Error("Graceful shutdown of the Application server failed.")
	}
}

// New return a new application server. It creates the underlying http server, with the defined address from the
// app.address flag.
// When you haven't build the React app via "yarn build" you can skip serving of the frontend, by passing an empty
// localtion for the app.assets flag.
func New(isDevelopment bool) (*Server, error) {
	router := chi.NewRouter()

	// Serve the React app, when a directory for all assets is defined. We can not just serve the assets via
	// http.FileServer, because then the user would see an error, when he hits the reload button on another page then
	// the root page ("/").
	if assetsDir != "" {
		reactApp, err := ioutil.ReadFile(path.Join(assetsDir, "index.html"))
		if err != nil {
			return nil, err
		}

		staticHandler := http.StripPrefix("/", http.FileServer(http.Dir(assetsDir)))
		router.HandleFunc("/*", func(w http.ResponseWriter, r *http.Request) {
			// When kobs is run in development mode and the request path starts with "/api", we redirect these requests
			// to the port, where the API is running ("15220"). We have to return 307 as status code, to preserve the
			// used http method. This can be used to test the production build of the React app locally without the need
			// of another proxy, which handles the redirect.
			if isDevelopment && strings.HasPrefix(r.URL.Path, "/api") {
				http.Redirect(w, r, "http://localhost:15220"+r.URL.Path+"?"+r.URL.RawQuery, http.StatusTemporaryRedirect)
				return
			}

			if strings.Contains(r.URL.Path, ".") {
				staticHandler.ServeHTTP(w, r)
				return
			}

			render.HTML(w, r, string(reactApp))
		})
	}

	return &Server{
		server: &http.Server{
			Addr:    address,
			Handler: router,
		},
	}, nil
}
