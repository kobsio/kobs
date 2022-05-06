package satellite

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/kobsio/kobs/pkg/middleware/errresponse"
)

// doRequest runs a http request against the given url with the given client. It decodes the returned result in the
// specified type and returns it. if the response code is not 200 it returns an error.
func doRequest[T any](ctx context.Context, client *http.Client, url, token string) ([]T, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Add("Authorization", fmt.Sprintf("Bearer %s", token))
	req.Header.Add("x-kobs-user", "{\"id\": \"TODO\"}")

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()

	if resp.StatusCode == 200 {
		var res []T
		if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
			return nil, err
		}

		return res, nil
	}

	var res errresponse.ErrResponse
	if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
		return nil, err
	}

	return nil, fmt.Errorf("%s", res.Error)
}
