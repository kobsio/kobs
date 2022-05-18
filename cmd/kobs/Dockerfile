FROM --platform=linux/amd64 node:16.13.0 as app
WORKDIR /kobs
COPY lerna.json package.json yarn.lock Makefile /kobs/
COPY packages /kobs/packages
RUN yarn install --frozen-lockfile --network-timeout 3600000
RUN yarn build
RUN make generate-assets

FROM golang:1.18.2-alpine3.15 as api
RUN apk update && apk add git make build-base
WORKDIR /kobs
COPY go.mod go.sum /kobs/
RUN go mod download
COPY . .
RUN export CGO_ENABLED=0 && make build && make build-plugins

FROM alpine:3.14.2
RUN apk update && apk add --no-cache ca-certificates
RUN mkdir /kobs
COPY --from=api /kobs/bin/kobs /kobs
COPY --from=api /kobs/bin/plugins /kobs/plugins
COPY --from=app /kobs/bin/app /kobs/app
WORKDIR /kobs
USER nobody
ENTRYPOINT  [ "/kobs/kobs" ]
