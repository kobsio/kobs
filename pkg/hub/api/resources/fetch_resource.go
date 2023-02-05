package resources

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"sync"
	"time"

	"github.com/kobsio/kobs/pkg/hub/api/shared"
	"github.com/kobsio/kobs/pkg/hub/clusters/cluster"
)

type query struct {
	url.Values
}

func (q query) add(name string, value string) {
	if value != "" {
		q.Values.Add(name, value)
	}
}

type resultKey struct {
	resourceID string
	clusterID  string
}

// result allows concurrent writes inside fetchResource.run()
type result struct {
	mutex sync.Mutex
	s     map[resultKey][]ResourceList
}

func (r *result) Set(k resultKey, v ResourceList) {
	r.mutex.Lock()
	defer r.mutex.Unlock()
	if _, exists := r.s[k]; !exists {
		r.s[k] = make([]ResourceList, 0)
	}

	r.s[k] = append(r.s[k], v)
}

type fetchResource struct {
	client     cluster.Client
	resource   shared.Resource
	clusterID  string
	namespace  string
	name       string
	path       string
	paramName  string
	param      string
	resourceId string
	res        *result
}

func (f fetchResource) run(ctx context.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()
	query := query{}
	query.add("namespace", f.namespace)
	query.add("name", f.name)
	query.add("resource", f.resourceId)
	query.add("path", f.path)
	query.add("paramName", f.paramName)
	query.add("param", f.param)

	resources, err := f.client.Request(ctx, http.MethodGet, fmt.Sprintf("/?%s", query.Encode()), nil)
	if err != nil {
		// TODO: handle err
	}

	f.res.Set(resultKey{
		resourceID: f.resourceId,
		clusterID:  f.clusterID,
	}, ResourceList{resources})
}
