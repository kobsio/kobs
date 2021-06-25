BRANCH    ?= $(shell git rev-parse --abbrev-ref HEAD)
BUILDTIME ?= $(shell date '+%Y-%m-%d@%H:%M:%S')
BUILDUSER ?= $(shell id -un)
REPO      ?= github.com/kobsio/kobs
REVISION  ?= $(shell git rev-parse HEAD)
VERSION   ?= $(shell git describe --tags)

CRDS ?= team application

.PHONY: build
build:
	@go build -ldflags "-X ${REPO}/pkg/version.Version=${VERSION} \
		-X ${REPO}/pkg/version.Revision=${REVISION} \
		-X ${REPO}/pkg/version.Branch=${BRANCH} \
		-X ${REPO}/pkg/version.BuildUser=${BUILDUSER} \
		-X ${REPO}/pkg/version.BuildDate=${BUILDTIME}" \
		-o ./bin/kobs ./cmd/kobs;

.PHONY: generate
generate: generate-crds

.PHONY: generate-crds
generate-crds:
	for crd in $(CRDS); do \
		${GOPATH}/src/k8s.io/code-generator/generate-groups.sh "deepcopy,client,informer,lister" github.com/kobsio/kobs/pkg/api/clients/$$crd github.com/kobsio/kobs/pkg/api/apis $$crd:v1beta1 --output-base ./tmp; \
		rm -rf ./pkg/api/apis/$$crd/v1beta1/zz_generated.deepcopy.go; \
		rm -rf ./pkg/api/clients/$$crd/clientset; \
		rm -rf ./pkg/api/clients/$$crd/informers; \
		rm -rf ./pkg/api/clients/$$crd/listers; \
		mv ./tmp/github.com/kobsio/kobs/pkg/api/apis/$$crd/v1beta1/zz_generated.deepcopy.go ./pkg/api/apis/$$crd/v1beta1; \
		mv ./tmp/github.com/kobsio/kobs/pkg/api/clients/$$crd/clientset ./pkg/api/clients/$$crd/clientset; \
		mv ./tmp/github.com/kobsio/kobs/pkg/api/clients/$$crd/informers ./pkg/api/clients/$$crd/informers; \
		mv ./tmp/github.com/kobsio/kobs/pkg/api/clients/$$crd/listers ./pkg/api/clients/$$crd/listers; \
		rm -rf ./tmp; \
	done
	controller-gen "crd:crdVersions={v1},trivialVersions=true" paths="./..." output:crd:artifacts:config=deploy/kustomize/crds; \

.PHONY: release-major
release-major:
	$(eval MAJORVERSION=$(shell git describe --tags --abbrev=0 | sed s/v// | awk -F. '{print "v"$$1+1".0.0"}'))
	@git checkout main
	@git pull
	@git tag -a $(MAJORVERSION) -m 'Release $(MAJORVERSION)'
	@git push origin --tags

.PHONY: release-minor
release-minor:
	$(eval MINORVERSION=$(shell git describe --tags --abbrev=0 | sed s/v// | awk -F. '{print "v"$$1"."$$2+1".0"}'))
	@git checkout main
	@git pull
	@git tag -a $(MINORVERSION) -m 'Release $(MINORVERSION)'
	@git push origin --tags

.PHONY: release-patch
release-patch:
	$(eval PATCHVERSION=$(shell git describe --tags --abbrev=0 | sed s/v// | awk -F. '{print "v"$$1"."$$2"."$$3+1}'))
	@git checkout main
	@git pull
	@git tag -a $(PATCHVERSION) -m 'Release $(PATCHVERSION)'
	@git push origin --tags
