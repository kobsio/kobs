package velero

import (
	"net/http"
	"time"

	"github.com/kobsio/kobs/pkg/cluster/kubernetes"
	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/utils/middleware/errresponse"

	"github.com/go-chi/chi/v5"
	velerov1api "github.com/vmware-tanzu/velero/pkg/apis/velero/v1"
	"github.com/vmware-tanzu/velero/pkg/cmd/util/downloadrequest"
	"go.uber.org/zap"
	"k8s.io/apimachinery/pkg/runtime"
)

func createScheme() *runtime.Scheme {
	scheme := runtime.NewScheme()
	_ = velerov1api.AddToScheme(scheme)

	return scheme
}

type Router struct {
	*chi.Mux
	kubernetesClient kubernetes.Client
}

func (router *Router) logs(w http.ResponseWriter, r *http.Request) {
	namespace := r.URL.Query().Get("namespace")
	name := r.URL.Query().Get("name")
	downloadTargetKindType := r.URL.Query().Get("type")

	downloadTargetKind := velerov1api.DownloadTargetKindBackupLog
	if downloadTargetKindType == "restores" {
		downloadTargetKind = velerov1api.DownloadTargetKindRestoreLog
	}

	client, err := router.kubernetesClient.GetClient(r.Context(), createScheme())
	if err != nil {
		log.Error(r.Context(), "Failed to create Kubernetes client", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to create Kubernetes client")
		return
	}

	err = downloadrequest.Stream(r.Context(), client, namespace, name, downloadTargetKind, w, 1*time.Minute, false, "")
	if err != nil {
		log.Error(r.Context(), "Failed to get logs", zap.Error(err))
		errresponse.Render(w, r, http.StatusBadRequest, "Failed to get logs")
		return
	}
}

func Mount(kubernetesClient kubernetes.Client) (chi.Router, error) {
	router := Router{
		chi.NewRouter(),
		kubernetesClient,
	}

	router.Get("/logs", router.logs)

	return router, nil
}
