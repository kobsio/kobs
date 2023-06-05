# Kustomize

[Kustomize](https://kustomize.io) introduces a template-free way to customize application configuration that simplifies the use of off-the-shelf applications.

To install kobs using Kustomize your can run the following command:

```sh
kubectl create namespace kobs
kustomize build github.com/kobsio/kobs/deploy/kustomize | kubectl apply -f -
```

You can also use the following commands to install all the required components separately:

```sh
kustomize build github.com/kobsio/kobs/deploy/kustomize/crds | kubectl apply -f -
kustomize build github.com/kobsio/kobs/deploy/kustomize/cluster | kubectl apply -f -
kustomize build github.com/kobsio/kobs/deploy/kustomize/hub | kubectl apply -f -
kustomize build github.com/kobsio/kobs/deploy/kustomize/watcher | kubectl apply -f -
```
