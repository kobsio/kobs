FROM --platform=linux/amd64 node:16.13.0 as app
WORKDIR /kobs
COPY lerna.json package.json tsconfig.json typings.d.ts yarn.lock /kobs/
COPY app /kobs/app
COPY plugins /kobs/plugins
RUN yarn install --frozen-lockfile --network-timeout 3600000
RUN yarn build

FROM golang:1.17.3-alpine3.14 as api
RUN apk update && apk add git make
WORKDIR /kobs
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN export CGO_ENABLED=0 && make build

FROM alpine:3.14.2
RUN apk update && apk add --no-cache ca-certificates
RUN mkdir /kobs
COPY --from=app /kobs/app/build /kobs/app/build
COPY --from=api /kobs/bin/kobs /kobs
WORKDIR /kobs
USER nobody
ENTRYPOINT  [ "/kobs/kobs" ]
