package instance

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
)

// doRequest runs a http request against the given url with the given client. It decodes the returned result in the
// specified type and returns it. if the response code is not 200 it returns an error.
func doRequest[T any](ctx context.Context, client *http.Client, url string) (T, int64, error) {
	var result T

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return result, 0, err
	}

	req.Header.Set("X-Accept-Vulnerabilities", "application/vnd.security.vulnerability.report; version=1.1, application/vnd.scanner.adapter.vuln.report.harbor+json; version=1.0")

	resp, err := client.Do(req)
	if err != nil {
		return result, 0, err
	}

	defer resp.Body.Close()

	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
			return result, 0, err
		}

		// Harbor returns the total number of projects, repositories, etc. for pagination via the "x-total-count"
		// header.
		total := resp.Header.Get("x-total-count")
		if total == "" {
			return result, 0, nil
		}

		totalParsed, err := strconv.ParseInt(total, 10, 64)
		if err != nil {
			return result, 0, err
		}

		return result, totalParsed, nil
	}

	var res ResponseError
	if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
		return result, 0, err
	}

	if len(res.Errors) > 0 {
		return result, 0, fmt.Errorf(res.Errors[0].Message)
	}

	return result, 0, fmt.Errorf("%v", res)
}
