package klogs

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/golang/mock/gomock"
	"github.com/kobsio/kobs/pkg/utils"
	"github.com/stretchr/testify/require"
)

func Test_getInstance(t *testing.T) {
	t.Run("should return instance by name", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		instance := NewMockInstance(ctrl)
		router := Router{
			instances: []Instance{instance},
		}

		instance.EXPECT().GetName().Return("instance-name")
		require.NotNil(t, router.getInstance("instance-name"))
	})

	t.Run("should return default instance", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		instance := NewMockInstance(ctrl)
		router := Router{
			instances: []Instance{instance},
		}

		instance.EXPECT().GetName().Return("")
		require.NotNil(t, router.getInstance("default"))
	})
}

func Test_router_getFields(t *testing.T) {
	t.Run("should return instance by name", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		instance := NewMockInstance(ctrl)
		instance.EXPECT().GetName().Return("instance")
		instance.EXPECT().GetFields("my-filter", "my-field-type").Return([]string{"field_1", "field_2"})
		router := Router{
			instances: []Instance{instance},
		}

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/fields?filter=my-filter&fieldType=my-field-type", nil)
		req.Header.Add("x-kobs-plugin", "instance")
		w := httptest.NewRecorder()

		router.getFields(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `["field_1", "field_2"]`)
	})

	t.Run("should handle unknown instance", func(t *testing.T) {
		router := Router{
			instances: []Instance{},
		}

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/fields?filter=my-filter&fieldType=my-field-type", nil)
		w := httptest.NewRecorder()

		router.getFields(w, req)
		utils.AssertStatusEq(t, w, http.StatusBadRequest)
	})
}

func Test_getLogs(t *testing.T) {
	t.Run("should respond with the logs result", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		instance := NewMockInstance(ctrl)
		router := Router{
			instances: []Instance{instance},
		}

		timeEnd := time.Now()
		timeStart := timeEnd.Add(-30 * time.Minute)
		path := fmt.Sprintf("/logs?timeStart=%d&timeEnd=%d", timeStart.Unix(), timeEnd.Unix())
		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, path, nil)
		req.Header.Add("x-kobs-plugin", "instance")
		w := httptest.NewRecorder()

		instance.EXPECT().GetName().Return("instance")
		instance.EXPECT().GetLogs(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), int64(1000), timeStart.Unix(), timeEnd.Unix()).Return(
			[]map[string]any{{"namespace": "kube-system"}}, []string{"namespace"}, int64(1), int64(1), []Bucket{{}}, nil,
		)
		router.getLogs(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `{"documents":[{"namespace":"kube-system"}],"fields":["namespace"],"count":1,"took":1,"buckets":[{"interval":0,"count":0}]}`)
	})

	t.Run("should handle error from instance.GetLogs", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		instance := NewMockInstance(ctrl)
		router := Router{
			instances: []Instance{instance},
		}

		timeEnd := time.Now()
		timeStart := timeEnd.Add(-30 * time.Minute)
		path := fmt.Sprintf("/logs?timeStart=%d&timeEnd=%d", timeStart.Unix(), timeEnd.Unix())
		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, path, nil)
		req.Header.Add("x-kobs-plugin", "instance")
		w := httptest.NewRecorder()

		instance.EXPECT().GetName().Return("instance")
		instance.EXPECT().GetLogs(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), int64(1000), timeStart.Unix(), timeEnd.Unix()).Return(
			[]map[string]any{}, []string{}, int64(0), int64(0), []Bucket{}, fmt.Errorf("unexpected error"),
		)
		router.getLogs(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors":["Could not get logs"]}`)
	})

	t.Run("should handle unknown instance", func(t *testing.T) {
		router := Router{
			instances: []Instance{},
		}

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/logs", nil)
		w := httptest.NewRecorder()

		router.getLogs(w, req)
		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors":["Could not find instance name"]}`)
	})

	t.Run("should handle invalid timeStart", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		instance := NewMockInstance(ctrl)
		router := Router{
			instances: []Instance{instance},
		}

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/logs?timeStart=invalid", nil)
		req.Header.Add("x-kobs-plugin", "instance")
		w := httptest.NewRecorder()

		instance.EXPECT().GetName().Return("instance")
		router.getLogs(w, req)
		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors":["Could not parse start time"]}`)
	})

	t.Run("should handle invalid timeEnd", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		instance := NewMockInstance(ctrl)
		router := Router{
			instances: []Instance{instance},
		}

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/logs?timeStart=1000&timeEnd=invalid", nil)
		req.Header.Add("x-kobs-plugin", "instance")
		w := httptest.NewRecorder()

		instance.EXPECT().GetName().Return("instance")
		router.getLogs(w, req)
		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors":["Could not parse end time"]}`)
	})
}

func Test_getAggregation(t *testing.T) {
	t.Run("should respond with the aggregation result", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		instance := NewMockInstance(ctrl)
		router := Router{
			instances: []Instance{instance},
		}

		timeEnd := time.Now()
		timeStart := timeEnd.Add(-30 * time.Minute)
		aggregation := Aggregation{
			Query: "namespace='kube-system",
			Chart: "area",
			Times: AggregationTimes{
				TimeStart: timeStart.Unix(),
				TimeEnd:   timeEnd.Unix(),
			},
			Options: AggregationOptions{},
		}

		var body bytes.Buffer
		require.NoError(t, json.NewEncoder(&body).Encode(aggregation))
		req, _ := http.NewRequest(http.MethodGet, "/aggregation", &body)
		req.Header.Add("x-kobs-plugin", "instance")
		w := httptest.NewRecorder()

		instance.EXPECT().GetName().Return("instance")

		instance.EXPECT().GetAggregation(gomock.Any(), aggregation).Return(
			[]map[string]any{{"foo": "bar"}}, []string{"foo"}, nil,
		)
		router.getAggregation(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `{"rows":[{"foo":"bar"}],"columns":["foo"]}`)
	})

	t.Run("should handle unknown instance", func(t *testing.T) {
		router := Router{
			instances: []Instance{},
		}

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/aggregation", nil)
		w := httptest.NewRecorder()

		router.getAggregation(w, req)
		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors":["Could not find instance name"]}`)
	})

	t.Run("should handle invalid aggregation body", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		instance := NewMockInstance(ctrl)
		router := Router{
			instances: []Instance{instance},
		}

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/aggregation", strings.NewReader(`{query: 1}`))
		req.Header.Add("x-kobs-plugin", "instance")
		w := httptest.NewRecorder()

		instance.EXPECT().GetName().Return("instance")
		router.getAggregation(w, req)
		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors":["Could not decode request body"]}`)
	})

	t.Run("should handle error in instance.GetAggregation", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		instance := NewMockInstance(ctrl)
		router := Router{
			instances: []Instance{instance},
		}

		req, _ := http.NewRequest(http.MethodGet, "/aggregation", strings.NewReader(`{}`))
		req.Header.Add("x-kobs-plugin", "instance")
		w := httptest.NewRecorder()
		instance.EXPECT().GetName().Return("instance")

		instance.EXPECT().GetAggregation(gomock.Any(), gomock.Any()).Return(
			[]map[string]any{}, []string{}, fmt.Errorf("unexpected error"),
		)
		router.getAggregation(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors":["Error while running aggregation"]}`)
	})
}
