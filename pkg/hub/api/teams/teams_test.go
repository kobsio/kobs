package teams

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	authContext "github.com/kobsio/kobs/pkg/hub/middleware/userauth/context"
	"github.com/kobsio/kobs/pkg/hub/store"
	teamv1 "github.com/kobsio/kobs/pkg/kube/apis/team/v1"
	userv1 "github.com/kobsio/kobs/pkg/kube/apis/user/v1"

	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestGetTeams(t *testing.T) {
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
			url:                "/teams",
			expectedStatusCode: http.StatusUnauthorized,
			expectedBody:       "{\"error\":\"You are not authorized to access the teams: Unauthorized\"}\n",
			prepare: func(t *testing.T, mockStoreClient *store.MockClient) {
				mockStoreClient.AssertNotCalled(t, "GetTeams", mock.Anything)
				mockStoreClient.AssertNotCalled(t, "GetTeamsByGroups", mock.Anything, mock.Anything)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getTeams(w, req)
			},
		},
		{
			name:               "get all teams fails, because user is not authorized to view all teams",
			url:                "/teams?all=true",
			expectedStatusCode: http.StatusForbidden,
			expectedBody:       "{\"error\":\"You are not allowed to view all teams\"}\n",
			prepare: func(t *testing.T, mockStoreClient *store.MockClient) {
				mockStoreClient.AssertNotCalled(t, "GetTeams", mock.Anything)
				mockStoreClient.AssertNotCalled(t, "GetTeamsByGroups", mock.Anything, mock.Anything)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getTeams(w, req)
			},
		},
		{
			name:               "get all teams fails",
			url:                "/teams?all=true",
			expectedStatusCode: http.StatusInternalServerError,
			expectedBody:       "{\"error\":\"Could not get teams: could not get teams\"}\n",
			prepare: func(t *testing.T, mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetTeams", mock.Anything).Return(nil, fmt.Errorf("could not get teams"))
				mockStoreClient.AssertNotCalled(t, "GetTeamsByGroups", mock.Anything, mock.Anything)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{Permissions: userv1.Permissions{Teams: []string{"*"}}}))
				router.getTeams(w, req)
			},
		},
		{
			name:               "get all teams",
			url:                "/teams?all=true",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "[{\"group\":\"team1\",\"permissions\":{\"applications\":null,\"teams\":null,\"plugins\":null,\"resources\":null}},{\"group\":\"team2\",\"permissions\":{\"applications\":null,\"teams\":null,\"plugins\":null,\"resources\":null}},{\"group\":\"team3\",\"permissions\":{\"applications\":null,\"teams\":null,\"plugins\":null,\"resources\":null}}]\n",
			prepare: func(t *testing.T, mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetTeams", mock.Anything).Return([]teamv1.TeamSpec{{Group: "team1"}, {Group: "team2"}, {Group: "team3"}, {Group: "team1"}, {Group: "team2"}}, nil)
				mockStoreClient.AssertNotCalled(t, "GetTeamsByGroups", mock.Anything, mock.Anything)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{Permissions: userv1.Permissions{Teams: []string{"*"}}}))
				router.getTeams(w, req)
			},
		},
		{
			name:               "get own teams fails",
			url:                "/teams",
			expectedStatusCode: http.StatusInternalServerError,
			expectedBody:       "{\"error\":\"Could not get teams: could not get teams\"}\n",
			prepare: func(t *testing.T, mockStoreClient *store.MockClient) {
				mockStoreClient.AssertNotCalled(t, "GetTeams", mock.Anything)
				mockStoreClient.On("GetTeamsByGroups", mock.Anything, []string{"team1"}).Return(nil, fmt.Errorf("could not get teams"))
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{Teams: []string{"team1"}}))
				router.getTeams(w, req)
			},
		},
		{
			name:               "get own teams",
			url:                "/teams",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "[{\"group\":\"team1\",\"permissions\":{\"applications\":null,\"teams\":null,\"plugins\":null,\"resources\":null}}]\n",
			prepare: func(t *testing.T, mockStoreClient *store.MockClient) {
				mockStoreClient.AssertNotCalled(t, "GetTeams", mock.Anything)
				mockStoreClient.On("GetTeamsByGroups", mock.Anything, []string{"team1"}).Return([]teamv1.TeamSpec{{Group: "team1"}, {Group: "team1"}}, nil)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{Teams: []string{"team1"}}))
				router.getTeams(w, req)
			},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockStoreClient := &store.MockClient{}
			tt.prepare(t, mockStoreClient)

			router := Router{chi.NewRouter(), mockStoreClient}

			req, _ := http.NewRequest(http.MethodGet, tt.url, nil)
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

func TestGetTeam(t *testing.T) {
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
			url:                "/teams/team",
			expectedStatusCode: http.StatusUnauthorized,
			expectedBody:       "{\"error\":\"You are not authorized to access the team: Unauthorized\"}\n",
			prepare: func(t *testing.T, mockStoreClient *store.MockClient) {
				mockStoreClient.AssertNotCalled(t, "GetTeamByGroup", mock.Anything, mock.Anything)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				router.getTeam(w, req)
			},
		},
		{
			name:               "get team fails, because user is not authorized to view the team",
			url:                "/teams/team",
			expectedStatusCode: http.StatusForbidden,
			expectedBody:       "{\"error\":\"You are not allowed to view the team\"}\n",
			prepare: func(t *testing.T, mockStoreClient *store.MockClient) {
				mockStoreClient.AssertNotCalled(t, "GetTeamByGroup", mock.Anything, mock.Anything)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{}))
				router.getTeam(w, req)
			},
		},
		{
			name:               "get team fails",
			url:                "/teams/team?group=team1",
			expectedStatusCode: http.StatusInternalServerError,
			expectedBody:       "{\"error\":\"Could not get team: could not get team\"}\n",
			prepare: func(t *testing.T, mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetTeamByGroup", mock.Anything, "team1").Return(nil, fmt.Errorf("could not get team"))
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{Permissions: userv1.Permissions{Teams: []string{"*"}}}))
				router.getTeam(w, req)
			},
		},
		{
			name:               "get team",
			url:                "/teams/team?group=team1",
			expectedStatusCode: http.StatusOK,
			expectedBody:       "{\"group\":\"team1\",\"permissions\":{\"applications\":null,\"teams\":null,\"plugins\":null,\"resources\":null}}\n",
			prepare: func(t *testing.T, mockStoreClient *store.MockClient) {
				mockStoreClient.On("GetTeamByGroup", mock.Anything, "team1").Return(&teamv1.TeamSpec{Group: "team1"}, nil)
			},
			do: func(router Router, w *httptest.ResponseRecorder, req *http.Request) {
				req = req.WithContext(context.WithValue(req.Context(), authContext.UserKey, authContext.User{Permissions: userv1.Permissions{Teams: []string{"*"}}}))
				router.getTeam(w, req)
			},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			mockStoreClient := &store.MockClient{}
			tt.prepare(t, mockStoreClient)

			router := Router{chi.NewRouter(), mockStoreClient}

			req, _ := http.NewRequest(http.MethodGet, tt.url, nil)
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
