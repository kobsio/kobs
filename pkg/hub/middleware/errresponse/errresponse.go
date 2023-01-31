// Package errresponse implements a custom error renderer for the kobs api as it is described in the chi rest api
// example, which can be found here: https://github.com/go-chi/chi/blob/master/_examples/rest/main.go
package errresponse

import (
	"net/http"

	"github.com/go-chi/render"
)

// ErrResponse renderer type for handling all sorts of errors.
type ErrResponse struct {
	Error string `json:"error"`
}

// Render sets the given status for the response and then returns the error and message as JSON object.
func Render(w http.ResponseWriter, r *http.Request, status int, err error) {
	message := http.StatusText(status)
	if err != nil {
		message = err.Error()
	}

	errResponse := &ErrResponse{
		Error: message,
	}

	render.Status(r, status)
	render.JSON(w, r, errResponse)
}