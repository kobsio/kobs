FROM --platform=linux/amd64 node:14 as baseapp
WORKDIR /kobs
COPY lerna.json package.json yarn.lock /kobs/

COPY app/package.json /kobs/app/

COPY plugins/applications/package.json /kobs/plugins/applications/
COPY plugins/clickhouse/package.json /kobs/plugins/clickhouse/
COPY plugins/core/package.json /kobs/plugins/core/
COPY plugins/dashboards/package.json /kobs/plugins/dashboards/
COPY plugins/elasticsearch/package.json /kobs/plugins/elasticsearch/
COPY plugins/flux/package.json /kobs/plugins/flux/
COPY plugins/jaeger/package.json /kobs/plugins/jaeger/
COPY plugins/kiali/package.json /kobs/plugins/kiali/
COPY plugins/markdown/package.json /kobs/plugins/markdown/
COPY plugins/opsgenie/package.json /kobs/plugins/opsgenie/
COPY plugins/prometheus/package.json /kobs/plugins/prometheus/
COPY plugins/resources/package.json /kobs/plugins/resources/
COPY plugins/rss/package.json /kobs/plugins/rss/
COPY plugins/sql/package.json /kobs/plugins/sql/
COPY plugins/teams/package.json /kobs/plugins/teams/

RUN yarn install --frozen-lockfile --network-timeout 3600000


FROM --platform=linux/amd64 node:14 as app
WORKDIR /kobs
COPY lerna.json package.json tsconfig.json typings.d.ts yarn.lock /kobs/
COPY app /kobs/app
COPY plugins /kobs/plugins

COPY --from=baseapp /kobs/node_modules /kobs/node_modules
COPY --from=baseapp /kobs/app/node_modules /kobs/app/node_modules

COPY --from=baseapp /kobs/plugins/applications/node_modules /kobs/plugins/applications/node_modules
COPY --from=baseapp /kobs/plugins/clickhouse/node_modules /kobs/plugins/clickhouse/node_modules
COPY --from=baseapp /kobs/plugins/core/node_modules /kobs/plugins/core/node_modules
COPY --from=baseapp /kobs/plugins/dashboards/node_modules /kobs/plugins/dashboards/node_modules
COPY --from=baseapp /kobs/plugins/elasticsearch/node_modules /kobs/plugins/elasticsearch/node_modules
COPY --from=baseapp /kobs/plugins/flux/node_modules /kobs/plugins/flux/node_modules
COPY --from=baseapp /kobs/plugins/jaeger/node_modules /kobs/plugins/jaeger/node_modules
COPY --from=baseapp /kobs/plugins/kiali/node_modules /kobs/plugins/kiali/node_modules
COPY --from=baseapp /kobs/plugins/markdown/node_modules /kobs/plugins/markdown/node_modules
COPY --from=baseapp /kobs/plugins/opsgenie/node_modules /kobs/plugins/opsgenie/node_modules
COPY --from=baseapp /kobs/plugins/prometheus/node_modules /kobs/plugins/prometheus/node_modules
COPY --from=baseapp /kobs/plugins/resources/node_modules /kobs/plugins/resources/node_modules
COPY --from=baseapp /kobs/plugins/rss/node_modules /kobs/plugins/rss/node_modules
COPY --from=baseapp /kobs/plugins/sql/node_modules /kobs/plugins/sql/node_modules
COPY --from=baseapp /kobs/plugins/teams/node_modules /kobs/plugins/teams/node_modules

RUN yarn build


FROM golang:1.17.0-alpine3.14 as api
ARG TARGETPLATFORM
ARG BUILDPLATFORM
RUN echo "Building on $BUILDPLATFORM, for $TARGETPLATFORM" > /log
RUN apk update && apk add git make
WORKDIR /kobs
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN make build


FROM alpine:3.14
RUN apk update && apk add --no-cache ca-certificates
RUN mkdir /kobs
COPY --from=app /kobs/app/build /kobs/app/build
COPY --from=api /kobs/bin/kobs /kobs
WORKDIR /kobs
USER nobody
ENTRYPOINT  [ "/kobs/kobs" ]
