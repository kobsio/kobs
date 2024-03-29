// Package client can be used to interact with Helm releases.
//
// The types in this package are copied from the "helm.sh/helm/v3/pkg/release" package. We decided for this way, because
// the experience with the Helm package wasn't satisfying.
package client

//go:generate mockgen -source=client.go -destination=./client_mock.go -package=client Client

import (
	"context"
	"encoding/json"
	"fmt"
	"sort"
	"strconv"

	"github.com/kobsio/kobs/pkg/cluster/kubernetes"

	corev1 "k8s.io/api/core/v1"
)

type Client interface {
	List(ctx context.Context, namespace string) ([]*Release, error)
	Get(ctx context.Context, namespace, name string, version int) (*Release, error)
	History(ctx context.Context, namespace, name string) ([]*Release, error)
}

type client struct {
	kubernetesClient kubernetes.Client
	name             string
}

func (c *client) List(ctx context.Context, namespace string) ([]*Release, error) {
	secretsData, err := c.kubernetesClient.GetResources(ctx, namespace, "", "/api/v1", "secrets", "labelSelector", "owner=helm")
	if err != nil {
		return nil, err
	}

	var secretsList corev1.SecretList
	err = json.Unmarshal(secretsData, &secretsList)
	if err != nil {
		return nil, err
	}

	secrets := make(map[string][]corev1.Secret)

	for _, secretItem := range secretsList.Items {
		key := secretItem.Namespace + "_" + secretItem.Labels["name"]
		secrets[key] = append(secrets[key], secretItem)
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

func (c *client) Get(ctx context.Context, namespace, name string, version int) (*Release, error) {
	secretsData, err := c.kubernetesClient.GetResources(ctx, namespace, "", "/api/v1", "secrets", "labelSelector", fmt.Sprintf("name=%s,owner=helm,version=%d", name, version))
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

func (c *client) History(ctx context.Context, namespace, name string) ([]*Release, error) {
	secretsData, err := c.kubernetesClient.GetResources(ctx, namespace, "", "/api/v1", "secrets", "labelSelector", fmt.Sprintf("name=%s,owner=helm", name))
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

func New(name string, kubernetesClient kubernetes.Client) Client {
	return &client{
		kubernetesClient: kubernetesClient,
		name:             name,
	}
}
