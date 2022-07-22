package github

import (
	"net/http"

	"github.com/kobsio/kobs/pkg/kube/clusters"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/middleware/errresponse"
	"github.com/kobsio/kobs/pkg/satellite/plugins/plugin"
	"github.com/kobsio/kobs/plugins/plugin-github/pkg/instance"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.uber.org/zap"
)

// PluginType is the type which must be used for the GitHub plugin.
const PluginType = "github"

// Router implements the router for the GitHub plugin, which can be registered in the router for our rest api. It
// contains the api routes for the GitHub plugin and it's configuration.
type Router struct {
	*chi.Mux
	instances []instance.Instance
}

// OAuthResponse is the response data returned when the a user finished the oauth process or when the user is
// authenticated in the oauth call.
type OAuthResponse struct {
	Organization string `json:"organization"`
	Token        string `json:"token"`
	Username     string `json:"username"`
}

// getInstance returns a GitHub instance by it's name. If we couldn't found an instance with the provided name and the
// provided name is "default" we return the first instance from the list. The first instance in the list is also the
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
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
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
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	token, user, err := i.OAuthCallback(r.Context(), state, code)
	if err != nil {
		log.Error(r.Context(), "Login failed", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Login failed")
		return
	}

	cookie, err := i.TokenToCookie(token)
	if err != nil {
		log.Error(r.Context(), "Could not create authentication cookie", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusUnauthorized, "Could not create authentication cookie")
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
		log.Error(r.Context(), "Could not find instance name", zap.String("name", name))
		errresponse.Render(w, r, nil, http.StatusBadRequest, "Could not find instance name")
		return
	}

	token, err := i.TokenFromCookie(r)
	if err != nil {
		log.Error(r.Context(), "Could not get authentication token from cookie", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusUnauthorized, "Could not get authentication token from cookie")
		return
	}

	user, err := i.OAuthIsAuthenticated(r.Context(), token)
	if err != nil {
		log.Error(r.Context(), "Could not get user", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusBadRequest, "Could not get user")
		return
	}

	render.JSON(w, r, OAuthResponse{
		Organization: i.GetOrganization(),
		Token:        token.AccessToken,
		Username:     *user.Login,
	})
}

// Mount mounts the GitHub plugin routes in the plugins router of a kobs satellite instance.
func Mount(instances []plugin.Instance, clustersClient clusters.Client) (chi.Router, error) {
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
