FROM --platform=linux/amd64 node:14 as app
WORKDIR /kobs
COPY app/package.json app/yarn.lock /kobs/
RUN yarn install
COPY app /kobs/
RUN yarn build

FROM golang:1.15.6-alpine3.12 as api
ARG TARGETPLATFORM
ARG BUILDPLATFORM
RUN echo "Building on $BUILDPLATFORM, for $TARGETPLATFORM" > /log
RUN apk update && apk add git make
WORKDIR /kobs
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN make build

FROM alpine:3.12.0
RUN apk update && apk add --no-cache ca-certificates
RUN mkdir /kobs
COPY --from=app /kobs/build /kobs/app/build
COPY --from=api /kobs/bin/kobs /kobs
WORKDIR /kobs
USER nobody
ENTRYPOINT  [ "/kobs/kobs" ]
