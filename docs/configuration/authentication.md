# Authentication

kobs hasn't any built in authentication mechanism. We recommend to run kobs behind a service like [OAuth2 Proxy](https://oauth2-proxy.github.io/oauth2-proxy/), which should handle the authentication of users.

## Permissions

If the authentication / authorization middleware for kobs is enabled via the `--api.auth.enabled` flag, we use the value from the `--api.auth.header.user` and `--api.auth.header.teams` header to authorize the user to access a plugin or Kubernetes resource. These headers should be set by a service like the OAuth2 Proxy like it is shown in the following examples.

The values from the headers are then used to get a [User CR](../resources/users.md) or a [Team CR](../resources/teams.md). If the user is part of multiple teams or when the permissions are set via the User CR and the Team CR, we merge all the permissions, so that the user can access all plugins and resources which are allowed for the user / teams.

## Examples

The following two examples show how you can setup kobs with an OAuth2 Proxy infront using the [NGINX Ingress Controller](https://kubernetes.github.io/ingress-nginx/) or [Istio](https://istio.io). Before you are looking into the examples, make sure you have setup your prefered [OAuth Provider](https://oauth2-proxy.github.io/oauth2-proxy/docs/configuration/oauth_provider). We will use Google as our OAuth Provider in the following, which requires a Client ID and a Client Secret.

We are installing kobs into a namespace named `kobs` using the provided [Helm Chart](../installation/helm.md). It will be available at [demo.kobs.io](https://demo.kobs.io), so keep in mind that you have to adjust the domain for your setup.

### NGINX Ingress Controller

In the first step we have to create a Deployment, Service and Ingress for the OAuth2 Proxy. With the example wich can be found in the following we are exposing the OAuth2 Proxy via the [oauth2-proxy.kobs.io](https://oauth2-proxy.kobs.io) domain. We are also setting all flags and secrets to use Google as our OAuth Provider and the `--set-authorization-header` and `--set-xauthrequest` flags to pass the email address of the authenticated user to kobs.

??? note "OAuth2 Proxy"

    ```yaml
    ---
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: oauth2-proxy
    spec:
      replicas: 1
      selector:
        matchLabels:
          app: oauth2-proxy
      template:
        metadata:
          labels:
            app: oauth2-proxy
        spec:
          containers:
            - name: kobs
              image: quay.io/oauth2-proxy/oauth2-proxy:v7.1.2
              args:
                - --provider=google
                - --skip-provider-button=true
                - --oidc-issuer-url=https://accounts.google.com
                - --upstream=static://200
                - --http-address=0.0.0.0:4180
                - --email-domain=kobs.io
                - --cookie-domain=.kobs.io
                - --whitelist-domain=.kobs.io
                - --set-authorization-header=true
                - --set-xauthrequest=true
              env:
                # For the sake of simplicity we directly setting the Client ID and Client Secret as value. In a production
                # environment you should set the values for these environment variables from a secret.
                - name: OAUTH2_PROXY_CLIENT_ID
                  value: <GOOGLE_CLIENT_ID>
                - name: OAUTH2_PROXY_CLIENT_SECRET
                  value: <GOOGLE_CLIENT_ID>
                # The Cookie Secret can be generated using the following command:
                # python -c 'import os,base64; print(base64.urlsafe_b64encode(os.urandom(16)).decode())'
                - name: OAUTH2_PROXY_COOKIE_SECRET
                  value: 7jctnRZlsQRSFaX76LK53w==
                - name: OAUTH2_PROXY_COOKIE_NAME
                  value: kobs-demo
              ports:
                - containerPort: 4180
                  name: http
                  protocol: TCP

    ---
    apiVersion: v1
    kind: Service
    metadata:
      name: oauth2-proxy
    spec:
      type: ClusterIP
      selector:
        app: oauth2-proxy
      ports:
        - name: http
          port: 4180
          protocol: TCP
          targetPort: http

    ---
    apiVersion: extensions/v1beta1
    kind: Ingress
    metadata:
      name: oauth2-proxy
      annotations:
        cert-manager.io/cluster-issuer: letsencrypt
        kubernetes.io/ingress.class: nginx
    spec:
      rules:
        - host: oauth2-proxy.kobs.io
          http:
            paths:
              - backend:
                  serviceName: oauth2-proxy
                  servicePort: http
                path: /
      tls:
        - hosts:
            - oauth2-proxy.kobs.io
          secretName: oauth2-proxy-cert
    ```

When the OAuth2 Proxy is running we can install kobs with the following values file. It will use all the default values from the Helm chart and just enables and configures the Ingress for kobs:

```yaml
ingress:
  enabled: true
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/auth-url: https://oauth2-proxy.kobs.io/oauth2/auth
    nginx.ingress.kubernetes.io/auth-signin: https://oauth2-proxy.kobs.io/oauth2/start?rd=https://demo.kobs.io
    nginx.ingress.kubernetes.io/auth-response-headers: 'X-Auth-Request-Email'
    nginx.ingress.kubernetes.io/configuration-snippet: |
      auth_request_set $email $upstream_http_x_auth_request_email;
      add_header X-Auth-Request-Email $email;
  hosts:
    - demo.kobs.io
  tls:
    - secretName: kobs-cert
      hosts:
        - demo.kobs.io
```

When you save the values from above in a file called `values.yaml`, you can run the following command to install kobs:

```sh
helm upgrade --install kobs kobs/kobs -f values.yaml
```

### Istio

In the first step we have to create a Deployment and Service the OAuth2 Proxy.

??? note "OAuth2 Proxy"

    ```yaml
    ---
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: oauth2-proxy
    spec:
      replicas: 1
      selector:
        matchLabels:
          app: oauth2-proxy
      template:
        metadata:
          labels:
            app: oauth2-proxy
        spec:
          containers:
            - name: kobs
              image: quay.io/oauth2-proxy/oauth2-proxy:v7.1.2
              args:
                - --provider=google
                - --skip-provider-button=true
                - --oidc-issuer-url=https://accounts.google.com
                - --upstream=static://200
                - --http-address=0.0.0.0:4180
                - --email-domain=kobs.io
                - --cookie-domain=.kobs.io
                - --whitelist-domain=.kobs.io
                - --set-authorization-header=true
                - --set-xauthrequest=true
              env:
                # For the sake of simplicity we directly setting the Client ID and Client Secret as value. In a production
                # environment you should set the values for these environment variables from a secret.
                - name: OAUTH2_PROXY_CLIENT_ID
                  value: <GOOGLE_CLIENT_ID>
                - name: OAUTH2_PROXY_CLIENT_SECRET
                  value: <GOOGLE_CLIENT_ID>
                # The Cookie Secret can be generated using the following command:
                # python -c 'import os,base64; print(base64.urlsafe_b64encode(os.urandom(16)).decode())'
                - name: OAUTH2_PROXY_COOKIE_SECRET
                  value: 7jctnRZlsQRSFaX76LK53w==
                - name: OAUTH2_PROXY_COOKIE_NAME
                  value: kobs-demo
              ports:
                - containerPort: 4180
                  name: http
                  protocol: TCP

    ---
    apiVersion: v1
    kind: Service
    metadata:
      name: oauth2-proxy
    spec:
      type: ClusterIP
      selector:
        app: oauth2-proxy
      ports:
        - name: http
          port: 4180
          protocol: TCP
          targetPort: http
    ```

When the OAuth2 Proxy is running we have to define the external authorizer that is allowed to be used in the mesh config. This is currently defined in the [extension provider](https://github.com/istio/api/blob/a205c627e4b955302bbb77dd837c8548e89e6e64/mesh/v1alpha1/config.proto#L534) in the mesh config.

```yaml
meshConfig:
  extensionProviders:
    - name: oauth2-proxy
      envoyExtAuthzHttp:
        service: oauth2-proxy.kobs.svc.cluster.local
        port: "4180"
        includeHeadersInCheck: ["authorization", "cookie"]
        headersToUpstreamOnAllow: ["authorization", "x-auth-request-email", "x-auth-request-groups"]
```

The external authorizer is now ready to be used by the authorization policy.

```yaml
---
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: kobs
spec:
  selector:
    matchLabels:
      app.kubernetes.io/instance: kobs
      app.kubernetes.io/name: kobs
  action: CUSTOM
  provider:
    name: oauth2-proxy
  rules:
    - to:
        - operation:
            hosts:
              - "*.kobs.io"
            notPaths:
              - "/oauth2*"
```

Now we have to adjust the `istio` section in the kobs Helm chart. In contrast to the NGINX Ingress Controller example we do not create an additional Ingress / VirtualService for the OAuth2 Proxy. Instead the OAuth2 Proxy is exposed on the same domain as kobs via an additiona route:

```yaml
istio:
  virtualService:
    enabled: true
    gateways:
      - istio-system/istio-default-gateway
    hosts:
      - demo.kobs.io
    timeout: 3600s
    additionalRoutes:
      - match:
          - uri:
              prefix: /oauth2
        route:
          - destination:
              host: oauth2-proxy.kobs.svc.cluster.local
              port:
                number: 4180
        timeout: 60s
```

When you save the values from above in a file called `values.yaml`, you can run the following command to install kobs:

```sh
helm upgrade --install kobs kobs/kobs -f values.yaml
```
