// Code generated by protoc-gen-go. DO NOT EDIT.
// versions:
// 	protoc-gen-go v1.25.0
// 	protoc        v3.12.3
// source: plugins.proto

package proto

import (
	proto "github.com/golang/protobuf/proto"
	proto2 "github.com/kobsio/kobs/pkg/api/plugins/elasticsearch/proto"
	proto3 "github.com/kobsio/kobs/pkg/api/plugins/jaeger/proto"
	proto1 "github.com/kobsio/kobs/pkg/api/plugins/prometheus/proto"
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

// GetPluginsRequest is the request to get all loaded plugins via the GetPlugins method.
type GetPluginsRequest struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields
}

func (x *GetPluginsRequest) Reset() {
	*x = GetPluginsRequest{}
	if protoimpl.UnsafeEnabled {
		mi := &file_plugins_proto_msgTypes[0]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *GetPluginsRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*GetPluginsRequest) ProtoMessage() {}

func (x *GetPluginsRequest) ProtoReflect() protoreflect.Message {
	mi := &file_plugins_proto_msgTypes[0]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use GetPluginsRequest.ProtoReflect.Descriptor instead.
func (*GetPluginsRequest) Descriptor() ([]byte, []int) {
	return file_plugins_proto_rawDescGZIP(), []int{0}
}

// GetPluginsResponse is the response for a GetPlugins request. It contains a plugins with their name and type.
type GetPluginsResponse struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Plugins []*PluginShort `protobuf:"bytes,1,rep,name=plugins,proto3" json:"plugins,omitempty"`
}

func (x *GetPluginsResponse) Reset() {
	*x = GetPluginsResponse{}
	if protoimpl.UnsafeEnabled {
		mi := &file_plugins_proto_msgTypes[1]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *GetPluginsResponse) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*GetPluginsResponse) ProtoMessage() {}

func (x *GetPluginsResponse) ProtoReflect() protoreflect.Message {
	mi := &file_plugins_proto_msgTypes[1]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use GetPluginsResponse.ProtoReflect.Descriptor instead.
func (*GetPluginsResponse) Descriptor() ([]byte, []int) {
	return file_plugins_proto_rawDescGZIP(), []int{1}
}

func (x *GetPluginsResponse) GetPlugins() []*PluginShort {
	if x != nil {
		return x.Plugins
	}
	return nil
}

// PluginShort represents a single plugin. Each plugin can be identified by his name and type. This is the least
// necessary data we need in our React UI to associate the name of a plugin with the correct component. As an optional
// property, a plugin can also have a description.
type PluginShort struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Name        string `protobuf:"bytes,1,opt,name=name,proto3" json:"name,omitempty"`
	Description string `protobuf:"bytes,2,opt,name=description,proto3" json:"description,omitempty"`
	Type        string `protobuf:"bytes,3,opt,name=type,proto3" json:"type,omitempty"`
}

func (x *PluginShort) Reset() {
	*x = PluginShort{}
	if protoimpl.UnsafeEnabled {
		mi := &file_plugins_proto_msgTypes[2]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *PluginShort) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*PluginShort) ProtoMessage() {}

func (x *PluginShort) ProtoReflect() protoreflect.Message {
	mi := &file_plugins_proto_msgTypes[2]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use PluginShort.ProtoReflect.Descriptor instead.
func (*PluginShort) Descriptor() ([]byte, []int) {
	return file_plugins_proto_rawDescGZIP(), []int{2}
}

func (x *PluginShort) GetName() string {
	if x != nil {
		return x.Name
	}
	return ""
}

func (x *PluginShort) GetDescription() string {
	if x != nil {
		return x.Description
	}
	return ""
}

func (x *PluginShort) GetType() string {
	if x != nil {
		return x.Type
	}
	return ""
}

// Plugin is the plugin formate, which can be used within the Application CR. Each plugin requires a name. The plugin
// specific fields like "prometheus", "elasticsearch" and "jaeger" are mutually exclusive and containing the data, which
// is needed to use the plugin within a Application CR.
type Plugin struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Name          string       `protobuf:"bytes,1,opt,name=name,proto3" json:"name,omitempty"`
	DisplayName   string       `protobuf:"bytes,2,opt,name=displayName,proto3" json:"displayName,omitempty"`
	Prometheus    *proto1.Spec `protobuf:"bytes,3,opt,name=prometheus,proto3" json:"prometheus,omitempty"`
	Elasticsearch *proto2.Spec `protobuf:"bytes,4,opt,name=elasticsearch,proto3" json:"elasticsearch,omitempty"`
	Jaeger        *proto3.Spec `protobuf:"bytes,5,opt,name=jaeger,proto3" json:"jaeger,omitempty"`
}

func (x *Plugin) Reset() {
	*x = Plugin{}
	if protoimpl.UnsafeEnabled {
		mi := &file_plugins_proto_msgTypes[3]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *Plugin) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*Plugin) ProtoMessage() {}

func (x *Plugin) ProtoReflect() protoreflect.Message {
	mi := &file_plugins_proto_msgTypes[3]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use Plugin.ProtoReflect.Descriptor instead.
func (*Plugin) Descriptor() ([]byte, []int) {
	return file_plugins_proto_rawDescGZIP(), []int{3}
}

func (x *Plugin) GetName() string {
	if x != nil {
		return x.Name
	}
	return ""
}

func (x *Plugin) GetDisplayName() string {
	if x != nil {
		return x.DisplayName
	}
	return ""
}

func (x *Plugin) GetPrometheus() *proto1.Spec {
	if x != nil {
		return x.Prometheus
	}
	return nil
}

func (x *Plugin) GetElasticsearch() *proto2.Spec {
	if x != nil {
		return x.Elasticsearch
	}
	return nil
}

func (x *Plugin) GetJaeger() *proto3.Spec {
	if x != nil {
		return x.Jaeger
	}
	return nil
}

var File_plugins_proto protoreflect.FileDescriptor

var file_plugins_proto_rawDesc = []byte{
	0x0a, 0x0d, 0x70, 0x6c, 0x75, 0x67, 0x69, 0x6e, 0x73, 0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x12,
	0x07, 0x70, 0x6c, 0x75, 0x67, 0x69, 0x6e, 0x73, 0x1a, 0x10, 0x70, 0x72, 0x6f, 0x6d, 0x65, 0x74,
	0x68, 0x65, 0x75, 0x73, 0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x1a, 0x13, 0x65, 0x6c, 0x61, 0x73,
	0x74, 0x69, 0x63, 0x73, 0x65, 0x61, 0x72, 0x63, 0x68, 0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x1a,
	0x0c, 0x6a, 0x61, 0x65, 0x67, 0x65, 0x72, 0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x22, 0x13, 0x0a,
	0x11, 0x47, 0x65, 0x74, 0x50, 0x6c, 0x75, 0x67, 0x69, 0x6e, 0x73, 0x52, 0x65, 0x71, 0x75, 0x65,
	0x73, 0x74, 0x22, 0x44, 0x0a, 0x12, 0x47, 0x65, 0x74, 0x50, 0x6c, 0x75, 0x67, 0x69, 0x6e, 0x73,
	0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73, 0x65, 0x12, 0x2e, 0x0a, 0x07, 0x70, 0x6c, 0x75, 0x67,
	0x69, 0x6e, 0x73, 0x18, 0x01, 0x20, 0x03, 0x28, 0x0b, 0x32, 0x14, 0x2e, 0x70, 0x6c, 0x75, 0x67,
	0x69, 0x6e, 0x73, 0x2e, 0x50, 0x6c, 0x75, 0x67, 0x69, 0x6e, 0x53, 0x68, 0x6f, 0x72, 0x74, 0x52,
	0x07, 0x70, 0x6c, 0x75, 0x67, 0x69, 0x6e, 0x73, 0x22, 0x57, 0x0a, 0x0b, 0x50, 0x6c, 0x75, 0x67,
	0x69, 0x6e, 0x53, 0x68, 0x6f, 0x72, 0x74, 0x12, 0x12, 0x0a, 0x04, 0x6e, 0x61, 0x6d, 0x65, 0x18,
	0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x04, 0x6e, 0x61, 0x6d, 0x65, 0x12, 0x20, 0x0a, 0x0b, 0x64,
	0x65, 0x73, 0x63, 0x72, 0x69, 0x70, 0x74, 0x69, 0x6f, 0x6e, 0x18, 0x02, 0x20, 0x01, 0x28, 0x09,
	0x52, 0x0b, 0x64, 0x65, 0x73, 0x63, 0x72, 0x69, 0x70, 0x74, 0x69, 0x6f, 0x6e, 0x12, 0x12, 0x0a,
	0x04, 0x74, 0x79, 0x70, 0x65, 0x18, 0x03, 0x20, 0x01, 0x28, 0x09, 0x52, 0x04, 0x74, 0x79, 0x70,
	0x65, 0x22, 0xe9, 0x01, 0x0a, 0x06, 0x50, 0x6c, 0x75, 0x67, 0x69, 0x6e, 0x12, 0x12, 0x0a, 0x04,
	0x6e, 0x61, 0x6d, 0x65, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x04, 0x6e, 0x61, 0x6d, 0x65,
	0x12, 0x20, 0x0a, 0x0b, 0x64, 0x69, 0x73, 0x70, 0x6c, 0x61, 0x79, 0x4e, 0x61, 0x6d, 0x65, 0x18,
	0x02, 0x20, 0x01, 0x28, 0x09, 0x52, 0x0b, 0x64, 0x69, 0x73, 0x70, 0x6c, 0x61, 0x79, 0x4e, 0x61,
	0x6d, 0x65, 0x12, 0x38, 0x0a, 0x0a, 0x70, 0x72, 0x6f, 0x6d, 0x65, 0x74, 0x68, 0x65, 0x75, 0x73,
	0x18, 0x03, 0x20, 0x01, 0x28, 0x0b, 0x32, 0x18, 0x2e, 0x70, 0x6c, 0x75, 0x67, 0x69, 0x6e, 0x73,
	0x2e, 0x70, 0x72, 0x6f, 0x6d, 0x65, 0x74, 0x68, 0x65, 0x75, 0x73, 0x2e, 0x53, 0x70, 0x65, 0x63,
	0x52, 0x0a, 0x70, 0x72, 0x6f, 0x6d, 0x65, 0x74, 0x68, 0x65, 0x75, 0x73, 0x12, 0x41, 0x0a, 0x0d,
	0x65, 0x6c, 0x61, 0x73, 0x74, 0x69, 0x63, 0x73, 0x65, 0x61, 0x72, 0x63, 0x68, 0x18, 0x04, 0x20,
	0x01, 0x28, 0x0b, 0x32, 0x1b, 0x2e, 0x70, 0x6c, 0x75, 0x67, 0x69, 0x6e, 0x73, 0x2e, 0x65, 0x6c,
	0x61, 0x73, 0x74, 0x69, 0x63, 0x73, 0x65, 0x61, 0x72, 0x63, 0x68, 0x2e, 0x53, 0x70, 0x65, 0x63,
	0x52, 0x0d, 0x65, 0x6c, 0x61, 0x73, 0x74, 0x69, 0x63, 0x73, 0x65, 0x61, 0x72, 0x63, 0x68, 0x12,
	0x2c, 0x0a, 0x06, 0x6a, 0x61, 0x65, 0x67, 0x65, 0x72, 0x18, 0x05, 0x20, 0x01, 0x28, 0x0b, 0x32,
	0x14, 0x2e, 0x70, 0x6c, 0x75, 0x67, 0x69, 0x6e, 0x73, 0x2e, 0x6a, 0x61, 0x65, 0x67, 0x65, 0x72,
	0x2e, 0x53, 0x70, 0x65, 0x63, 0x52, 0x06, 0x6a, 0x61, 0x65, 0x67, 0x65, 0x72, 0x32, 0x52, 0x0a,
	0x07, 0x50, 0x6c, 0x75, 0x67, 0x69, 0x6e, 0x73, 0x12, 0x47, 0x0a, 0x0a, 0x47, 0x65, 0x74, 0x50,
	0x6c, 0x75, 0x67, 0x69, 0x6e, 0x73, 0x12, 0x1a, 0x2e, 0x70, 0x6c, 0x75, 0x67, 0x69, 0x6e, 0x73,
	0x2e, 0x47, 0x65, 0x74, 0x50, 0x6c, 0x75, 0x67, 0x69, 0x6e, 0x73, 0x52, 0x65, 0x71, 0x75, 0x65,
	0x73, 0x74, 0x1a, 0x1b, 0x2e, 0x70, 0x6c, 0x75, 0x67, 0x69, 0x6e, 0x73, 0x2e, 0x47, 0x65, 0x74,
	0x50, 0x6c, 0x75, 0x67, 0x69, 0x6e, 0x73, 0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73, 0x65, 0x22,
	0x00, 0x42, 0x36, 0x5a, 0x34, 0x67, 0x69, 0x74, 0x68, 0x75, 0x62, 0x2e, 0x63, 0x6f, 0x6d, 0x2f,
	0x6b, 0x6f, 0x62, 0x73, 0x69, 0x6f, 0x2f, 0x6b, 0x6f, 0x62, 0x73, 0x2f, 0x70, 0x6b, 0x67, 0x2f,
	0x61, 0x70, 0x69, 0x2f, 0x70, 0x6c, 0x75, 0x67, 0x69, 0x6e, 0x73, 0x2f, 0x70, 0x6c, 0x75, 0x67,
	0x69, 0x6e, 0x73, 0x2f, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x62, 0x06, 0x70, 0x72, 0x6f, 0x74, 0x6f,
	0x33,
}

var (
	file_plugins_proto_rawDescOnce sync.Once
	file_plugins_proto_rawDescData = file_plugins_proto_rawDesc
)

func file_plugins_proto_rawDescGZIP() []byte {
	file_plugins_proto_rawDescOnce.Do(func() {
		file_plugins_proto_rawDescData = protoimpl.X.CompressGZIP(file_plugins_proto_rawDescData)
	})
	return file_plugins_proto_rawDescData
}

var file_plugins_proto_msgTypes = make([]protoimpl.MessageInfo, 4)
var file_plugins_proto_goTypes = []interface{}{
	(*GetPluginsRequest)(nil),  // 0: plugins.GetPluginsRequest
	(*GetPluginsResponse)(nil), // 1: plugins.GetPluginsResponse
	(*PluginShort)(nil),        // 2: plugins.PluginShort
	(*Plugin)(nil),             // 3: plugins.Plugin
	(*proto1.Spec)(nil),        // 4: plugins.prometheus.Spec
	(*proto2.Spec)(nil),        // 5: plugins.elasticsearch.Spec
	(*proto3.Spec)(nil),        // 6: plugins.jaeger.Spec
}
var file_plugins_proto_depIdxs = []int32{
	2, // 0: plugins.GetPluginsResponse.plugins:type_name -> plugins.PluginShort
	4, // 1: plugins.Plugin.prometheus:type_name -> plugins.prometheus.Spec
	5, // 2: plugins.Plugin.elasticsearch:type_name -> plugins.elasticsearch.Spec
	6, // 3: plugins.Plugin.jaeger:type_name -> plugins.jaeger.Spec
	0, // 4: plugins.Plugins.GetPlugins:input_type -> plugins.GetPluginsRequest
	1, // 5: plugins.Plugins.GetPlugins:output_type -> plugins.GetPluginsResponse
	5, // [5:6] is the sub-list for method output_type
	4, // [4:5] is the sub-list for method input_type
	4, // [4:4] is the sub-list for extension type_name
	4, // [4:4] is the sub-list for extension extendee
	0, // [0:4] is the sub-list for field type_name
}

func init() { file_plugins_proto_init() }
func file_plugins_proto_init() {
	if File_plugins_proto != nil {
		return
	}
	if !protoimpl.UnsafeEnabled {
		file_plugins_proto_msgTypes[0].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*GetPluginsRequest); i {
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
		file_plugins_proto_msgTypes[1].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*GetPluginsResponse); i {
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
		file_plugins_proto_msgTypes[2].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*PluginShort); i {
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
		file_plugins_proto_msgTypes[3].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*Plugin); i {
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
			RawDescriptor: file_plugins_proto_rawDesc,
			NumEnums:      0,
			NumMessages:   4,
			NumExtensions: 0,
			NumServices:   1,
		},
		GoTypes:           file_plugins_proto_goTypes,
		DependencyIndexes: file_plugins_proto_depIdxs,
		MessageInfos:      file_plugins_proto_msgTypes,
	}.Build()
	File_plugins_proto = out.File
	file_plugins_proto_rawDesc = nil
	file_plugins_proto_goTypes = nil
	file_plugins_proto_depIdxs = nil
}
