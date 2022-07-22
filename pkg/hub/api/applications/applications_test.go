package applications

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	authContext "github.com/kobsio/kobs/pkg/hub/middleware/userauth/context"
	"github.com/kobsio/kobs/pkg/hub/store"
	applicationv1 "github.com/kobsio/kobs/pkg/kube/apis/application/v1"
	userv1 "github.com/kobsio/kobs/pkg/kube/apis/user/v1"

	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
	"go.opentelemetry.io/otel"
)

func TestGetApplications(t *testing.T) {
	for _, tt := range []struct {
		name               string
		url                string
		expectedStatusCode int
		expectedBody       string
		prepare            func(t *testing.T, mockStoreClient *store.MockClient)
		do                 func(router Router, w *httptest.ResponseRecorder, req *http.Request)
	}{
		{
			name:               "no user context",
			url:                "/applications",
			expectedStatusCode: http.StatusUnauthorized,
			expectedBody:       "{\"error\":\"You are not authorized to access the applications: Unauthorized\"}\n",
			prepare: func(t *testing.T, mockStoreClient *store.MockClient) {
				mockStoreClient.AssertNotCalled(t, "GetApplicationsByFilter", mock.Anything)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getApplications(w, req)
			},
		},
		{
			name:               "parse limit fails",
			url:                "/applications",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not parse limit parameter: strconv.Atoi: parsing \\\"\\\": invalid syntax\"}\n",
			prepare: func(t *testing.T, mockStoreClient *store.MockClient) {
				mockStoreClient.AssertNotCalled(t, "GetApplicationsByFilter", mock.Anything)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getApplications(w, req)
			},
		},
		{
			name:               "parse offset fails",
			url:                "/applications?limit=10",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not parse offset parameter: strconv.Atoi: parsing \\\"\\\": invalid syntax\"}\n",
			prepare: func(t *testing.T, mockStoreClient *store.MockClient) {
				mockStoreClient.AssertNotCalled(t, "GetApplicationsByFilter", mock.Anything)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getApplications(w, req)
			},
		},
		{
			name:               "get all applications fails, because user is not authorized to view all applications",
			url:                "/applications?all=true&limit=10&offset=0",
			expectedStatusCode: http.StatusForbidden,
			expectedBody:       "{\"error\":\"You are not allowed to view all applications\"}\n",
			prepare: func(t *testing.T, mockStoreClient *store.MockClient) {
				mockStoreClient.AssertNotCalled(t, "GetApplicationsByFilter", mock.Anything)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getApplications(w, req)
			},
		},
		{
			name:               "get all applications fails",
			url:                "/applications?all=true&limit=10&offset=0",
			expectedStatusCode: http.StatusInternalServerError,
			expectedBody:       "{\"error\":\"Could not get applications: could not get applications\"}\n",
			prepare: func(t *testing.T, mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetApplicationsByFilter", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(nil, fmt.Errorf("could not get applications"))
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "all"}}}}))
				router.getApplications(w, req)
			},
		},
		{
			name:               "get all applications",
			url:                "/applications?all=true&limit=10&offset=0",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "null\n",
			prepare: func(t *testing.T, mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetApplicationsByFilter", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(nil, nil)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "all"}}}}))
				router.getApplications(w, req)
			},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockStoreClient := &store.MockClient{}
			tt.prepare(t, mockStoreClient)

			router := Router{chi.NewRouter(), mockStoreClient, otel.Tracer("applications")}

			req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, tt.url, nil)
			rctx := chi.NewRouteContext()
			req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))

			w := httptest.NewRecorder()
			tt.do(router, w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
			mockStoreClient.AssertExpectations(t)
		})
	}
}

func TestGetApplicationsCount(t *testing.T) {
	for _, tt := range []struct {
		name               string
		url                string
		expectedStatusCode int
		expectedBody       string
		prepare            func(t *testing.T, mockStoreClient *store.MockClient)
		do                 func(router Router, w *httptest.ResponseRecorder, req *http.Request)
	}{
		{
			name:               "no user context",
			url:                "/count",
			expectedStatusCode: http.StatusUnauthorized,
			expectedBody:       "{\"error\":\"You are not authorized to access the applications: Unauthorized\"}\n",
			prepare: func(t *testing.T, mockStoreClient *store.MockClient) {
				mockStoreClient.AssertNotCalled(t, "GetApplicationsByFilterCount", mock.Anything)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getApplicationsCount(w, req)
			},
		},
		{
			name:               "get all applications fails, because user is not authorized to view all applications",
			url:                "/count?all=true&limit=10&offset=0",
			expectedStatusCode: http.StatusForbidden,
			expectedBody:       "{\"error\":\"You are not allowed to view all applications\"}\n",
			prepare: func(t *testing.T, mockStoreClient *store.MockClient) {
				mockStoreClient.AssertNotCalled(t, "GetApplicationsByFilterCount", mock.Anything)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getApplicationsCount(w, req)
			},
		},
		{
			name:               "get all applications fails",
			url:                "/count?all=true&limit=10&offset=0",
			expectedStatusCode: http.StatusInternalServerError,
			expectedBody:       "{\"error\":\"Could not get applications count: could not get applications\"}\n",
			prepare: func(t *testing.T, mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetApplicationsByFilterCount", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(0, fmt.Errorf("could not get applications"))
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "all"}}}}))
				router.getApplicationsCount(w, req)
			},
		},
		{
			name:               "get all applications",
			url:                "/count?all=true&limit=10&offset=0",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "{\"count\":5}\n",
			prepare: func(t *testing.T, mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetApplicationsByFilterCount", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(5, nil)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "all"}}}}))
				router.getApplicationsCount(w, req)
			},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockStoreClient := &store.MockClient{}
			tt.prepare(t, mockStoreClient)

			router := Router{chi.NewRouter(), mockStoreClient, otel.Tracer("applications")}

			req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, tt.url, nil)
			rctx := chi.NewRouteContext()
			req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))

			w := httptest.NewRecorder()
			tt.do(router, w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
			mockStoreClient.AssertExpectations(t)
		})
	}
}

func TestGetTags(t *testing.T) {
	for _, tt := range []struct {
		name               string
		url                string
		expectedStatusCode int
		expectedBody       string
		prepare            func(t *testing.T, mockStoreClient *store.MockClient)
		do                 func(router Router, w *httptest.ResponseRecorder, req *http.Request)
	}{
		{
			name:               "get tags fails",
			url:                "/tags",
			expectedStatusCode: http.StatusInternalServerError,
			expectedBody:       "{\"error\":\"Could not get tags: could not get tags\"}\n",
			prepare: func(t *testing.T, mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetTags", mock.Anything).Return(nil, fmt.Errorf("could not get tags"))
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getTags(w, req)
			},
		},
		{
			name:               "get tags",
			url:                "/tags",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "null\n",
			prepare: func(t *testing.T, mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetTags", mock.Anything).Return(nil, nil)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getTags(w, req)
			},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockStoreClient := &store.MockClient{}
			tt.prepare(t, mockStoreClient)

			router := Router{chi.NewRouter(), mockStoreClient, otel.Tracer("applications")}

			req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, tt.url, nil)
			rctx := chi.NewRouteContext()
			req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))

			w := httptest.NewRecorder()
			tt.do(router, w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
			mockStoreClient.AssertExpectations(t)
		})
	}
}

func TestGetApplication(t *testing.T) {
	for _, tt := range []struct {
		name               string
		url                string
		expectedStatusCode int
		expectedBody       string
		prepare            func(t *testing.T, mockStoreClient *store.MockClient)
		do                 func(router Router, w *httptest.ResponseRecorder, req *http.Request)
	}{
		{
			name:               "no user context",
			url:                "/applications/application",
			expectedStatusCode: http.StatusUnauthorized,
			expectedBody:       "{\"error\":\"You are not authorized to access the application: Unauthorized\"}\n",
			prepare: func(t *testing.T, mockStoreClient *store.MockClient) {
				mockStoreClient.AssertNotCalled(t, "GetApplicationByID", mock.Anything, mock.Anything)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getApplication(w, req)
			},
		},
		{
			name:               "get application fails",
			url:                "/applications/application?id=id1",
			expectedStatusCode: http.StatusInternalServerError,
			expectedBody:       "{\"error\":\"Could not get application: could not get application\"}\n",
			prepare: func(t *testing.T, mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetApplicationByID", mock.Anything, "id1").Return(nil, fmt.Errorf("could not get application"))
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "all"}}}}))
				router.getApplication(w, req)
			},
		},
		{
			name:               "application not found",
			url:                "/applications/application?id=id1",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Application was not found\"}\n",
			prepare: func(t *testing.T, mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetApplicationByID", mock.Anything, mock.Anything).Return(nil, nil)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "all"}}}}))
				router.getApplication(w, req)
			},
		},
		{
			name:               "user does not have permissions to view application",
			url:                "/applications/application?id=id1",
			expectedStatusCode: http.StatusForbidden,
			expectedBody:       "{\"error\":\"You are not allowed to view the application\"}\n",
			prepare: func(t *testing.T, mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetApplicationByID", mock.Anything, mock.Anything).Return(&applicationv1.ApplicationSpec{Satellite: "satellite1", Cluster: "cluster1", Namespace: "namespace1"}, nil)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "own"}}}}))
				router.getApplication(w, req)
			},
		},
		{
			name:               "get application succeeds",
			url:                "/applications/application?id=id1",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "{\"satellite\":\"satellite1\",\"cluster\":\"cluster1\",\"namespace\":\"namespace1\",\"topology\":{}}\n",
			prepare: func(t *testing.T, mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetApplicationByID", mock.Anything, mock.Anything).Return(&applicationv1.ApplicationSpec{Satellite: "satellite1", Cluster: "cluster1", Namespace: "namespace1"}, nil)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "all"}}}}))
				router.getApplication(w, req)
			},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockStoreClient := &store.MockClient{}
			tt.prepare(t, mockStoreClient)

			router := Router{chi.NewRouter(), mockStoreClient, otel.Tracer("applications")}

			req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, tt.url, nil)
			rctx := chi.NewRouteContext()
			req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))

			w := httptest.NewRecorder()
			tt.do(router, w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
			mockStoreClient.AssertExpectations(t)
		})
	}
}

func TestGetApplicationsByTeam(t *testing.T) {
	for _, tt := range []struct {
		name               string
		url                string
		expectedStatusCode int
		expectedBody       string
		prepare            func(t *testing.T, mockStoreClient *store.MockClient)
		do                 func(router Router, w *httptest.ResponseRecorder, req *http.Request)
	}{
		{
			name:               "no user context",
			url:                "/team",
			expectedStatusCode: http.StatusUnauthorized,
			expectedBody:       "{\"error\":\"You are not authorized to access the applications: Unauthorized\"}\n",
			prepare: func(t *testing.T, mockStoreClient *store.MockClient) {
				mockStoreClient.AssertNotCalled(t, "GetApplicationsByFilter", mock.Anything)
				mockStoreClient.AssertNotCalled(t, "GetApplicationsByFilterCount", mock.Anything)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getApplicationsByTeam(w, req)
			},
		},
		{
			name:               "parse limit fails",
			url:                "/team",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not parse limit parameter: strconv.Atoi: parsing \\\"\\\": invalid syntax\"}\n",
			prepare: func(t *testing.T, mockStoreClient *store.MockClient) {
				mockStoreClient.AssertNotCalled(t, "GetApplicationsByFilter", mock.Anything)
				mockStoreClient.AssertNotCalled(t, "GetApplicationsByFilterCount", mock.Anything)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getApplicationsByTeam(w, req)
			},
		},
		{
			name:               "parse offset fails",
			url:                "/team?limit=10",
			expectedStatusCode: http.StatusBadRequest,
			expectedBody:       "{\"error\":\"Could not parse offset parameter: strconv.Atoi: parsing \\\"\\\": invalid syntax\"}\n",
			prepare: func(t *testing.T, mockStoreClient *store.MockClient) {
				mockStoreClient.AssertNotCalled(t, "GetApplicationsByFilter", mock.Anything)
				mockStoreClient.AssertNotCalled(t, "GetApplicationsByFilterCount", mock.Anything)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getApplicationsByTeam(w, req)
			},
		},
		{
			name:               "get team applications fails, because user is not authorized",
			url:                "/team?team=team1&limit=10&offset=0",
			expectedStatusCode: http.StatusForbidden,
			expectedBody:       "{\"error\":\"You are not allowed to view the applications of this team\"}\n",
			prepare: func(t *testing.T, mockStoreClient *store.MockClient) {
				mockStoreClient.AssertNotCalled(t, "GetApplicationsByFilter", mock.Anything)
				mockStoreClient.AssertNotCalled(t, "GetApplicationsByFilterCount", mock.Anything)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getApplicationsByTeam(w, req)
			},
		},
		{
			name:               "get team applications fails",
			url:                "/team?team=team1&limit=10&offset=0",
			expectedStatusCode: http.StatusInternalServerError,
			expectedBody:       "{\"error\":\"Could not get applications: could not get applications\"}\n",
			prepare: func(t *testing.T, mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetApplicationsByFilter", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(nil, fmt.Errorf("could not get applications"))
				mockStoreClient.AssertNotCalled(t, "GetApplicationsByFilterCount", mock.Anything)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "all"}}}}))
				router.getApplicationsByTeam(w, req)
			},
		},
		{
			name:               "get all applications count fails",
			url:                "/team?team=team1&limit=10&offset=0",
			expectedStatusCode: http.StatusInternalServerError,
			expectedBody:       "{\"error\":\"Could not get applications: could not get applications count\"}\n",
			prepare: func(t *testing.T, mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetApplicationsByFilter", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(nil, nil)
				mockStoreClient.On("GetApplicationsByFilterCount", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(0, fmt.Errorf("could not get applications count"))
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "all"}}}}))
				router.getApplicationsByTeam(w, req)
			},
		},
		{
			name:               "get all applications",
			url:                "/team?team=team1&limit=10&offset=0",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "{\"count\":0,\"applications\":null}\n",
			prepare: func(t *testing.T, mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetApplicationsByFilter", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(nil, nil)
				mockStoreClient.On("GetApplicationsByFilterCount", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(0, nil)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{Permissions: userv1.Permissions{Applications: []userv1.ApplicationPermissions{{Type: "all"}}}}))
				router.getApplicationsByTeam(w, req)
			},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockStoreClient := &store.MockClient{}
			tt.prepare(t, mockStoreClient)

			router := Router{chi.NewRouter(), mockStoreClient, otel.Tracer("applications")}

			req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, tt.url, nil)
			rctx := chi.NewRouteContext()
			req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))

			w := httptest.NewRecorder()
			tt.do(router, w, req)

			require.Equal(t, tt.expectedStatusCode, w.Code)
			require.Equal(t, tt.expectedBody, string(w.Body.Bytes()))
			mockStoreClient.AssertExpectations(t)
		})
	}
}

func TestMount(t *testing.T) {
	router := Mount(nil)
	require.NotNil(t, router)
}
