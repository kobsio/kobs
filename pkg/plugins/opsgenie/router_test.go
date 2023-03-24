package opsgenie

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	authContext "github.com/kobsio/kobs/pkg/hub/auth/context"
	"github.com/kobsio/kobs/pkg/plugins/opsgenie/instance"
	"github.com/kobsio/kobs/pkg/plugins/plugin"
	"github.com/kobsio/kobs/pkg/utils"

	"github.com/go-chi/chi/v5"
	"github.com/golang/mock/gomock"
	"github.com/opsgenie/opsgenie-go-sdk-v2/alert"
	"github.com/opsgenie/opsgenie-go-sdk-v2/incident"
	"github.com/stretchr/testify/require"
)

func TestGetInstance(t *testing.T) {
	t.Run("should return default instance", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		mockInstance.EXPECT().GetName().Return("opsgenie")

		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
		instance := router.getInstance("default")
		require.NotNil(t, instance)
	})

	t.Run("should return instance by name", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		mockInstance.EXPECT().GetName().Return("opsgenie")

		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
		instance := router.getInstance("opsgenie")
		require.NotNil(t, instance)
	})

	t.Run("should return nil for invalid name", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		mockInstance.EXPECT().GetName().Return("opsgenie")

		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
		instance := router.getInstance("invalidname")
		require.Nil(t, instance)
	})
}

func TestGetAlerts(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, Router) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}

		return mockInstance, router
	}

	t.Run("should fail for invalid instance name", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("opsgenie")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/alerts", nil)
		req.Header.Set("x-kobs-plugin", "invalidname")
		w := httptest.NewRecorder()

		router.getAlerts(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid plugin instance"]}`)
	})

	t.Run("should fail when instance returns an error", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("opsgenie")
		i.EXPECT().GetAlerts(gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/alerts", nil)
		req.Header.Set("x-kobs-plugin", "opsgenie")
		w := httptest.NewRecorder()

		router.getAlerts(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get alerts"]}`)
	})

	t.Run("should return alerts", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("opsgenie")
		i.EXPECT().GetAlerts(gomock.Any(), gomock.Any()).Return(&alert.ListAlertResult{Alerts: nil}, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/alerts", nil)
		req.Header.Set("x-kobs-plugin", "opsgenie")
		w := httptest.NewRecorder()

		router.getAlerts(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `null`)
	})
}

func TestGetAlertDetails(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, Router) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}

		return mockInstance, router
	}

	t.Run("should fail for invalid instance name", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("opsgenie")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/alert/details", nil)
		req.Header.Set("x-kobs-plugin", "invalidname")
		w := httptest.NewRecorder()

		router.getAlertDetails(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid plugin instance"]}`)
	})

	t.Run("should fail when instance returns an error", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("opsgenie")
		i.EXPECT().GetAlertDetails(gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/alert/details", nil)
		req.Header.Set("x-kobs-plugin", "opsgenie")
		w := httptest.NewRecorder()

		router.getAlertDetails(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get alert details"]}`)
	})

	t.Run("should return alert details", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("opsgenie")
		i.EXPECT().GetAlertDetails(gomock.Any(), gomock.Any()).Return(nil, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/alert/details", nil)
		req.Header.Set("x-kobs-plugin", "opsgenie")
		w := httptest.NewRecorder()

		router.getAlertDetails(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `null`)
	})
}

func TestGetAlertLogs(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, Router) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}

		return mockInstance, router
	}

	t.Run("should fail for invalid instance name", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("opsgenie")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/alert/logs", nil)
		req.Header.Set("x-kobs-plugin", "invalidname")
		w := httptest.NewRecorder()

		router.getAlertLogs(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid plugin instance"]}`)
	})

	t.Run("should fail when instance returns an error", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("opsgenie")
		i.EXPECT().GetAlertLogs(gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/alert/logs", nil)
		req.Header.Set("x-kobs-plugin", "opsgenie")
		w := httptest.NewRecorder()

		router.getAlertLogs(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get alert logs"]}`)
	})

	t.Run("should return alert logs", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("opsgenie")
		i.EXPECT().GetAlertLogs(gomock.Any(), gomock.Any()).Return(&alert.ListAlertLogsResult{AlertLog: nil}, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/alert/logs", nil)
		req.Header.Set("x-kobs-plugin", "opsgenie")
		w := httptest.NewRecorder()

		router.getAlertLogs(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `null`)
	})
}

func TestGetAlertNotes(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, Router) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}

		return mockInstance, router
	}

	t.Run("should fail for invalid instance name", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("opsgenie")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/alert/notes", nil)
		req.Header.Set("x-kobs-plugin", "invalidname")
		w := httptest.NewRecorder()

		router.getAlertNotes(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid plugin instance"]}`)
	})

	t.Run("should fail when instance returns an error", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("opsgenie")
		i.EXPECT().GetAlertNotes(gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/alert/notes", nil)
		req.Header.Set("x-kobs-plugin", "opsgenie")
		w := httptest.NewRecorder()

		router.getAlertNotes(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get alert notes"]}`)
	})

	t.Run("should return alert notes", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("opsgenie")
		i.EXPECT().GetAlertNotes(gomock.Any(), gomock.Any()).Return(&alert.ListAlertNotesResult{AlertLog: nil}, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/alert/notes", nil)
		req.Header.Set("x-kobs-plugin", "opsgenie")
		w := httptest.NewRecorder()

		router.getAlertNotes(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `null`)
	})
}

func TestGetIncidents(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, Router) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}

		return mockInstance, router
	}

	t.Run("should fail for invalid instance name", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("opsgenie")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/incidents", nil)
		req.Header.Set("x-kobs-plugin", "invalidname")
		w := httptest.NewRecorder()

		router.getIncidents(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid plugin instance"]}`)
	})

	t.Run("should fail when instance returns an error", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("opsgenie")
		i.EXPECT().GetIncidents(gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/incidents", nil)
		req.Header.Set("x-kobs-plugin", "opsgenie")
		w := httptest.NewRecorder()

		router.getIncidents(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get incidents"]}`)
	})

	t.Run("should return incidents", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("opsgenie")
		i.EXPECT().GetIncidents(gomock.Any(), gomock.Any()).Return(&incident.ListResult{Incidents: nil}, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/incidents", nil)
		req.Header.Set("x-kobs-plugin", "opsgenie")
		w := httptest.NewRecorder()

		router.getIncidents(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `null`)
	})
}

func TestGetIncidentLogs(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, Router) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}

		return mockInstance, router
	}

	t.Run("should fail for invalid instance name", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("opsgenie")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/incident/logs", nil)
		req.Header.Set("x-kobs-plugin", "invalidname")
		w := httptest.NewRecorder()

		router.getIncidentLogs(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid plugin instance"]}`)
	})

	t.Run("should fail when instance returns an error", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("opsgenie")
		i.EXPECT().GetIncidentLogs(gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/incident/logs", nil)
		req.Header.Set("x-kobs-plugin", "opsgenie")
		w := httptest.NewRecorder()

		router.getIncidentLogs(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get incident logs"]}`)
	})

	t.Run("should return incident logs", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("opsgenie")
		i.EXPECT().GetIncidentLogs(gomock.Any(), gomock.Any()).Return(&incident.ListLogsResult{Logs: nil}, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/incident/logs", nil)
		req.Header.Set("x-kobs-plugin", "opsgenie")
		w := httptest.NewRecorder()

		router.getIncidentLogs(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `null`)
	})
}

func TestGetIncidentNotes(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, Router) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}

		return mockInstance, router
	}

	t.Run("should fail for invalid instance name", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("opsgenie")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/incident/notes", nil)
		req.Header.Set("x-kobs-plugin", "invalidname")
		w := httptest.NewRecorder()

		router.getIncidentNotes(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid plugin instance"]}`)
	})

	t.Run("should fail when instance returns an error", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("opsgenie")
		i.EXPECT().GetIncidentNotes(gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/incident/notes", nil)
		req.Header.Set("x-kobs-plugin", "opsgenie")
		w := httptest.NewRecorder()

		router.getIncidentNotes(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get incident notes"]}`)
	})

	t.Run("should return incident notes", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("opsgenie")
		i.EXPECT().GetIncidentNotes(gomock.Any(), gomock.Any()).Return(&incident.ListNotesResult{Notes: nil}, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/incident/notes", nil)
		req.Header.Set("x-kobs-plugin", "opsgenie")
		w := httptest.NewRecorder()

		router.getIncidentNotes(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `null`)
	})
}

func TestGetIncidentTimeline(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, Router) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}

		return mockInstance, router
	}

	t.Run("should fail for invalid instance name", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("opsgenie")

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/incident/timeline", nil)
		req.Header.Set("x-kobs-plugin", "invalidname")
		w := httptest.NewRecorder()

		router.getIncidentTimeline(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid plugin instance"]}`)
	})

	t.Run("should fail when instance returns an error", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("opsgenie")
		i.EXPECT().GetIncidentTimeline(gomock.Any(), gomock.Any()).Return(nil, fmt.Errorf("unexpected error"))

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/incident/timeline", nil)
		req.Header.Set("x-kobs-plugin", "opsgenie")
		w := httptest.NewRecorder()

		router.getIncidentTimeline(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to get incident timeline"]}`)
	})

	t.Run("should return incident timeline", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("opsgenie")
		i.EXPECT().GetIncidentTimeline(gomock.Any(), gomock.Any()).Return(nil, nil)

		req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, "/incident/timeline", nil)
		req.Header.Set("x-kobs-plugin", "opsgenie")
		w := httptest.NewRecorder()

		router.getIncidentTimeline(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `null`)
	})
}

func TestAcknowledgeAlert(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, Router) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}

		return mockInstance, router
	}

	t.Run("should fail for invalid instance name", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("opsgenie")

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{ID: "userid"})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/alert/acknowledge", nil)
		req.Header.Set("x-kobs-plugin", "invalidname")
		w := httptest.NewRecorder()

		router.acknowledgeAlert(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid plugin instance"]}`)
	})

	t.Run("should fail when instance returns an error", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("opsgenie")
		i.EXPECT().AcknowledgeAlert(gomock.Any(), gomock.Any(), gomock.Any()).Return(fmt.Errorf("unexpected error"))

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{ID: "userid"})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/alert/acknowledge", nil)
		req.Header.Set("x-kobs-plugin", "opsgenie")
		w := httptest.NewRecorder()

		router.acknowledgeAlert(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to acknowledge alert"]}`)
	})

	t.Run("should return acknowledge alert", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("opsgenie")
		i.EXPECT().AcknowledgeAlert(gomock.Any(), gomock.Any(), gomock.Any()).Return(nil)

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{ID: "userid"})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/alert/acknowledge", nil)
		req.Header.Set("x-kobs-plugin", "opsgenie")
		w := httptest.NewRecorder()

		router.acknowledgeAlert(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `null`)
	})
}

func TestSnoozeAlert(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, Router) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}

		return mockInstance, router
	}

	t.Run("should fail for invalid instance name", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("opsgenie")

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{ID: "userid"})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/alert/snooze", nil)
		req.Header.Set("x-kobs-plugin", "invalidname")
		w := httptest.NewRecorder()

		router.snoozeAlert(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid plugin instance"]}`)
	})

	t.Run("should fail for invalid snooze parameter", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("opsgenie")

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{ID: "userid"})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/alert/snooze", nil)
		req.Header.Set("x-kobs-plugin", "opsgenie")
		w := httptest.NewRecorder()

		router.snoozeAlert(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to parse snooze parameter"]}`)
	})

	t.Run("should fail when instance returns an error", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("opsgenie")
		i.EXPECT().SnoozeAlert(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(fmt.Errorf("unexpected error"))

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{ID: "userid"})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/alert/snooze?snooze=15m", nil)
		req.Header.Set("x-kobs-plugin", "opsgenie")
		w := httptest.NewRecorder()

		router.snoozeAlert(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to snooze alert"]}`)
	})

	t.Run("should return snooze alert", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("opsgenie")
		i.EXPECT().SnoozeAlert(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(nil)

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{ID: "userid"})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/alert/snooze?snooze=15m", nil)
		req.Header.Set("x-kobs-plugin", "opsgenie")
		w := httptest.NewRecorder()

		router.snoozeAlert(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `null`)
	})
}

func TestCloseAlert(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, Router) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}

		return mockInstance, router
	}

	t.Run("should fail for invalid instance name", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("opsgenie")

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{ID: "userid"})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/alert/close", nil)
		req.Header.Set("x-kobs-plugin", "invalidname")
		w := httptest.NewRecorder()

		router.closeAlert(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid plugin instance"]}`)
	})

	t.Run("should fail when instance returns an error", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("opsgenie")
		i.EXPECT().CloseAlert(gomock.Any(), gomock.Any(), gomock.Any()).Return(fmt.Errorf("unexpected error"))

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{ID: "userid"})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/alert/close", nil)
		req.Header.Set("x-kobs-plugin", "opsgenie")
		w := httptest.NewRecorder()

		router.closeAlert(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to close alert"]}`)
	})

	t.Run("should return close alert", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("opsgenie")
		i.EXPECT().CloseAlert(gomock.Any(), gomock.Any(), gomock.Any()).Return(nil)

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{ID: "userid"})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/alert/close", nil)
		req.Header.Set("x-kobs-plugin", "opsgenie")
		w := httptest.NewRecorder()

		router.closeAlert(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `null`)
	})
}

func TestResolveIncident(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, Router) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}

		return mockInstance, router
	}

	t.Run("should fail for invalid instance name", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("opsgenie")

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{ID: "userid"})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/incident/resolve", nil)
		req.Header.Set("x-kobs-plugin", "invalidname")
		w := httptest.NewRecorder()

		router.resolveIncident(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid plugin instance"]}`)
	})

	t.Run("should fail when instance returns an error", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("opsgenie")
		i.EXPECT().ResolveIncident(gomock.Any(), gomock.Any(), gomock.Any()).Return(fmt.Errorf("unexpected error"))

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{ID: "userid"})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/incident/resolve", nil)
		req.Header.Set("x-kobs-plugin", "opsgenie")
		w := httptest.NewRecorder()

		router.resolveIncident(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to resolve incident"]}`)
	})

	t.Run("should return resolve incident", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("opsgenie")
		i.EXPECT().ResolveIncident(gomock.Any(), gomock.Any(), gomock.Any()).Return(nil)

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{ID: "userid"})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/incident/resolve", nil)
		req.Header.Set("x-kobs-plugin", "opsgenie")
		w := httptest.NewRecorder()

		router.resolveIncident(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `null`)
	})
}

func TestCloseIncident(t *testing.T) {
	var newRouter = func(t *testing.T) (*instance.MockInstance, Router) {
		ctrl := gomock.NewController(t)
		mockInstance := instance.NewMockInstance(ctrl)
		router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}

		return mockInstance, router
	}

	t.Run("should fail for invalid instance name", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("opsgenie")

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{ID: "userid"})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/incident/close", nil)
		req.Header.Set("x-kobs-plugin", "invalidname")
		w := httptest.NewRecorder()

		router.closeIncident(w, req)

		utils.AssertStatusEq(t, w, http.StatusBadRequest)
		utils.AssertJSONEq(t, w, `{"errors": ["Invalid plugin instance"]}`)
	})

	t.Run("should fail when instance returns an error", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("opsgenie")
		i.EXPECT().CloseIncident(gomock.Any(), gomock.Any(), gomock.Any()).Return(fmt.Errorf("unexpected error"))

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{ID: "userid"})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/incident/close", nil)
		req.Header.Set("x-kobs-plugin", "opsgenie")
		w := httptest.NewRecorder()

		router.closeIncident(w, req)

		utils.AssertStatusEq(t, w, http.StatusInternalServerError)
		utils.AssertJSONEq(t, w, `{"errors": ["Failed to close incident"]}`)
	})

	t.Run("should return close incident", func(t *testing.T) {
		i, router := newRouter(t)
		i.EXPECT().GetName().Return("opsgenie")
		i.EXPECT().CloseIncident(gomock.Any(), gomock.Any(), gomock.Any()).Return(nil)

		ctx := context.Background()
		ctx = context.WithValue(ctx, authContext.UserKey, authContext.User{ID: "userid"})
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "/incident/close", nil)
		req.Header.Set("x-kobs-plugin", "opsgenie")
		w := httptest.NewRecorder()

		router.closeIncident(w, req)

		utils.AssertStatusEq(t, w, http.StatusOK)
		utils.AssertJSONEq(t, w, `null`)
	})
}

func TestMount(t *testing.T) {
	t.Run("should return error for invalid instance", func(t *testing.T) {
		router, err := Mount([]plugin.Instance{{Name: "opsgenie"}})
		require.Error(t, err)
		require.Nil(t, router)
	})

	t.Run("should work", func(t *testing.T) {
		router, err := Mount([]plugin.Instance{{Name: "opsgenie", Options: map[string]any{"apiKey": "invalid"}}})
		require.NoError(t, err)
		require.NotNil(t, router)
	})
}
