FROM node:16.19.0 as app
WORKDIR /kobs
COPY app /kobs/
RUN npm clean-install
RUN npm run build

FROM golang:1.19.6 as api
WORKDIR /kobs
COPY go.mod go.sum /kobs/
RUN go mod download
COPY . .
RUN export CGO_ENABLED=0 && make build

FROM alpine:3.17.2
RUN apk update && apk add --no-cache ca-certificates
RUN mkdir /kobs
COPY --from=api /kobs/bin/kobs /kobs
COPY --from=app /kobs/packages/app/dist /kobs/app
WORKDIR /kobs
USER nobody
ENTRYPOINT  [ "/kobs/kobs" ]
