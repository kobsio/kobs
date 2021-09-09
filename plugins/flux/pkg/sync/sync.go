package sync

import (
	"context"
	"fmt"
	"time"

	"github.com/kobsio/kobs/pkg/api/clusters/cluster"

	helmv2 "github.com/fluxcd/helm-controller/api/v2beta1"
	kustomizev1 "github.com/fluxcd/kustomize-controller/api/v1beta1"
	"github.com/fluxcd/pkg/apis/meta"
	apiruntime "k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/types"
)

func createScheme() *apiruntime.Scheme {
	scheme := apiruntime.NewScheme()
	_ = kustomizev1.AddToScheme(scheme)
	_ = helmv2.AddToScheme(scheme)

	return scheme
}

func doReconcileAnnotations(annotations map[string]string) {
	if annotations == nil {
		annotations = map[string]string{
			meta.ReconcileAtAnnotation: time.Now().Format(time.RFC3339Nano),
		}
	} else {
		annotations[meta.ReconcileAtAnnotation] = time.Now().Format(time.RFC3339Nano)
	}
}

// Kustomization can be used to sync a Flux Kustomization. For that the cluster, namespace and name for the resource
// must be provided.
func Kustomization(ctx context.Context, cluster *cluster.Cluster, namespace, name string) error {
	client, err := cluster.GetClient(createScheme())
	if err != nil {
		return fmt.Errorf("could not get client: %w", err)
	}

	namespacedName := types.NamespacedName{
		Name:      name,
		Namespace: namespace,
	}
	kustomization := kustomizev1.Kustomization{}

	if err := client.Get(ctx, namespacedName, &kustomization); err != nil {
		return fmt.Errorf("could not list kustomizations: %w", err)
	}

	doReconcileAnnotations(kustomization.Annotations)

	if err := client.Update(ctx, &kustomization); err != nil {
		return fmt.Errorf("could not update kustomization: %w", err)
	}

	return nil
}

// HelmRelease can be used to sync a Flux HelmRelease. For that the cluster, namespace and name for the resource must be
// provided.
func HelmRelease(ctx context.Context, cluster *cluster.Cluster, namespace, name string) error {
	client, err := cluster.GetClient(createScheme())
	if err != nil {
		return fmt.Errorf("could not get client: %w", err)
	}

	namespacedName := types.NamespacedName{
		Name:      name,
		Namespace: namespace,
	}
	hr := helmv2.HelmRelease{}

	if err := client.Get(ctx, namespacedName, &hr); err != nil {
		return fmt.Errorf("could not get helm release: %w", err)
	}

	doReconcileAnnotations(hr.Annotations)

	if err := client.Update(ctx, &hr); err != nil {
		return fmt.Errorf("could not update kustomization: %w", err)
	}

	return nil
}
