package satellite

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	authContext "github.com/kobsio/kobs/pkg/hub/middleware/userauth/context"
	"github.com/kobsio/kobs/pkg/middleware/errresponse"

	"github.com/go-chi/chi/v5/middleware"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/propagation"
)

// doRequest runs a http request against the given url with the given client. It decodes the returned result in the
// specified type and returns it. if the response code is not 200 it returns an error.
func doRequest[T any](ctx context.Context, user *authContext.User, client *http.Client, url, token string) (T, error) {
	var result T

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return result, err
	}

	otel.GetTextMapPropagator().Inject(ctx, propagation.HeaderCarrier(req.Header))
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))
	if user != nil {
		req.Header.Set("x-kobs-user", user.ToString())
	} else {
		req.Header.Set("x-kobs-user", "{\"email\": \"\"}")
	}
	if requestID := middleware.GetReqID(ctx); requestID != "" {
		req.Header.Set("requestID", requestID)
	}

	resp, err := client.Do(req)
	if err != nil {
		return result, err
	}

	defer resp.Body.Close()

	if resp.StatusCode == 200 {
		if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
			return result, err
		}

		return result, nil
	}

	var res errresponse.ErrResponse
	if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
		return result, err
	}

	return result, fmt.Errorf("%s", res.Error)
}
