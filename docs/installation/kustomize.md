# Kustomize

[Kustomize](https://kustomize.io) introduces a template-free way to customize application configuration that simplifies the use of off-the-shelf applications.

To install kobs using Kustomize your can run the following command:

```sh
kubectl create namespace observability
kustomize build github.com/kobsio/kobs/deploy/kustomize | kubectl apply -f -
```
