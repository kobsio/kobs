// Package client can be used to interact with Helm releases.
//
// The types in this package are copied from the "helm.sh/helm/v3/pkg/release" package. We decided for this way, because
// the experience with the Helm package wasn't satisfying.
package client

import (
	"context"
	"encoding/json"
	"fmt"
	"sort"
	"strconv"

	"github.com/kobsio/kobs/pkg/api/clusters/cluster"

	corev1 "k8s.io/api/core/v1"
)

// Client is the interface to interact with the Helm charts.
type Client interface {
	List(ctx context.Context, namespace string) ([]*Release, error)
	Get(ctx context.Context, namespace, name string, version int) (*Release, error)
	History(ctx context.Context, namespace, name string) ([]*Release, error)
}

type client struct {
	client cluster.Client
	name   string
}

// List lists all Helm releases.
func (c *client) List(ctx context.Context, namespace string) ([]*Release, error) {
	secretsData, err := c.client.GetResources(ctx, namespace, "", "/api/v1", "secrets", "labelSelector", "owner=helm")
	if err != nil {
		return nil, err
	}

	var secretsList corev1.SecretList
	err = json.Unmarshal(secretsData, &secretsList)
	if err != nil {
		return nil, err
	}

	var secrets map[string][]corev1.Secret
	secrets = make(map[string][]corev1.Secret)

	for _, secretItem := range secretsList.Items {
		key := secretItem.Namespace + "_" + secretItem.Labels["name"]

		if _, ok := secrets[key]; ok {
			secrets[key] = append(secrets[key], secretItem)
		} else {
			secrets[key] = []corev1.Secret{secretItem}
		}
	}

	for key := range secrets {
		sort.Slice(secrets[key], func(i, j int) bool {
			v1, _ := strconv.ParseInt(secrets[key][i].Labels["version"], 10, 64)
			v2, _ := strconv.ParseInt(secrets[key][j].Labels["version"], 10, 64)

			return v1 > v2
		})
	}

	var releases []*Release

	for _, secret := range secrets {
		release, err := secretDataToRelease(c.name, secret[0].Data["release"])
		if err != nil {
			return nil, err
		}

		releases = append(releases, release)
	}

	return releases, nil
}

// Get returns the all information for a single Helm release version.
func (c *client) Get(ctx context.Context, namespace, name string, version int) (*Release, error) {
	secretsData, err := c.client.GetResources(ctx, namespace, "", "/api/v1", "secrets", "labelSelector", fmt.Sprintf("name=%s,owner=helm,version=%d", name, version))
	if err != nil {
		return nil, err
	}

	var secretsList corev1.SecretList
	err = json.Unmarshal(secretsData, &secretsList)
	if err != nil {
		return nil, err
	}

	if len(secretsList.Items) != 1 {
		return nil, fmt.Errorf("wrong number of secrets")
	}

	return secretDataToRelease(c.name, secretsList.Items[0].Data["release"])
}

// History returns the history of a single Helm release.
func (c *client) History(ctx context.Context, namespace, name string) ([]*Release, error) {
	secretsData, err := c.client.GetResources(ctx, namespace, "", "/api/v1", "secrets", "labelSelector", fmt.Sprintf("name=%s,owner=helm", name))
	if err != nil {
		return nil, err
	}

	var secretsList corev1.SecretList
	err = json.Unmarshal(secretsData, &secretsList)
	if err != nil {
		return nil, err
	}

	var releases []*Release

	for _, secretsItem := range secretsList.Items {
		release, err := secretDataToRelease(c.name, secretsItem.Data["release"])
		if err != nil {
			return nil, err
		}

		releases = append(releases, release)
	}

	return releases, nil
}

// New returns a new client, which implements the Client interface. The client can then be used to interact with the
// Helm releases in the given cluster and namespace via the specified driver.
func New(clusterClient cluster.Client) Client {
	return &client{
		client: clusterClient,
		name:   clusterClient.GetName(),
	}
}
