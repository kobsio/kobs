// Package errresponse implements a custom error renderer for the kobs api as it is described in the chi rest api
// example, which can be found here: https://github.com/go-chi/chi/blob/master/_examples/rest/main.go
package errresponse

import (
	"net/http"

	"github.com/go-chi/render"
)

// ErrResponse renderer type for handling all sorts of errors.
type ErrResponse struct {
	Errors []string `json:"errors"`
}

// Render sets the given status for the response and then returns errors as JSON object.
//
//	errresponse.Render(w, r, http.StatusInternalServerError)
//	errresponse.Render(w, r, http.StatusInternalServerError, "First error", "Second error")
func Render(w http.ResponseWriter, r *http.Request, status int, errors ...string) {
	if len(errors) == 0 {
		errors = []string{http.StatusText(status)}
	}

	errResponse := &ErrResponse{
		Errors: errors,
	}

	render.Status(r, status)
	render.JSON(w, r, errResponse)
}
