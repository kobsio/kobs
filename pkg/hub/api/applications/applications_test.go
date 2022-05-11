package applications

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	authContext "github.com/kobsio/kobs/pkg/hub/middleware/userauth/context"
	"github.com/kobsio/kobs/pkg/hub/store"
	userv1 "github.com/kobsio/kobs/pkg/kube/apis/user/v1"

	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
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

			router := Router{chi.NewRouter(), mockStoreClient}

			req, _ := http.NewRequest(http.MethodGet, tt.url, nil)
			rctx := chi.NewRouteContext()
			rctx.URLParams.Add("name", strings.Split(tt.url, "/")[1])
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

			router := Router{chi.NewRouter(), mockStoreClient}

			req, _ := http.NewRequest(http.MethodGet, tt.url, nil)
			rctx := chi.NewRouteContext()
			rctx.URLParams.Add("name", strings.Split(tt.url, "/")[1])
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

			router := Router{chi.NewRouter(), mockStoreClient}

			req, _ := http.NewRequest(http.MethodGet, tt.url, nil)
			rctx := chi.NewRouteContext()
			rctx.URLParams.Add("name", strings.Split(tt.url, "/")[1])
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
