BRANCH      ?= $(shell git rev-parse --abbrev-ref HEAD)
BUILDTIME   ?= $(shell date '+%Y-%m-%d@%H:%M:%S')
BUILDUSER   ?= $(shell id -un)
REPO        ?= github.com/kobsio/kobs
REVISION    ?= $(shell git rev-parse HEAD)
VERSION     ?= $(shell git describe --tags)

.PHONY: build
build:
	@go build -ldflags "-X ${REPO}/pkg/version.Version=${VERSION} \
		-X ${REPO}/pkg/version.Revision=${REVISION} \
		-X ${REPO}/pkg/version.Branch=${BRANCH} \
		-X ${REPO}/pkg/version.BuildUser=${BUILDUSER} \
		-X ${REPO}/pkg/version.BuildDate=${BUILDTIME}" \
		-o ./bin/kobs ./cmd/kobs;

.PHONY: generate
generate: generate-proto generate-crd

.PHONY: generate-proto
generate-proto:
	@protoc --proto_path=proto --go_out=pkg/generated/proto --go_opt=paths=source_relative --go-grpc_out=pkg/generated/proto --go-grpc_opt=paths=source_relative --deepcopy_out=pkg/generated/proto --js_out=import_style=commonjs:app/src/generated/proto --plugin=protoc-gen-ts=app/node_modules/.bin/protoc-gen-ts --ts_out=service=grpc-web:app/src/generated/proto --grpc-web_out=import_style=commonjs,mode=grpcwebtext:app/src/generated/proto proto/clusters.proto
	@protoc --proto_path=proto --go_out=pkg/generated/proto --go_opt=paths=source_relative --go-grpc_out=pkg/generated/proto --go-grpc_opt=paths=source_relative --deepcopy_out=pkg/generated/proto --js_out=import_style=commonjs:app/src/generated/proto --plugin=protoc-gen-ts=app/node_modules/.bin/protoc-gen-ts --ts_out=service=grpc-web:app/src/generated/proto --grpc-web_out=import_style=commonjs,mode=grpcwebtext:app/src/generated/proto proto/applications.proto
	@rm -rf ./pkg/generated/proto/clusters_deepcopy.gen.go
	@rm -rf ./pkg/generated/proto/applications_deepcopy.gen.go
	@mv ./pkg/generated/proto/github.com/kobsio/kobs/pkg/generated/proto/clusters_deepcopy.gen.go ./pkg/generated/proto
	@mv ./pkg/generated/proto/github.com/kobsio/kobs/pkg/generated/proto/applications_deepcopy.gen.go ./pkg/generated/proto
	@rm -rf ./pkg/generated/proto/github.com

.PHONY: generate-crd
generate-crd:
	@${GOPATH}/src/k8s.io/code-generator/generate-groups.sh "deepcopy,client,informer,lister" github.com/kobsio/kobs/pkg/generated github.com/kobsio/kobs/pkg/api/kubernetes/apis application:v1alpha1 --output-base ./tmp
	@rm -rf ./pkg/api/kubernetes/apis/application/v1alpha1/zz_generated.deepcopy.go
	@rm -rf ./pkg/generated/clientset
	@rm -rf ./pkg/generated/informers
	@rm -rf ./pkg/generated/listers
	@mv ./tmp/github.com/kobsio/kobs/pkg/api/kubernetes/apis/application/v1alpha1/zz_generated.deepcopy.go ./pkg/api/kubernetes/apis/application/v1alpha1
	@mv ./tmp/github.com/kobsio/kobs/pkg/generated/clientset ./pkg/generated/clientset
	@mv ./tmp/github.com/kobsio/kobs/pkg/generated/informers ./pkg/generated/informers
	@mv ./tmp/github.com/kobsio/kobs/pkg/generated/listers ./pkg/generated/listers
	@rm -rf ./tmp
	-controller-gen "crd:trivialVersions=true" paths="./..." output:crd:artifacts:config=deploy/kustomize/crds

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
