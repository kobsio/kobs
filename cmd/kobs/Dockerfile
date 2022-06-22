FROM --platform=linux/amd64 node:16.13.0 as app
WORKDIR /kobs
COPY lerna.json package.json yarn.lock Makefile /kobs/
COPY plugins /kobs/plugins
RUN yarn install --frozen-lockfile --network-timeout 3600000
RUN make generate-assets

FROM golang:1.18.3 as api
WORKDIR /kobs
COPY go.mod go.sum /kobs/
RUN go mod download
COPY . .
RUN export CGO_ENABLED=1 && make build && make build-plugins

FROM debian:stable-20220527
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates
RUN update-ca-certificates
RUN mkdir /kobs
COPY --from=api /kobs/bin/kobs /kobs
COPY --from=api /kobs/bin/plugins /kobs/plugins
COPY --from=app /kobs/bin/app /kobs/app
WORKDIR /kobs
USER nobody
ENTRYPOINT  [ "/kobs/kobs" ]
