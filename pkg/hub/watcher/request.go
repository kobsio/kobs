package watcher

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	applicationv1 "github.com/kobsio/kobs/pkg/kube/apis/application/v1"
	dashboardv1 "github.com/kobsio/kobs/pkg/kube/apis/dashboard/v1"
	teamv1 "github.com/kobsio/kobs/pkg/kube/apis/team/v1"
	userv1 "github.com/kobsio/kobs/pkg/kube/apis/user/v1"
	"github.com/kobsio/kobs/pkg/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/satellite/plugins/plugin"
)

type resource interface {
	plugin.Instance | string | applicationv1.ApplicationSpec | dashboardv1.DashboardSpec | teamv1.TeamSpec | userv1.UserSpec
}

// doRequest runs a http request against the given url with the given client. It decodes the returned result in the
// specified type and returns it. if the response code is not 200 it returns an error.
func doRequest[T resource](ctx context.Context, client *http.Client, url, token string) ([]T, error) {
	if ctx == nil {
		return nil, fmt.Errorf("context is nil")
	}

	reqCtx, reqCancel := context.WithTimeout(ctx, 30*time.Second)
	defer reqCancel()

	req, err := http.NewRequestWithContext(reqCtx, http.MethodGet, url, nil)
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
