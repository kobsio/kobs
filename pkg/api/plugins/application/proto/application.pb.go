// Code generated by protoc-gen-go. DO NOT EDIT.
// versions:
// 	protoc-gen-go v1.25.0
// 	protoc        v3.14.0
// source: application.proto

package proto

import (
	proto "github.com/golang/protobuf/proto"
	proto1 "github.com/kobsio/kobs/pkg/api/plugins/plugins/proto"
	protoreflect "google.golang.org/protobuf/reflect/protoreflect"
	protoimpl "google.golang.org/protobuf/runtime/protoimpl"
	reflect "reflect"
	sync "sync"
)

const (
	// Verify that this generated code is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(20 - protoimpl.MinVersion)
	// Verify that runtime/protoimpl is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(protoimpl.MaxVersion - 20)
)

// This is a compile-time assertion that a sufficiently up-to-date version
// of the legacy proto package is being used.
const _ = proto.ProtoPackageIsVersion4

// Application is the specification for an application. This specification is also used for the Kubernetes CRD as
// ApplicationSpec.  This is also the reason why we use istio.io/tools/cmd/protoc-gen-deepcopy within the code
// generation, to generate the deepcopy function, which are required to use the Application within a CRD.
// Each Application contains a cluster, namespace and name, which are automitic determinded, when the Application is
// retrieved from the Kubernetes API.
type Application struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Cluster      string           `protobuf:"bytes,1,opt,name=cluster,proto3" json:"cluster,omitempty"`
	Namespace    string           `protobuf:"bytes,2,opt,name=namespace,proto3" json:"namespace,omitempty"`
	Name         string           `protobuf:"bytes,3,opt,name=name,proto3" json:"name,omitempty"`
	Details      *Details         `protobuf:"bytes,4,opt,name=details,proto3" json:"details,omitempty"`
	Teams        []string         `protobuf:"bytes,5,rep,name=teams,proto3" json:"teams,omitempty"`
	Resources    []*Resources     `protobuf:"bytes,6,rep,name=resources,proto3" json:"resources,omitempty"`
	Dependencies []*Dependency    `protobuf:"bytes,7,rep,name=dependencies,proto3" json:"dependencies,omitempty"`
	Plugins      []*proto1.Plugin `protobuf:"bytes,8,rep,name=plugins,proto3" json:"plugins,omitempty"`
}

func (x *Application) Reset() {
	*x = Application{}
	if protoimpl.UnsafeEnabled {
		mi := &file_application_proto_msgTypes[0]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *Application) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*Application) ProtoMessage() {}

func (x *Application) ProtoReflect() protoreflect.Message {
	mi := &file_application_proto_msgTypes[0]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use Application.ProtoReflect.Descriptor instead.
func (*Application) Descriptor() ([]byte, []int) {
	return file_application_proto_rawDescGZIP(), []int{0}
}

func (x *Application) GetCluster() string {
	if x != nil {
		return x.Cluster
	}
	return ""
}

func (x *Application) GetNamespace() string {
	if x != nil {
		return x.Namespace
	}
	return ""
}

func (x *Application) GetName() string {
	if x != nil {
		return x.Name
	}
	return ""
}

func (x *Application) GetDetails() *Details {
	if x != nil {
		return x.Details
	}
	return nil
}

func (x *Application) GetTeams() []string {
	if x != nil {
		return x.Teams
	}
	return nil
}

func (x *Application) GetResources() []*Resources {
	if x != nil {
		return x.Resources
	}
	return nil
}

func (x *Application) GetDependencies() []*Dependency {
	if x != nil {
		return x.Dependencies
	}
	return nil
}

func (x *Application) GetPlugins() []*proto1.Plugin {
	if x != nil {
		return x.Plugins
	}
	return nil
}

// Details contains some details for the Application, which are set by the user in the Custom Resource. Each Application
// can contain a description and a list of links.
type Details struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Description string         `protobuf:"bytes,1,opt,name=description,proto3" json:"description,omitempty"`
	Links       []*Link        `protobuf:"bytes,2,rep,name=links,proto3" json:"links,omitempty"`
	Plugin      *proto1.Plugin `protobuf:"bytes,3,opt,name=plugin,proto3" json:"plugin,omitempty"`
}

func (x *Details) Reset() {
	*x = Details{}
	if protoimpl.UnsafeEnabled {
		mi := &file_application_proto_msgTypes[1]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *Details) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*Details) ProtoMessage() {}

func (x *Details) ProtoReflect() protoreflect.Message {
	mi := &file_application_proto_msgTypes[1]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use Details.ProtoReflect.Descriptor instead.
func (*Details) Descriptor() ([]byte, []int) {
	return file_application_proto_rawDescGZIP(), []int{1}
}

func (x *Details) GetDescription() string {
	if x != nil {
		return x.Description
	}
	return ""
}

func (x *Details) GetLinks() []*Link {
	if x != nil {
		return x.Links
	}
	return nil
}

func (x *Details) GetPlugin() *proto1.Plugin {
	if x != nil {
		return x.Plugin
	}
	return nil
}

// Link is the format of a link, which can be provided within an Application. A link consists of a title, which is
// displayed in the frontend and the link, which is used within the href attribute (title=Example,
// link=https://example.com).
type Link struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Title string `protobuf:"bytes,1,opt,name=title,proto3" json:"title,omitempty"`
	Link  string `protobuf:"bytes,2,opt,name=link,proto3" json:"link,omitempty"`
}

func (x *Link) Reset() {
	*x = Link{}
	if protoimpl.UnsafeEnabled {
		mi := &file_application_proto_msgTypes[2]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *Link) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*Link) ProtoMessage() {}

func (x *Link) ProtoReflect() protoreflect.Message {
	mi := &file_application_proto_msgTypes[2]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use Link.ProtoReflect.Descriptor instead.
func (*Link) Descriptor() ([]byte, []int) {
	return file_application_proto_rawDescGZIP(), []int{2}
}

func (x *Link) GetTitle() string {
	if x != nil {
		return x.Title
	}
	return ""
}

func (x *Link) GetLink() string {
	if x != nil {
		return x.Link
	}
	return ""
}

// Resources is a list of resources, which can be associated with the Application. For each selector
// (e.g. app=prometheus) a list of resources can be specified. These kinds are the plural of the standard Kubernetes
// resources (e.g. pods, cronjobs. deployments, ...) or for CRDs resource.path
// (e.g. vaultsecrets.ricoberger.de/v1alpha1). The list of namespaces is optional and if not provided the namespace of
// the Application will be used to get the resources.
type Resources struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Namespaces []string `protobuf:"bytes,1,rep,name=namespaces,proto3" json:"namespaces,omitempty"`
	Kinds      []string `protobuf:"bytes,2,rep,name=kinds,proto3" json:"kinds,omitempty"`
	Selector   string   `protobuf:"bytes,3,opt,name=selector,proto3" json:"selector,omitempty"`
}

func (x *Resources) Reset() {
	*x = Resources{}
	if protoimpl.UnsafeEnabled {
		mi := &file_application_proto_msgTypes[3]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *Resources) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*Resources) ProtoMessage() {}

func (x *Resources) ProtoReflect() protoreflect.Message {
	mi := &file_application_proto_msgTypes[3]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use Resources.ProtoReflect.Descriptor instead.
func (*Resources) Descriptor() ([]byte, []int) {
	return file_application_proto_rawDescGZIP(), []int{3}
}

func (x *Resources) GetNamespaces() []string {
	if x != nil {
		return x.Namespaces
	}
	return nil
}

func (x *Resources) GetKinds() []string {
	if x != nil {
		return x.Kinds
	}
	return nil
}

func (x *Resources) GetSelector() string {
	if x != nil {
		return x.Selector
	}
	return ""
}

// Dependency is an application, which can be identified by the cluster, namespace and name. One application can have,
// multiple other applications as dependencies. When an application defines another application as dependency, we can
// render a topology chart for these application, to visulize the dependencies between applications.
// The dependency can also contain a description, which can be used to explain why the referenced application is a
// dependency in the current application.
type Dependency struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Cluster     string `protobuf:"bytes,1,opt,name=cluster,proto3" json:"cluster,omitempty"`
	Namespace   string `protobuf:"bytes,2,opt,name=namespace,proto3" json:"namespace,omitempty"`
	Name        string `protobuf:"bytes,3,opt,name=name,proto3" json:"name,omitempty"`
	Description string `protobuf:"bytes,4,opt,name=description,proto3" json:"description,omitempty"`
}

func (x *Dependency) Reset() {
	*x = Dependency{}
	if protoimpl.UnsafeEnabled {
		mi := &file_application_proto_msgTypes[4]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *Dependency) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*Dependency) ProtoMessage() {}

func (x *Dependency) ProtoReflect() protoreflect.Message {
	mi := &file_application_proto_msgTypes[4]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use Dependency.ProtoReflect.Descriptor instead.
func (*Dependency) Descriptor() ([]byte, []int) {
	return file_application_proto_rawDescGZIP(), []int{4}
}

func (x *Dependency) GetCluster() string {
	if x != nil {
		return x.Cluster
	}
	return ""
}

func (x *Dependency) GetNamespace() string {
	if x != nil {
		return x.Namespace
	}
	return ""
}

func (x *Dependency) GetName() string {
	if x != nil {
		return x.Name
	}
	return ""
}

func (x *Dependency) GetDescription() string {
	if x != nil {
		return x.Description
	}
	return ""
}

var File_application_proto protoreflect.FileDescriptor

var file_application_proto_rawDesc = []byte{
	0x0a, 0x11, 0x61, 0x70, 0x70, 0x6c, 0x69, 0x63, 0x61, 0x74, 0x69, 0x6f, 0x6e, 0x2e, 0x70, 0x72,
	0x6f, 0x74, 0x6f, 0x12, 0x0b, 0x61, 0x70, 0x70, 0x6c, 0x69, 0x63, 0x61, 0x74, 0x69, 0x6f, 0x6e,
	0x1a, 0x0d, 0x70, 0x6c, 0x75, 0x67, 0x69, 0x6e, 0x73, 0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x22,
	0xbd, 0x02, 0x0a, 0x0b, 0x41, 0x70, 0x70, 0x6c, 0x69, 0x63, 0x61, 0x74, 0x69, 0x6f, 0x6e, 0x12,
	0x18, 0x0a, 0x07, 0x63, 0x6c, 0x75, 0x73, 0x74, 0x65, 0x72, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09,
	0x52, 0x07, 0x63, 0x6c, 0x75, 0x73, 0x74, 0x65, 0x72, 0x12, 0x1c, 0x0a, 0x09, 0x6e, 0x61, 0x6d,
	0x65, 0x73, 0x70, 0x61, 0x63, 0x65, 0x18, 0x02, 0x20, 0x01, 0x28, 0x09, 0x52, 0x09, 0x6e, 0x61,
	0x6d, 0x65, 0x73, 0x70, 0x61, 0x63, 0x65, 0x12, 0x12, 0x0a, 0x04, 0x6e, 0x61, 0x6d, 0x65, 0x18,
	0x03, 0x20, 0x01, 0x28, 0x09, 0x52, 0x04, 0x6e, 0x61, 0x6d, 0x65, 0x12, 0x2e, 0x0a, 0x07, 0x64,
	0x65, 0x74, 0x61, 0x69, 0x6c, 0x73, 0x18, 0x04, 0x20, 0x01, 0x28, 0x0b, 0x32, 0x14, 0x2e, 0x61,
	0x70, 0x70, 0x6c, 0x69, 0x63, 0x61, 0x74, 0x69, 0x6f, 0x6e, 0x2e, 0x44, 0x65, 0x74, 0x61, 0x69,
	0x6c, 0x73, 0x52, 0x07, 0x64, 0x65, 0x74, 0x61, 0x69, 0x6c, 0x73, 0x12, 0x14, 0x0a, 0x05, 0x74,
	0x65, 0x61, 0x6d, 0x73, 0x18, 0x05, 0x20, 0x03, 0x28, 0x09, 0x52, 0x05, 0x74, 0x65, 0x61, 0x6d,
	0x73, 0x12, 0x34, 0x0a, 0x09, 0x72, 0x65, 0x73, 0x6f, 0x75, 0x72, 0x63, 0x65, 0x73, 0x18, 0x06,
	0x20, 0x03, 0x28, 0x0b, 0x32, 0x16, 0x2e, 0x61, 0x70, 0x70, 0x6c, 0x69, 0x63, 0x61, 0x74, 0x69,
	0x6f, 0x6e, 0x2e, 0x52, 0x65, 0x73, 0x6f, 0x75, 0x72, 0x63, 0x65, 0x73, 0x52, 0x09, 0x72, 0x65,
	0x73, 0x6f, 0x75, 0x72, 0x63, 0x65, 0x73, 0x12, 0x3b, 0x0a, 0x0c, 0x64, 0x65, 0x70, 0x65, 0x6e,
	0x64, 0x65, 0x6e, 0x63, 0x69, 0x65, 0x73, 0x18, 0x07, 0x20, 0x03, 0x28, 0x0b, 0x32, 0x17, 0x2e,
	0x61, 0x70, 0x70, 0x6c, 0x69, 0x63, 0x61, 0x74, 0x69, 0x6f, 0x6e, 0x2e, 0x44, 0x65, 0x70, 0x65,
	0x6e, 0x64, 0x65, 0x6e, 0x63, 0x79, 0x52, 0x0c, 0x64, 0x65, 0x70, 0x65, 0x6e, 0x64, 0x65, 0x6e,
	0x63, 0x69, 0x65, 0x73, 0x12, 0x29, 0x0a, 0x07, 0x70, 0x6c, 0x75, 0x67, 0x69, 0x6e, 0x73, 0x18,
	0x08, 0x20, 0x03, 0x28, 0x0b, 0x32, 0x0f, 0x2e, 0x70, 0x6c, 0x75, 0x67, 0x69, 0x6e, 0x73, 0x2e,
	0x50, 0x6c, 0x75, 0x67, 0x69, 0x6e, 0x52, 0x07, 0x70, 0x6c, 0x75, 0x67, 0x69, 0x6e, 0x73, 0x22,
	0x7d, 0x0a, 0x07, 0x44, 0x65, 0x74, 0x61, 0x69, 0x6c, 0x73, 0x12, 0x20, 0x0a, 0x0b, 0x64, 0x65,
	0x73, 0x63, 0x72, 0x69, 0x70, 0x74, 0x69, 0x6f, 0x6e, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52,
	0x0b, 0x64, 0x65, 0x73, 0x63, 0x72, 0x69, 0x70, 0x74, 0x69, 0x6f, 0x6e, 0x12, 0x27, 0x0a, 0x05,
	0x6c, 0x69, 0x6e, 0x6b, 0x73, 0x18, 0x02, 0x20, 0x03, 0x28, 0x0b, 0x32, 0x11, 0x2e, 0x61, 0x70,
	0x70, 0x6c, 0x69, 0x63, 0x61, 0x74, 0x69, 0x6f, 0x6e, 0x2e, 0x4c, 0x69, 0x6e, 0x6b, 0x52, 0x05,
	0x6c, 0x69, 0x6e, 0x6b, 0x73, 0x12, 0x27, 0x0a, 0x06, 0x70, 0x6c, 0x75, 0x67, 0x69, 0x6e, 0x18,
	0x03, 0x20, 0x01, 0x28, 0x0b, 0x32, 0x0f, 0x2e, 0x70, 0x6c, 0x75, 0x67, 0x69, 0x6e, 0x73, 0x2e,
	0x50, 0x6c, 0x75, 0x67, 0x69, 0x6e, 0x52, 0x06, 0x70, 0x6c, 0x75, 0x67, 0x69, 0x6e, 0x22, 0x30,
	0x0a, 0x04, 0x4c, 0x69, 0x6e, 0x6b, 0x12, 0x14, 0x0a, 0x05, 0x74, 0x69, 0x74, 0x6c, 0x65, 0x18,
	0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x05, 0x74, 0x69, 0x74, 0x6c, 0x65, 0x12, 0x12, 0x0a, 0x04,
	0x6c, 0x69, 0x6e, 0x6b, 0x18, 0x02, 0x20, 0x01, 0x28, 0x09, 0x52, 0x04, 0x6c, 0x69, 0x6e, 0x6b,
	0x22, 0x5d, 0x0a, 0x09, 0x52, 0x65, 0x73, 0x6f, 0x75, 0x72, 0x63, 0x65, 0x73, 0x12, 0x1e, 0x0a,
	0x0a, 0x6e, 0x61, 0x6d, 0x65, 0x73, 0x70, 0x61, 0x63, 0x65, 0x73, 0x18, 0x01, 0x20, 0x03, 0x28,
	0x09, 0x52, 0x0a, 0x6e, 0x61, 0x6d, 0x65, 0x73, 0x70, 0x61, 0x63, 0x65, 0x73, 0x12, 0x14, 0x0a,
	0x05, 0x6b, 0x69, 0x6e, 0x64, 0x73, 0x18, 0x02, 0x20, 0x03, 0x28, 0x09, 0x52, 0x05, 0x6b, 0x69,
	0x6e, 0x64, 0x73, 0x12, 0x1a, 0x0a, 0x08, 0x73, 0x65, 0x6c, 0x65, 0x63, 0x74, 0x6f, 0x72, 0x18,
	0x03, 0x20, 0x01, 0x28, 0x09, 0x52, 0x08, 0x73, 0x65, 0x6c, 0x65, 0x63, 0x74, 0x6f, 0x72, 0x22,
	0x7a, 0x0a, 0x0a, 0x44, 0x65, 0x70, 0x65, 0x6e, 0x64, 0x65, 0x6e, 0x63, 0x79, 0x12, 0x18, 0x0a,
	0x07, 0x63, 0x6c, 0x75, 0x73, 0x74, 0x65, 0x72, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x07,
	0x63, 0x6c, 0x75, 0x73, 0x74, 0x65, 0x72, 0x12, 0x1c, 0x0a, 0x09, 0x6e, 0x61, 0x6d, 0x65, 0x73,
	0x70, 0x61, 0x63, 0x65, 0x18, 0x02, 0x20, 0x01, 0x28, 0x09, 0x52, 0x09, 0x6e, 0x61, 0x6d, 0x65,
	0x73, 0x70, 0x61, 0x63, 0x65, 0x12, 0x12, 0x0a, 0x04, 0x6e, 0x61, 0x6d, 0x65, 0x18, 0x03, 0x20,
	0x01, 0x28, 0x09, 0x52, 0x04, 0x6e, 0x61, 0x6d, 0x65, 0x12, 0x20, 0x0a, 0x0b, 0x64, 0x65, 0x73,
	0x63, 0x72, 0x69, 0x70, 0x74, 0x69, 0x6f, 0x6e, 0x18, 0x04, 0x20, 0x01, 0x28, 0x09, 0x52, 0x0b,
	0x64, 0x65, 0x73, 0x63, 0x72, 0x69, 0x70, 0x74, 0x69, 0x6f, 0x6e, 0x42, 0x3a, 0x5a, 0x38, 0x67,
	0x69, 0x74, 0x68, 0x75, 0x62, 0x2e, 0x63, 0x6f, 0x6d, 0x2f, 0x6b, 0x6f, 0x62, 0x73, 0x69, 0x6f,
	0x2f, 0x6b, 0x6f, 0x62, 0x73, 0x2f, 0x70, 0x6b, 0x67, 0x2f, 0x61, 0x70, 0x69, 0x2f, 0x70, 0x6c,
	0x75, 0x67, 0x69, 0x6e, 0x73, 0x2f, 0x61, 0x70, 0x70, 0x6c, 0x69, 0x63, 0x61, 0x74, 0x69, 0x6f,
	0x6e, 0x2f, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x62, 0x06, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x33,
}

var (
	file_application_proto_rawDescOnce sync.Once
	file_application_proto_rawDescData = file_application_proto_rawDesc
)

func file_application_proto_rawDescGZIP() []byte {
	file_application_proto_rawDescOnce.Do(func() {
		file_application_proto_rawDescData = protoimpl.X.CompressGZIP(file_application_proto_rawDescData)
	})
	return file_application_proto_rawDescData
}

var file_application_proto_msgTypes = make([]protoimpl.MessageInfo, 5)
var file_application_proto_goTypes = []interface{}{
	(*Application)(nil),   // 0: application.Application
	(*Details)(nil),       // 1: application.Details
	(*Link)(nil),          // 2: application.Link
	(*Resources)(nil),     // 3: application.Resources
	(*Dependency)(nil),    // 4: application.Dependency
	(*proto1.Plugin)(nil), // 5: plugins.Plugin
}
var file_application_proto_depIdxs = []int32{
	1, // 0: application.Application.details:type_name -> application.Details
	3, // 1: application.Application.resources:type_name -> application.Resources
	4, // 2: application.Application.dependencies:type_name -> application.Dependency
	5, // 3: application.Application.plugins:type_name -> plugins.Plugin
	2, // 4: application.Details.links:type_name -> application.Link
	5, // 5: application.Details.plugin:type_name -> plugins.Plugin
	6, // [6:6] is the sub-list for method output_type
	6, // [6:6] is the sub-list for method input_type
	6, // [6:6] is the sub-list for extension type_name
	6, // [6:6] is the sub-list for extension extendee
	0, // [0:6] is the sub-list for field type_name
}

func init() { file_application_proto_init() }
func file_application_proto_init() {
	if File_application_proto != nil {
		return
	}
	if !protoimpl.UnsafeEnabled {
		file_application_proto_msgTypes[0].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*Application); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_application_proto_msgTypes[1].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*Details); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_application_proto_msgTypes[2].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*Link); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_application_proto_msgTypes[3].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*Resources); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_application_proto_msgTypes[4].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*Dependency); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
	}
	type x struct{}
	out := protoimpl.TypeBuilder{
		File: protoimpl.DescBuilder{
			GoPackagePath: reflect.TypeOf(x{}).PkgPath(),
			RawDescriptor: file_application_proto_rawDesc,
			NumEnums:      0,
			NumMessages:   5,
			NumExtensions: 0,
			NumServices:   0,
		},
		GoTypes:           file_application_proto_goTypes,
		DependencyIndexes: file_application_proto_depIdxs,
		MessageInfos:      file_application_proto_msgTypes,
	}.Build()
	File_application_proto = out.File
	file_application_proto_rawDesc = nil
	file_application_proto_goTypes = nil
	file_application_proto_depIdxs = nil
}
