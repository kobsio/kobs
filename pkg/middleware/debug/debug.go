package debug

import (
	"fmt"
	"net/http"
	"net/http/httputil"
	"net/http/pprof"
	"time"

	"github.com/go-chi/chi/v5"
)

// MountRoutes mounts the debug endpoints to a chi router.
func MountRoutes(router *chi.Mux) {
	router.Route("/api/debug", func(r chi.Router) {
		r.Get("/request/dump", func(w http.ResponseWriter, r *http.Request) {
			dump, err := httputil.DumpRequest(r, true)
			if err != nil {
				http.Error(w, fmt.Sprint(err), http.StatusInternalServerError)
				return
			}

			fmt.Fprintf(w, "%s", string(dump))
		})
		r.Get("/request/timeout", func(w http.ResponseWriter, r *http.Request) {
			timeout := r.URL.Query().Get("timeout")
			if parsedTimeout, err := time.ParseDuration(timeout); err == nil {
				time.Sleep(parsedTimeout)
			}

			w.WriteHeader(http.StatusOK)
		})

		r.HandleFunc("/pprof/", pprof.Index)
		r.HandleFunc("/pprof/cmdline", pprof.Cmdline)
		r.HandleFunc("/pprof/profile", pprof.Profile)
		r.HandleFunc("/pprof/symbol", pprof.Symbol)

		r.Handle("/pprof/allocs", pprof.Handler("allocs"))
		r.Handle("/pprof/block", pprof.Handler("block"))
		r.Handle("/pprof/goroutine", pprof.Handler("goroutine"))
		r.Handle("/pprof/heap", pprof.Handler("heap"))
		r.Handle("/pprof/mutex", pprof.Handler("mutex"))
		r.Handle("/pprof/threadcreate", pprof.Handler("threadcreate"))
		r.Handle("/pprof/trace", pprof.Handler("trace"))
	})
}
