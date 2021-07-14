// Package errresponse implements a custom error renderer for the kobs api as it is described in the chi rest api
// example, which can be found here: https://github.com/go-chi/chi/blob/master/_examples/rest/main.go
package errresponse

import (
	"net/http"

	"github.com/go-chi/render"
)

// ErrResponse renderer type for handling all sorts of errors.
type ErrResponse struct {
	Err            error  `json:"-"`     // low-level runtime error
	HTTPStatusCode int    `json:"-"`     // http response status code
	StatusText     string `json:"error"` // user-level status message
}

func (e *ErrResponse) Render(w http.ResponseWriter, r *http.Request) error {
	render.Status(r, e.HTTPStatusCode)
	return nil
}

func Render(err error, status int, msg string) render.Renderer {
	if err != nil {
		return &ErrResponse{
			Err:            err,
			HTTPStatusCode: status,
			StatusText:     msg,
		}
	}

	return &ErrResponse{
		Err:            nil,
		HTTPStatusCode: status,
		StatusText:     msg,
	}
}
