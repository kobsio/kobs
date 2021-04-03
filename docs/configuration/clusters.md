# Clusters

In the moment of writing this, kobs supports two different provides to configure access to Kubernetes clusters. This means that you can use a Kubeconfig file, to grant kobs access to your Kubernetes clusters or you can use the incluster provider, which can be used to grant kobs access to the cluster were it is running on.

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| clusters | [Providers](#providers) | Configure the clusters for kobs, currently this only requires the providers configuration. | Yes |

## Providers

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| providers | [[]Provider](#provider) | Set a list of providers, which should be used by kobs to get access to your Kubernetes clusters. | Yes |

## Provider

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| provider | string | Set the provider type, which should be used. This must be `kubeconfig` or `incluster`. | Yes |
| kubeconfig | [Kubeconfig](#kubeconfig) (oneof) | Configuration of the Kubeconfig provider. | No |
| incluster | [Incluster](#incluster) (oneof) | Configuration of the incluster provider. | No |

## Kubeconfig

The following configuration can be used to use a Kubeconfig file for kobs, where the file is placed in the can be found in the following location `${HOME}/.kube/config`.

```yaml
clusters:
  providers:
    - provider: kubeconfig
      kubeconfig:
        path: ${HOME}/.kube/config
```

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| path | string | Path to a Kubeconfig file. | Yes |

## Incluster

The following configuration can be used to use the incluster provider.

```yaml
clusters:
  providers:
    - provider: incluster
      incluster:
        name: kobs-demo
```

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| name | string | Name of the cluster, which is used in the frontend. | Yes |
