package opsgenie

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	authContext "github.com/kobsio/kobs/pkg/api/middleware/auth/context"
	"github.com/kobsio/kobs/pkg/api/plugins/plugin"
	"github.com/kobsio/kobs/plugins/opsgenie/pkg/instance"

	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

var testConfig = Config{
	{
		Name:        "opsgenie",
		DisplayName: "Opsgenie",
		Description: "On-call and alert management to keep services always on.",
		APIKey:      "test",
		APIUrl:      "api.eu.opsgenie.com",
	},
}

func Test(t *testing.T) {
	for _, tt := range []struct {
		name               string
		url                string
		expectedStatusCode int
		expectedBody       string
		prepare            func(mockInstance *instance.MockInstance)
		do                 func(router Router, w *httptest.ResponseRecorder, req *http.Request)
	}{
		// getAlerts
		{
			name:               "getAlerts: invalid instance name",
			url:                "/invalidname/alerts",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not find instance name\"}\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("opsgenie")
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getAlerts(w, req)
			},
		},
		{
			name:               "getAlerts: error request",
			url:                "/opsgenie/alerts",
			expectedStatusCode: http.StatusInternalServerError,
			expectedBody:       "{\"error\":\"Could not get alerts: bad request\"}\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("opsgenie")
				mockInstance.On("GetAlerts", mock.Anything, "").Return(nil, fmt.Errorf("bad request"))
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getAlerts(w, req)
			},
		},
		{
			name:               "getAlerts: success request",
			url:                "/opsgenie/alerts",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "null\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("opsgenie")
				mockInstance.On("GetAlerts", mock.Anything, "").Return(nil, nil)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getAlerts(w, req)
			},
		},

		// getAlertDetails
		{
			name:               "getAlertDetails: invalid instance name",
			url:                "/invalidname/alert/details",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not find instance name\"}\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("opsgenie")
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getAlertDetails(w, req)
			},
		},
		{
			name:               "getAlertDetails: error request",
			url:                "/opsgenie/alert/details",
			expectedStatusCode: http.StatusInternalServerError,
			expectedBody:       "{\"error\":\"Could not get alert details: bad request\"}\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("opsgenie")
				mockInstance.On("GetAlertDetails", mock.Anything, "").Return(nil, fmt.Errorf("bad request"))
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getAlertDetails(w, req)
			},
		},
		{
			name:               "getAlertDetails: success request",
			url:                "/opsgenie/alert/details",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "null\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("opsgenie")
				mockInstance.On("GetAlertDetails", mock.Anything, "").Return(nil, nil)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getAlertDetails(w, req)
			},
		},

		// getAlertLogs
		{
			name:               "getAlertLogs: invalid instance name",
			url:                "/invalidname/alert/logs",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not find instance name\"}\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("opsgenie")
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getAlertLogs(w, req)
			},
		},
		{
			name:               "getAlertLogs: error request",
			url:                "/opsgenie/alert/logs",
			expectedStatusCode: http.StatusInternalServerError,
			expectedBody:       "{\"error\":\"Could not get alert logs: bad request\"}\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("opsgenie")
				mockInstance.On("GetAlertLogs", mock.Anything, "").Return(nil, fmt.Errorf("bad request"))
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getAlertLogs(w, req)
			},
		},
		{
			name:               "getAlertLogs: success request",
			url:                "/opsgenie/alert/logs",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "null\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("opsgenie")
				mockInstance.On("GetAlertLogs", mock.Anything, "").Return(nil, nil)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getAlertLogs(w, req)
			},
		},

		// getAlertNotes
		{
			name:               "getAlertNotes: invalid instance name",
			url:                "/invalidname/alert/notes",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not find instance name\"}\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("opsgenie")
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getAlertNotes(w, req)
			},
		},
		{
			name:               "getAlertNotes: error request",
			url:                "/opsgenie/alert/notes",
			expectedStatusCode: http.StatusInternalServerError,
			expectedBody:       "{\"error\":\"Could not get alert notes: bad request\"}\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("opsgenie")
				mockInstance.On("GetAlertNotes", mock.Anything, "").Return(nil, fmt.Errorf("bad request"))
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getAlertNotes(w, req)
			},
		},
		{
			name:               "getAlertNotes: success request",
			url:                "/opsgenie/alert/notes",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "null\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("opsgenie")
				mockInstance.On("GetAlertNotes", mock.Anything, "").Return(nil, nil)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getAlertNotes(w, req)
			},
		},

		// getIncidents
		{
			name:               "getIncidents: invalid instance name",
			url:                "/invalidname/incidents",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not find instance name\"}\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("opsgenie")
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getIncidents(w, req)
			},
		},
		{
			name:               "getIncidents: error request",
			url:                "/opsgenie/incidents",
			expectedStatusCode: http.StatusInternalServerError,
			expectedBody:       "{\"error\":\"Could not get incidents: bad request\"}\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("opsgenie")
				mockInstance.On("GetIncidents", mock.Anything, "").Return(nil, fmt.Errorf("bad request"))
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getIncidents(w, req)
			},
		},
		{
			name:               "getIncidents: success request",
			url:                "/opsgenie/incidents",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "null\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("opsgenie")
				mockInstance.On("GetIncidents", mock.Anything, "").Return(nil, nil)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getIncidents(w, req)
			},
		},

		// getIncidentLogs
		{
			name:               "getIncidentLogs: invalid instance name",
			url:                "/invalidname/incident/logs",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not find instance name\"}\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("opsgenie")
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getIncidentLogs(w, req)
			},
		},
		{
			name:               "getIncidentLogs: error request",
			url:                "/opsgenie/incident/logs",
			expectedStatusCode: http.StatusInternalServerError,
			expectedBody:       "{\"error\":\"Could not get incident logs: bad request\"}\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("opsgenie")
				mockInstance.On("GetIncidentLogs", mock.Anything, "").Return(nil, fmt.Errorf("bad request"))
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getIncidentLogs(w, req)
			},
		},
		{
			name:               "getIncidentLogs: success request",
			url:                "/opsgenie/incident/logs",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "null\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("opsgenie")
				mockInstance.On("GetIncidentLogs", mock.Anything, "").Return(nil, nil)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getIncidentLogs(w, req)
			},
		},

		// getIncidentNotes
		{
			name:               "getIncidentNotes: invalid instance name",
			url:                "/invalidname/incident/notes",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not find instance name\"}\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("opsgenie")
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getIncidentNotes(w, req)
			},
		},
		{
			name:               "getIncidentNotes: error request",
			url:                "/opsgenie/incident/notes",
			expectedStatusCode: http.StatusInternalServerError,
			expectedBody:       "{\"error\":\"Could not get incident notes: bad request\"}\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("opsgenie")
				mockInstance.On("GetIncidentNotes", mock.Anything, "").Return(nil, fmt.Errorf("bad request"))
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getIncidentNotes(w, req)
			},
		},
		{
			name:               "getIncidentNotes: success request",
			url:                "/opsgenie/incident/notes",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "null\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("opsgenie")
				mockInstance.On("GetIncidentNotes", mock.Anything, "").Return(nil, nil)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getIncidentNotes(w, req)
			},
		},

		// getIncidentTimeline
		{
			name:               "getIncidentTimeline: invalid instance name",
			url:                "/invalidname/incident/timeline",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not find instance name\"}\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("opsgenie")
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getIncidentTimeline(w, req)
			},
		},
		{
			name:               "getIncidentTimeline: error request",
			url:                "/opsgenie/incident/timeline",
			expectedStatusCode: http.StatusInternalServerError,
			expectedBody:       "{\"error\":\"Could not get incident timeline: bad request\"}\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("opsgenie")
				mockInstance.On("GetIncidentTimeline", mock.Anything, "").Return(nil, fmt.Errorf("bad request"))
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getIncidentTimeline(w, req)
			},
		},
		{
			name:               "getIncidentTimeline: success request",
			url:                "/opsgenie/incident/timeline",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "null\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("opsgenie")
				mockInstance.On("GetIncidentTimeline", mock.Anything, "").Return(nil, nil)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getIncidentTimeline(w, req)
			},
		},

		// acknowledgeAlert
		{
			name:               "acknowledgeAlert: invalid instance name",
			url:                "/invalidname/alert/acknowledge",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not find instance name\"}\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("opsgenie")
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.acknowledgeAlert(w, req)
			},
		},
		{
			name:               "acknowledgeAlert: no user context",
			url:                "/opsgenie/alert/acknowledge",
			expectedStatusCode: http.StatusUnauthorized,
			expectedBody:       "{\"error\":\"You are not authorized to acknowledge the alert: Unauthorized\"}\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("opsgenie")
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.acknowledgeAlert(w, req)
			},
		},
		{
			name:               "acknowledgeAlert: check permissions fails",
			url:                "/opsgenie/alert/acknowledge",
			expectedStatusCode: http.StatusForbidden,
			expectedBody:       "{\"error\":\"You are not allowed to acknowledge alerts: access forbidden\"}\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("opsgenie")
				mockInstance.On("CheckPermissions", mock.Anything, mock.Anything, "acknowledgeAlert").Return(fmt.Errorf("access forbidden"))
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.acknowledgeAlert(w, req)
			},
		},
		{
			name:               "acknowledgeAlert: error request",
			url:                "/opsgenie/alert/acknowledge",
			expectedStatusCode: http.StatusInternalServerError,
			expectedBody:       "{\"error\":\"Could not acknowledge alert: bad request\"}\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("opsgenie")
				mockInstance.On("CheckPermissions", mock.Anything, mock.Anything, "acknowledgeAlert").Return(nil)
				mockInstance.On("AcknowledgeAlert", mock.Anything, "", "").Return(fmt.Errorf("bad request"))
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.acknowledgeAlert(w, req)
			},
		},
		{
			name:               "acknowledgeAlert: success request",
			url:                "/opsgenie/alert/acknowledge",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "null\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("opsgenie")
				mockInstance.On("CheckPermissions", mock.Anything, mock.Anything, "acknowledgeAlert").Return(nil)
				mockInstance.On("AcknowledgeAlert", mock.Anything, "", "").Return(nil)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.acknowledgeAlert(w, req)
			},
		},

		// snoozeAlert
		{
			name:               "snoozeAlert: invalid instance name",
			url:                "/invalidname/alert/snooze",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not find instance name\"}\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("opsgenie")
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.snoozeAlert(w, req)
			},
		},
		{
			name:               "snoozeAlert: no user context",
			url:                "/opsgenie/alert/snooze",
			expectedStatusCode: http.StatusUnauthorized,
			expectedBody:       "{\"error\":\"You are not authorized to snooze the alert: Unauthorized\"}\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("opsgenie")
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.snoozeAlert(w, req)
			},
		},
		{
			name:               "snoozeAlert: check permissions fails",
			url:                "/opsgenie/alert/snooze",
			expectedStatusCode: http.StatusForbidden,
			expectedBody:       "{\"error\":\"You are not allowed to snooze alerts: access forbidden\"}\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("opsgenie")
				mockInstance.On("CheckPermissions", mock.Anything, mock.Anything, "snoozeAlert").Return(fmt.Errorf("access forbidden"))
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.snoozeAlert(w, req)
			},
		},
		{
			name:               "snoozeAlert: could not parse parameter",
			url:                "/opsgenie/alert/snooze",
			expectedStatusCode: http.StatusInternalServerError,
			expectedBody:       "{\"error\":\"Could not parse snooze parameter: time: invalid duration \\\"\\\"\"}\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("opsgenie")
				mockInstance.On("CheckPermissions", mock.Anything, mock.Anything, "snoozeAlert").Return(nil)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.snoozeAlert(w, req)
			},
		},
		{
			name:               "snoozeAlert: error request",
			url:                "/opsgenie/alert/snooze?snooze=1m",
			expectedStatusCode: http.StatusInternalServerError,
			expectedBody:       "{\"error\":\"Could not snooze alert: bad request\"}\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("opsgenie")
				mockInstance.On("CheckPermissions", mock.Anything, mock.Anything, "snoozeAlert").Return(nil)
				mockInstance.On("SnoozeAlert", mock.Anything, "", "", 1*time.Minute).Return(fmt.Errorf("bad request"))
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.snoozeAlert(w, req)
			},
		},
		{
			name:               "snoozeAlert: success request",
			url:                "/opsgenie/alert/snooze?snooze=1m",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "null\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("opsgenie")
				mockInstance.On("CheckPermissions", mock.Anything, mock.Anything, "snoozeAlert").Return(nil)
				mockInstance.On("SnoozeAlert", mock.Anything, "", "", 1*time.Minute).Return(nil)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.snoozeAlert(w, req)
			},
		},

		// closeAlert
		{
			name:               "closeAlert: invalid instance name",
			url:                "/invalidname/alert/close",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not find instance name\"}\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("opsgenie")
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.closeAlert(w, req)
			},
		},
		{
			name:               "closeAlert: no user context",
			url:                "/opsgenie/alert/close",
			expectedStatusCode: http.StatusUnauthorized,
			expectedBody:       "{\"error\":\"You are not authorized to close the alert: Unauthorized\"}\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("opsgenie")
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.closeAlert(w, req)
			},
		},
		{
			name:               "closeAlert: check permissions fails",
			url:                "/opsgenie/alert/close",
			expectedStatusCode: http.StatusForbidden,
			expectedBody:       "{\"error\":\"You are not allowed to close alerts: access forbidden\"}\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("opsgenie")
				mockInstance.On("CheckPermissions", mock.Anything, mock.Anything, "closeAlert").Return(fmt.Errorf("access forbidden"))
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.closeAlert(w, req)
			},
		},
		{
			name:               "closeAlert: error request",
			url:                "/opsgenie/alert/close",
			expectedStatusCode: http.StatusInternalServerError,
			expectedBody:       "{\"error\":\"Could not close alert: bad request\"}\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("opsgenie")
				mockInstance.On("CheckPermissions", mock.Anything, mock.Anything, "closeAlert").Return(nil)
				mockInstance.On("CloseAlert", mock.Anything, "", "").Return(fmt.Errorf("bad request"))
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.closeAlert(w, req)
			},
		},
		{
			name:               "closeAlert: success request",
			url:                "/opsgenie/alert/close",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "null\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("opsgenie")
				mockInstance.On("CheckPermissions", mock.Anything, mock.Anything, "closeAlert").Return(nil)
				mockInstance.On("CloseAlert", mock.Anything, "", "").Return(nil)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.closeAlert(w, req)
			},
		},

		// resolveIncident
		{
			name:               "resolveIncident: invalid instance name",
			url:                "/invalidname/incident/resolve",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not find instance name\"}\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("opsgenie")
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.resolveIncident(w, req)
			},
		},
		{
			name:               "resolveIncident: no user context",
			url:                "/opsgenie/incident/resolve",
			expectedStatusCode: http.StatusUnauthorized,
			expectedBody:       "{\"error\":\"You are not authorized to resolve the incident: Unauthorized\"}\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("opsgenie")
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.resolveIncident(w, req)
			},
		},
		{
			name:               "resolveIncident: check permissions fails",
			url:                "/opsgenie/incident/resolve",
			expectedStatusCode: http.StatusForbidden,
			expectedBody:       "{\"error\":\"You are not allowed to resolve incidents: access forbidden\"}\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("opsgenie")
				mockInstance.On("CheckPermissions", mock.Anything, mock.Anything, "resolveIncident").Return(fmt.Errorf("access forbidden"))
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.resolveIncident(w, req)
			},
		},
		{
			name:               "resolveIncident: error request",
			url:                "/opsgenie/incident/resolve",
			expectedStatusCode: http.StatusInternalServerError,
			expectedBody:       "{\"error\":\"Could not resolve incident: bad request\"}\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("opsgenie")
				mockInstance.On("CheckPermissions", mock.Anything, mock.Anything, "resolveIncident").Return(nil)
				mockInstance.On("ResolveIncident", mock.Anything, "", "").Return(fmt.Errorf("bad request"))
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.resolveIncident(w, req)
			},
		},
		{
			name:               "resolveIncident: success request",
			url:                "/opsgenie/incident/resolve",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "null\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("opsgenie")
				mockInstance.On("CheckPermissions", mock.Anything, mock.Anything, "resolveIncident").Return(nil)
				mockInstance.On("ResolveIncident", mock.Anything, "", "").Return(nil)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.resolveIncident(w, req)
			},
		},

		// closeIncident
		{
			name:               "closeIncident: invalid instance name",
			url:                "/invalidname/incident/close",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not find instance name\"}\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("opsgenie")
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.closeIncident(w, req)
			},
		},
		{
			name:               "closeIncident: no user context",
			url:                "/opsgenie/incident/close",
			expectedStatusCode: http.StatusUnauthorized,
			expectedBody:       "{\"error\":\"You are not authorized to close the incident: Unauthorized\"}\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("opsgenie")
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.closeIncident(w, req)
			},
		},
		{
			name:               "closeIncident: check permissions fails",
			url:                "/opsgenie/incident/close",
			expectedStatusCode: http.StatusForbidden,
			expectedBody:       "{\"error\":\"You are not allowed to close incidents: access forbidden\"}\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("opsgenie")
				mockInstance.On("CheckPermissions", mock.Anything, mock.Anything, "closeIncident").Return(fmt.Errorf("access forbidden"))
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.closeIncident(w, req)
			},
		},
		{
			name:               "closeIncident: error request",
			url:                "/opsgenie/incident/close",
			expectedStatusCode: http.StatusInternalServerError,
			expectedBody:       "{\"error\":\"Could not close incident: bad request\"}\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("opsgenie")
				mockInstance.On("CheckPermissions", mock.Anything, mock.Anything, "closeIncident").Return(nil)
				mockInstance.On("CloseIncident", mock.Anything, "", "").Return(fmt.Errorf("bad request"))
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.closeIncident(w, req)
			},
		},
		{
			name:               "closeIncident: success request",
			url:                "/opsgenie/incident/close",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "null\n",
			prepare: func(mockInstance *instance.MockInstance) {
				mockInstance.On("GetName").Return("opsgenie")
				mockInstance.On("CheckPermissions", mock.Anything, mock.Anything, "closeIncident").Return(nil)
				mockInstance.On("CloseIncident", mock.Anything, "", "").Return(nil)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.closeIncident(w, req)
			},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockInstance := &instance.MockInstance{}
			mockInstance.AssertExpectations(t)
			tt.prepare(mockInstance)

			router := Router{chi.NewRouter(), []instance.Instance{mockInstance}}
			router.Route("/{name}", func(r chi.Router) {
				r.Get("/alerts", router.getAlerts)
				r.Get("/alert/details", router.getAlertDetails)
				r.Get("/alert/logs", router.getAlertLogs)
				r.Get("/alert/notes", router.getAlertNotes)
				r.Get("/alert/acknowledge", router.acknowledgeAlert)
				r.Get("/alert/snooze", router.snoozeAlert)
				r.Get("/alert/close", router.closeAlert)
				r.Get("/incidents", router.getIncidents)
				r.Get("/incident/logs", router.getIncidentLogs)
				r.Get("/incident/notes", router.getIncidentNotes)
				r.Get("/incident/timeline", router.getIncidentTimeline)
				r.Get("/incident/resolve", router.resolveIncident)
				r.Get("/incident/close", router.closeIncident)
			})

			req, _ := http.NewRequest(http.MethodGet, tt.url, nil)
			rctx := chi.NewRouteContext()
			rctx.URLParams.Add("name", strings.Split(tt.url, "/")[1])
			req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))

			w := httptest.NewRecorder()
			tt.do(router, w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
		})
	}
}

func TestRegister(t *testing.T) {
	plugins := &plugin.Plugins{}
	router := Register(plugins, testConfig)

	require.NotEmpty(t, router)
	require.Equal(t, &plugin.Plugins{
		plugin.Plugin{
			Name:        testConfig[0].Name,
			DisplayName: testConfig[0].DisplayName,
			Description: testConfig[0].Description,
			Type:        "opsgenie",
			Options: map[string]interface{}{
				"url": "",
			},
		},
	}, plugins)
}
