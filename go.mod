module github.com/kobsio/kobs

go 1.16

require (
	github.com/fluxcd/helm-controller/api v0.11.2
	github.com/fluxcd/kustomize-controller/api v0.13.3
	github.com/fluxcd/pkg/apis/meta v0.10.1
	github.com/go-chi/chi/v5 v5.0.3
	github.com/go-chi/cors v1.2.0
	github.com/go-chi/render v1.0.1
	github.com/gorilla/websocket v1.4.2
	github.com/kiali/kiali v1.38.0
	github.com/mmcdole/gofeed v1.1.3
	github.com/opsgenie/opsgenie-go-sdk-v2 v1.2.8
	github.com/prometheus/client_golang v1.11.0
	github.com/prometheus/common v0.30.0
	github.com/sirupsen/logrus v1.8.1
	github.com/spf13/pflag v1.0.5
	k8s.io/api v0.21.3
	k8s.io/apiextensions-apiserver v0.21.3
	k8s.io/apimachinery v0.21.3
	k8s.io/client-go v0.21.3
	sigs.k8s.io/controller-runtime v0.9.6
	sigs.k8s.io/yaml v1.2.0
)
