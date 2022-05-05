package main

import (
	"fmt"
	"net/http"
	"time"

	"github.com/kobsio/kobs/pkg/kube/clusters"
	"github.com/kobsio/kobs/pkg/satellite/plugins/plugin"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
)

func Mount(instances []plugin.Instance, clustersClient clusters.Client) chi.Router {
	router := chi.NewRouter()
	router.Get("/clusters", func(w http.ResponseWriter, r *http.Request) {
		var clusters []string
		for _, c := range clustersClient.GetClusters() {
			clusters = append(clusters, c.GetName())
		}

		render.JSON(w, r, clusters)
	})

	router.Get("/instances", func(w http.ResponseWriter, r *http.Request) {
		fmt.Println(r.Header.Get("x-kobs-plugin"))
		fmt.Println(r.Header.Get("x-kobs-user"))
		render.JSON(w, r, instances)
	})

	router.Get("/stream", func(w http.ResponseWriter, r *http.Request) {
		done := make(chan bool)

		go func() {
			ticker := time.NewTicker(10 * time.Second)
			defer ticker.Stop()

			for {
				select {
				case <-done:
					return
				case <-ticker.C:
					if f, ok := w.(http.Flusher); ok {
						// We do not set the processing status code, so that the queries always are returning a 200. This is
						// necessary because Go doesn't allow to set a new status code once the header was written.
						// See: https://github.com/golang/go/issues/36734
						// For that we also have to handle errors, when the status code is 200 in the React UI.
						// See plugins/klogs/src/components/page/Logs.tsx#L64
						// w.WriteHeader(http.StatusProcessing)
						w.Write([]byte("\n"))
						f.Flush()
					}
				}
			}
		}()

		defer func() {
			done <- true
		}()

		time.Sleep(45 * time.Second)
		render.JSON(w, r, instances)
	})

	return router
}
