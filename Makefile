BRANCH      ?= $(shell git rev-parse --abbrev-ref HEAD)
BUILDTIME   ?= $(shell date '+%Y-%m-%d@%H:%M:%S')
BUILDUSER   ?= $(shell id -un)
REPO        ?= github.com/kobsio/kobs
REVISION    ?= $(shell git rev-parse HEAD)
VERSION     ?= $(shell git describe --tags)

PLUGINS ?= $(shell find ./proto -name '*.proto' | sed -e 's/^.\/proto\///' | sed -e 's/.proto//')
CRDS    ?= application team template

.PHONY: build
build:
	@go build -ldflags "-X ${REPO}/pkg/version.Version=${VERSION} \
		-X ${REPO}/pkg/version.Revision=${REVISION} \
		-X ${REPO}/pkg/version.Branch=${BRANCH} \
		-X ${REPO}/pkg/version.BuildUser=${BUILDUSER} \
		-X ${REPO}/pkg/version.BuildDate=${BUILDTIME}" \
		-o ./bin/kobs ./cmd/kobs;

.PHONY: generate
generate: generate-proto generate-crds

.PHONY: generate-proto
generate-proto:
	for plugin in $(PLUGINS); do \
		mkdir -p pkg/api/plugins/$$plugin/proto; \
		mkdir -p app/src/proto; \
		protoc --proto_path=proto --go_out=pkg/api/plugins/$$plugin/proto --go_opt=paths=source_relative --go-grpc_out=pkg/api/plugins/$$plugin/proto --go-grpc_opt=paths=source_relative --deepcopy_out=pkg/api/plugins/$$plugin/proto --js_out=import_style=commonjs:app/src/proto --plugin=protoc-gen-ts=app/node_modules/.bin/protoc-gen-ts --ts_out=service=grpc-web:app/src/proto --grpc-web_out=import_style=commonjs,mode=grpcwebtext:app/src/proto proto/$$plugin.proto; \
		rm -rf ./pkg/api/plugins/$$plugin/proto/$$plugin\_deepcopy.gen.go; \
		mv ./pkg/api/plugins/$$plugin/proto/github.com/kobsio/kobs/pkg/api/plugins/$$plugin/proto/$$plugin\_deepcopy.gen.go ./pkg/api/plugins/$$plugin/proto; \
		rm -rf ./pkg/api/plugins/$$plugin/proto/github.com; \
	done

.PHONY: generate-crds
generate-crds:
	for crd in $(CRDS); do \
		${GOPATH}/src/k8s.io/code-generator/generate-groups.sh "deepcopy,client,informer,lister" github.com/kobsio/kobs/pkg/api/plugins/$$crd github.com/kobsio/kobs/pkg/api/plugins/$$crd/apis $$crd:v1alpha1 --output-base ./tmp; \
		rm -rf ./pkg/api/plugins/$$crd/apis/$$crd/v1alpha1/zz_generated.deepcopy.go; \
		rm -rf ./pkg/api/plugins/$$crd/clientset; \
		rm -rf ./pkg/api/plugins/$$crd/informers; \
		rm -rf ./pkg/api/plugins/$$crd/listers; \
		mv ./tmp/github.com/kobsio/kobs/pkg/api/plugins/$$crd/apis/$$crd/v1alpha1/zz_generated.deepcopy.go ./pkg/api/plugins/$$crd/apis/$$crd/v1alpha1; \
		mv ./tmp/github.com/kobsio/kobs/pkg/api/plugins/$$crd/clientset ./pkg/api/plugins/$$crd/clientset; \
		mv ./tmp/github.com/kobsio/kobs/pkg/api/plugins/$$crd/informers ./pkg/api/plugins/$$crd/informers; \
		mv ./tmp/github.com/kobsio/kobs/pkg/api/plugins/$$crd/listers ./pkg/api/plugins/$$crd/listers; \
		rm -rf ./tmp; \
	done
	-controller-gen "crd:crdVersions={v1},trivialVersions=true" paths="./..." output:crd:artifacts:config=deploy/kustomize/crds; \

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
