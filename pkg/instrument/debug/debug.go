package debug

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httputil"
	"net/http/pprof"
	"time"

	"github.com/kobsio/kobs/pkg/instrument/log"

	"github.com/go-chi/chi/v5"
	"go.uber.org/zap"
)

type Config struct {
	Enabled bool   `json:"enabled" env:"ENABLED" default:"false" help:"Start the debug server."`
	Address string `json:"address" env:"ADDRESS" default:":15225" help:"The address where the debug server should listen on."`
}

// Server is the interface of a debug service, which provides the options to start and stop the underlying http
// server.
type Server interface {
	Start()
	Stop()
}

// server implements the Server interface.
type server struct {
	*http.Server
}

// Start starts serving the debug server.
func (s *server) Start() {
	log.Info(context.Background(), "Debug server started", zap.String("address", s.Addr))

	if err := s.ListenAndServe(); err != nil {
		if err != http.ErrServerClosed {
			log.Error(context.Background(), "Debug server died unexpected", zap.Error(err))
		}
	}
}

// Stop terminates the debug server gracefully.
func (s *server) Stop() {
	log.Debug(context.Background(), "Start shutdown of the debug server")

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	err := s.Shutdown(ctx)
	if err != nil {
		log.Error(context.Background(), "Graceful shutdown of the debug server failed", zap.Error(err))
	}
}

// New return a new debug server. The server listens on the provided address and is used to provide the pprof endpoints
// and a /request/dump endpoint, which can be used to dump the request.
func New(config Config) Server {
	router := chi.NewRouter()

	router.Get("/debug/request/dump", func(w http.ResponseWriter, r *http.Request) {
		dump, err := httputil.DumpRequest(r, true)
		if err != nil {
			http.Error(w, fmt.Sprint(err), http.StatusInternalServerError)
			return
		}

		fmt.Fprintf(w, "%s", string(dump))
	})
	router.Get("/debug/request/timeout", func(w http.ResponseWriter, r *http.Request) {
		timeout := r.URL.Query().Get("timeout")
		if parsedTimeout, err := time.ParseDuration(timeout); err == nil {
			time.Sleep(parsedTimeout)
		}

		w.WriteHeader(http.StatusOK)
	})

	router.HandleFunc("/debug/pprof/", pprof.Index)
	router.HandleFunc("/debug/pprof/cmdline", pprof.Cmdline)
	router.HandleFunc("/debug/pprof/profile", pprof.Profile)
	router.HandleFunc("/debug/pprof/symbol", pprof.Symbol)

	router.Handle("/debug/pprof/allocs", pprof.Handler("allocs"))
	router.Handle("/debug/pprof/block", pprof.Handler("block"))
	router.Handle("/debug/pprof/goroutine", pprof.Handler("goroutine"))
	router.Handle("/debug/pprof/heap", pprof.Handler("heap"))
	router.Handle("/debug/pprof/mutex", pprof.Handler("mutex"))
	router.Handle("/debug/pprof/threadcreate", pprof.Handler("threadcreate"))
	router.Handle("/debug/pprof/trace", pprof.Handler("trace"))

	return &server{
		&http.Server{
			Addr:              config.Address,
			Handler:           router,
			ReadHeaderTimeout: 3 * time.Second,
		},
	}
}
