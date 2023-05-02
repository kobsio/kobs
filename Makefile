BRANCH    ?= $(shell git rev-parse --abbrev-ref HEAD)
BUILDTIME ?= $(shell date '+%Y-%m-%d@%H:%M:%S')
BUILDUSER ?= $(shell id -un)
REPO      ?= github.com/kobsio/kobs
REVISION  ?= $(shell git rev-parse HEAD)
VERSION   ?= $(shell git describe --tags)

CRDS ?= application dashboard team user

.PHONY: build
build:
	@echo "Build 'kobs' binary"
	@go build -ldflags "-X ${REPO}/pkg/version.Version=${VERSION} \
		-X ${REPO}/pkg/version.Revision=${REVISION} \
		-X ${REPO}/pkg/version.Branch=${BRANCH} \
		-X ${REPO}/pkg/version.BuildUser=${BUILDUSER} \
		-X ${REPO}/pkg/version.BuildDate=${BUILDTIME}" \
		-o ./bin/kobs ./cmd/kobs;

.PHONY: test
test:
	@go test ./cmd/... ./pkg/...

.PHONY: test-coverage
test-coverage:
	@go test -coverpkg ./cmd/...,./pkg/... -coverprofile=coverage.out -covermode=atomic ./cmd/... ./pkg/...
	@cat coverage.out | grep -v "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis" | grep -v "github.com/kobsio/kobs/pkg/cluster/kubernetes/clients" | grep -v "_mock.go" > coverage_modified.out; mv coverage_modified.out coverage.out
	@go tool cover -html coverage.out -o coverage.html

.PHONY: generate
generate: generate-mocks generate-crds

.PHONY: generate-mocks
generate-mocks:
	@go generate ./...

.PHONY: generate-crds
generate-crds:
	@for crd in $(CRDS); do \
		./hack/generate-groups.sh "deepcopy,client,informer,lister" github.com/kobsio/kobs/pkg/cluster/kubernetes/clients/$$crd github.com/kobsio/kobs/pkg/cluster/kubernetes/apis $$crd:v1 --go-header-file ./hack/boilerplate.go.txt --output-base ./tmp; \
		rm -rf ./pkg/cluster/kubernetes/apis/$$crd/v1/zz_generated.deepcopy.go; \
		rm -rf ./pkg/cluster/kubernetes/clients/$$crd/clientset; \
		rm -rf ./pkg/cluster/kubernetes/clients/$$crd/informers; \
		rm -rf ./pkg/cluster/kubernetes/clients/$$crd/listers; \
		mkdir -p ./pkg/cluster/kubernetes/clients/$$crd; \
		mv ./tmp/github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/$$crd/v1/zz_generated.deepcopy.go ./pkg/cluster/kubernetes/apis/$$crd/v1; \
		mv ./tmp/github.com/kobsio/kobs/pkg/cluster/kubernetes/clients/$$crd/clientset ./pkg/cluster/kubernetes/clients/$$crd/clientset; \
		mv ./tmp/github.com/kobsio/kobs/pkg/cluster/kubernetes/clients/$$crd/informers ./pkg/cluster/kubernetes/clients/$$crd/informers; \
		mv ./tmp/github.com/kobsio/kobs/pkg/cluster/kubernetes/clients/$$crd/listers ./pkg/cluster/kubernetes/clients/$$crd/listers; \
		rm -rf ./tmp; \
	done

	@controller-gen "crd:crdVersions={v1}" paths="./pkg/..." output:crd:artifacts:config=deploy/kustomize/crds

	@for crd in $(CRDS); do \
		cp ./deploy/kustomize/crds/kobs.io_$$crd\s.yaml ./deploy/helm/kobs/crds/kobs.io_$$crd\s.yaml; \
	done

.PHONY: clean
clean:
	rm -rf ./bin
	find . -name 'node_modules' -type d -prune -exec rm -rf '{}' +
	find . -name 'dist' -type d -prune -exec rm -rf '{}' +
