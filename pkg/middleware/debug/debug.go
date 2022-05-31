package debug

import (
	"fmt"
	"net/http"
	"net/http/httputil"
	"net/http/pprof"
	"time"

	"github.com/kobsio/kobs/pkg/middleware/basicauth"

	"github.com/go-chi/chi/v5"
)

// Mount returns a chi router with the debug endpoints, which can be mounted in an existing router.
func Mount(username, password string) chi.Router {
	router := chi.NewRouter()
	router.Use(basicauth.Handler("kobs-debug", username, password))

	router.Get("/request/dump", func(w http.ResponseWriter, r *http.Request) {
		dump, err := httputil.DumpRequest(r, true)
		if err != nil {
			http.Error(w, fmt.Sprint(err), http.StatusInternalServerError)
			return
		}

		fmt.Fprintf(w, "%s", string(dump))
	})
	router.Get("/request/timeout", func(w http.ResponseWriter, r *http.Request) {
		timeout := r.URL.Query().Get("timeout")
		if parsedTimeout, err := time.ParseDuration(timeout); err == nil {
			time.Sleep(parsedTimeout)
		}

		w.WriteHeader(http.StatusOK)
	})

	router.HandleFunc("/pprof/", pprof.Index)
	router.HandleFunc("/pprof/cmdline", pprof.Cmdline)
	router.HandleFunc("/pprof/profile", pprof.Profile)
	router.HandleFunc("/pprof/symbol", pprof.Symbol)

	router.Handle("/pprof/allocs", pprof.Handler("allocs"))
	router.Handle("/pprof/block", pprof.Handler("block"))
	router.Handle("/pprof/goroutine", pprof.Handler("goroutine"))
	router.Handle("/pprof/heap", pprof.Handler("heap"))
	router.Handle("/pprof/mutex", pprof.Handler("mutex"))
	router.Handle("/pprof/threadcreate", pprof.Handler("threadcreate"))
	router.Handle("/pprof/trace", pprof.Handler("trace"))

	return router
}
