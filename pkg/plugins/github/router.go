package github

import (
	"net/http"

	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/plugins/github/instance"
	"github.com/kobsio/kobs/pkg/plugins/plugin"
	"github.com/kobsio/kobs/pkg/utils/middleware/errresponse"
	"go.uber.org/zap"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
)

// OAuthResponse is the response data returned when the a user finished the oauth process or when the user is
// authenticated in the oauth call.
type OAuthResponse struct {
	Organization string `json:"organization"`
	Token        string `json:"token"`
	Username     string `json:"username"`
}

type Router struct {
	*chi.Mux
	instances []instance.Instance
}

// getInstance returns a GitHub instance by it's name. If we couldn't found an instance with the provided name and
// the provided name is "default" we return the first instance from the list. The first instance in the list is also the
// first one configured by the user and can be used as default one.
func (router *Router) getInstance(name string) instance.Instance {
	for _, i := range router.instances {
		if i.GetName() == name {
			return i
		}
	}

	if name == "default" && len(router.instances) > 0 {
		return router.instances[0]
	}

	return nil
}

func (router *Router) oauthLogin(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid plugin instance", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid plugin instance")
		return
	}

	loginURL := i.OAuthLoginURL()

	data := struct {
		URL string `json:"url"`
	}{loginURL}

	render.JSON(w, r, data)
}

func (router *Router) oauthCallback(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")
	state := r.URL.Query().Get("state")
	code := r.URL.Query().Get("code")

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid plugin instance", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid plugin instance")
		return
	}

	token, user, err := i.OAuthCallback(r.Context(), state, code)
	if err != nil {
		log.Error(r.Context(), "Failed to finish login", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to finish login")
		return
	}

	cookie, err := i.TokenToCookie(token)
	if err != nil {
		log.Error(r.Context(), "Failed to create authentication cookie", zap.Error(err))
		errresponse.Render(w, r, http.StatusUnauthorized, "Failed to create authentication cookie")
		return
	}

	http.SetCookie(w, cookie)
	render.JSON(w, r, OAuthResponse{
		Organization: i.GetOrganization(),
		Token:        token.AccessToken,
		Username:     *user.Login,
	})
}

func (router *Router) oauthToken(w http.ResponseWriter, r *http.Request) {
	name := r.Header.Get("x-kobs-plugin")

	i := router.getInstance(name)
	if i == nil {
		log.Error(r.Context(), "Invalid plugin instance", zap.String("name", name))
		errresponse.Render(w, r, http.StatusBadRequest, "Invalid plugin instance")
		return
	}

	token, err := i.TokenFromCookie(r)
	if err != nil {
		log.Error(r.Context(), "Failed to get authentication token from cookie", zap.Error(err))
		errresponse.Render(w, r, http.StatusUnauthorized, "Failed to get authentication token from cookie")
		return
	}

	user, err := i.OAuthIsAuthenticated(r.Context(), token)
	if err != nil {
		log.Error(r.Context(), "Failed to get user", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to get user")
		return
	}

	cookie, err := i.TokenToCookie(token)
	if err == nil {
		http.SetCookie(w, cookie)
	}

	render.JSON(w, r, OAuthResponse{
		Organization: i.GetOrganization(),
		Token:        token.AccessToken,
		Username:     *user.Login,
	})
}

func Mount(instances []plugin.Instance) (chi.Router, error) {
	var githubInstances []instance.Instance

	for _, i := range instances {
		githubInstance, err := instance.New(i.Name, i.Options)
		if err != nil {
			return nil, err
		}
		githubInstances = append(githubInstances, githubInstance)
	}

	router := Router{
		chi.NewRouter(),
		githubInstances,
	}

	router.Get("/oauth", router.oauthToken)
	router.Get("/oauth/login", router.oauthLogin)
	router.Get("/oauth/callback", router.oauthCallback)

	return router, nil
}
