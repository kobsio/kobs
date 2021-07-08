# Development using the Demo

The created kind cluster in the demo comes with a local registry, so that the demo can be used within your development flow. For that you have to build the Docker image with your changes and push it into the local registry:

```sh
docker build -f ./cmd/kobs/Dockerfile -t localhost:5000/kobs:dev .
docker push localhost:5000/kobs:dev
```

When you have pushed your custom image, you can run the following command to deploy kobs with the new image:

```sh
kustomize build deploy/demo/kobs/dev | kubectl apply -f -
```

Finally you can check if the kobs Pod is using your image, with the following command:

```sh
k get pods -n kobs -l app.kubernetes.io/name=kobs -o yaml | grep "image: localhost:5000/kobs:dev"
```

If you make changes to the CRDs for kobs you can deploy them using the following command:

```sh
kustomize build deploy/kustomize/crds | kubectl apply -f -
```
