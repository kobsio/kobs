# Getting Started

**kobs** consists of two components, which are named hub and satellite. A **satellite** can be used to access the Kubernetes API and several services via plugins. To access one or multiple satellites the **hub** component is required. It connects to one or multiple satellites to work with the Kubernetes resources or to access the data served by plugins. It also watches the satellites for our resources like Applications, Teams, Users and Dashboards. The hub is also responsible for serving the UI for kobs.

![Architecture](./assets/architecture.png)

[kobs](https://kobs.io) also uses a [MongoDB](https://www.mongodb.com) database as a cache.
You can install a MongoDB via [Helm](https://helm.sh/) too. 
For example via the [Bitnami MongoDB Helm chart](https://github.com/bitnami/charts/tree/main/bitnami/mongodb).

To use the MongoDB you have to execute some commands on the primary via the [MongoDB Shell](https://www.mongodb.com/docs/mongodb-shell/).

Connect to the primary MongoDB via [kubectl](https://kubernetes.io/de/docs/reference/kubectl/cheatsheet):

```bash
kubectl exec -it mongodb-0 -c mongodb -- bash -c 'mongosh -u $MONGODB_ROOT_USER -p $MONGODB_ROOT_PASSWORD'
```

In the newly opened MongoDB shell do:

```
use kobs
db.createUser({ user: "kobs", pwd: "SuperSecretPassword", roles: ["readWrite"] })
```

The password should be the one you've configured in the [kobs helm chart](https://github.com/kobsio/kobs/blob/main/deploy/helm/kobs/values.yaml#L43-L44)
