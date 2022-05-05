package satellite

import (
	"net/http"
	"net/http/httputil"
	"net/url"

	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/middleware/errresponse"

	"go.uber.org/zap"
)

type Config struct {
	Name    string `json:"name"`
	Address string `json:"address"`
	Token   string `json:"token"`
}

type Client interface {
	GetName() string
	GetAddress() string
	GetToken() string
	Proxy(w http.ResponseWriter, r *http.Request)
}

type client struct {
	config   Config
	proxyURL *url.URL
}

func (c *client) GetName() string {
	return c.config.Name
}

func (c *client) GetAddress() string {
	return c.config.Address
}

func (c *client) GetToken() string {
	return c.config.Token
}

func (c *client) Proxy(w http.ResponseWriter, r *http.Request) {
	proxy := httputil.NewSingleHostReverseProxy(c.proxyURL)
	proxy.FlushInterval = -1

	originalDirector := proxy.Director
	proxy.Director = func(req *http.Request) {
		originalDirector(req)

		req.Header.Add("Authorization", "Bearer "+c.config.Token)
		req.Header.Add("x-kobs-satellite", c.config.Name)
	}

	proxy.ErrorHandler = func(w http.ResponseWriter, r *http.Request, err error) {
		log.Error(r.Context(), "Satellite request failed", zap.Error(err), zap.String("satelliteName", c.config.Name))
		errresponse.Render(w, r, err, http.StatusBadGateway, "Satellite request failed")
		return
	}

	proxy.ServeHTTP(w, r)
}

func NewClient(config Config) (Client, error) {
	proxyURL, err := url.Parse(config.Address)
	if err != nil {
		return nil, err
	}

	return &client{
		config:   config,
		proxyURL: proxyURL,
	}, nil
}
