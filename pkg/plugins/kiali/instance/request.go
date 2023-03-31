package instance

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5/middleware"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/propagation"
)

// doRequest runs a http request against the given url with the given client. It decodes the returned result in the
// specified type and returns it. if the response code is not 200 it returns an error.
func doRequest[T any](ctx context.Context, client *http.Client, url string) (T, error) {
	var result T

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return result, err
	}

	otel.GetTextMapPropagator().Inject(ctx, propagation.HeaderCarrier(req.Header))
	if requestID := middleware.GetReqID(ctx); requestID != "" {
		req.Header.Set("requestID", requestID)
	}

	resp, err := client.Do(req)
	if err != nil {
		return result, err
	}

	defer resp.Body.Close()

	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
			return result, err
		}

		return result, nil
	}

	var res ResponseError
	if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
		return result, err
	}

	if len(res.Errors) > 0 {
		return result, fmt.Errorf(res.Errors[0].Message)
	}

	return result, fmt.Errorf("%v", res)
}
