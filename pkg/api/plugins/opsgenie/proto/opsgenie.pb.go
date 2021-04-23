// Code generated by protoc-gen-go. DO NOT EDIT.
// versions:
// 	protoc-gen-go v1.25.0
// 	protoc        v3.14.0
// source: opsgenie.proto

package proto

import (
	proto "github.com/golang/protobuf/proto"
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

// GetAlertsRequest is the format for the call to get alerts from Opsgenie. This requires the name of the configured
// Opsgenie instance and a Opsgenie query.
// See: https://support.atlassian.com/opsgenie/docs/search-queries-for-alerts/
type GetAlertsRequest struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Name  string `protobuf:"bytes,1,opt,name=name,proto3" json:"name,omitempty"`
	Query string `protobuf:"bytes,2,opt,name=query,proto3" json:"query,omitempty"`
}

func (x *GetAlertsRequest) Reset() {
	*x = GetAlertsRequest{}
	if protoimpl.UnsafeEnabled {
		mi := &file_opsgenie_proto_msgTypes[0]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *GetAlertsRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*GetAlertsRequest) ProtoMessage() {}

func (x *GetAlertsRequest) ProtoReflect() protoreflect.Message {
	mi := &file_opsgenie_proto_msgTypes[0]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use GetAlertsRequest.ProtoReflect.Descriptor instead.
func (*GetAlertsRequest) Descriptor() ([]byte, []int) {
	return file_opsgenie_proto_rawDescGZIP(), []int{0}
}

func (x *GetAlertsRequest) GetName() string {
	if x != nil {
		return x.Name
	}
	return ""
}

func (x *GetAlertsRequest) GetQuery() string {
	if x != nil {
		return x.Query
	}
	return ""
}

// GetAlertsResponse is the response format for a GetAlerts call. It contains a list of alert.
type GetAlertsResponse struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Alerts []*Alert `protobuf:"bytes,1,rep,name=alerts,proto3" json:"alerts,omitempty"`
}

func (x *GetAlertsResponse) Reset() {
	*x = GetAlertsResponse{}
	if protoimpl.UnsafeEnabled {
		mi := &file_opsgenie_proto_msgTypes[1]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *GetAlertsResponse) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*GetAlertsResponse) ProtoMessage() {}

func (x *GetAlertsResponse) ProtoReflect() protoreflect.Message {
	mi := &file_opsgenie_proto_msgTypes[1]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use GetAlertsResponse.ProtoReflect.Descriptor instead.
func (*GetAlertsResponse) Descriptor() ([]byte, []int) {
	return file_opsgenie_proto_rawDescGZIP(), []int{1}
}

func (x *GetAlertsResponse) GetAlerts() []*Alert {
	if x != nil {
		return x.Alerts
	}
	return nil
}

// GetAlertRequest is the message format to get a single alert. Each alert can be identified by the Opsgenie instance
// and it's unique ID.
type GetAlertRequest struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Name string `protobuf:"bytes,1,opt,name=name,proto3" json:"name,omitempty"`
	Id   string `protobuf:"bytes,2,opt,name=id,proto3" json:"id,omitempty"`
}

func (x *GetAlertRequest) Reset() {
	*x = GetAlertRequest{}
	if protoimpl.UnsafeEnabled {
		mi := &file_opsgenie_proto_msgTypes[2]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *GetAlertRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*GetAlertRequest) ProtoMessage() {}

func (x *GetAlertRequest) ProtoReflect() protoreflect.Message {
	mi := &file_opsgenie_proto_msgTypes[2]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use GetAlertRequest.ProtoReflect.Descriptor instead.
func (*GetAlertRequest) Descriptor() ([]byte, []int) {
	return file_opsgenie_proto_rawDescGZIP(), []int{2}
}

func (x *GetAlertRequest) GetName() string {
	if x != nil {
		return x.Name
	}
	return ""
}

func (x *GetAlertRequest) GetId() string {
	if x != nil {
		return x.Id
	}
	return ""
}

// GetAlertResponse is the response format for a GetAlert call. It contains a single alert.
type GetAlertResponse struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Alert *Alert `protobuf:"bytes,1,opt,name=alert,proto3" json:"alert,omitempty"`
}

func (x *GetAlertResponse) Reset() {
	*x = GetAlertResponse{}
	if protoimpl.UnsafeEnabled {
		mi := &file_opsgenie_proto_msgTypes[3]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *GetAlertResponse) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*GetAlertResponse) ProtoMessage() {}

func (x *GetAlertResponse) ProtoReflect() protoreflect.Message {
	mi := &file_opsgenie_proto_msgTypes[3]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use GetAlertResponse.ProtoReflect.Descriptor instead.
func (*GetAlertResponse) Descriptor() ([]byte, []int) {
	return file_opsgenie_proto_rawDescGZIP(), []int{3}
}

func (x *GetAlertResponse) GetAlert() *Alert {
	if x != nil {
		return x.Alert
	}
	return nil
}

// Alert is the structure of an Opsgenie alert. It contains the same fields as the response of the Opsgenie API. When
// the alert is used within the GetAlert function it also contains the description, details and a list of responders.
// These fields are omitted for the GetAlerts call.
type Alert struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Id            string            `protobuf:"bytes,1,opt,name=id,proto3" json:"id,omitempty"`
	TinyId        string            `protobuf:"bytes,2,opt,name=tinyId,proto3" json:"tinyId,omitempty"`
	Alias         string            `protobuf:"bytes,3,opt,name=alias,proto3" json:"alias,omitempty"`
	Message       string            `protobuf:"bytes,4,opt,name=message,proto3" json:"message,omitempty"`
	Status        string            `protobuf:"bytes,5,opt,name=status,proto3" json:"status,omitempty"`
	Acknowledged  bool              `protobuf:"varint,6,opt,name=acknowledged,proto3" json:"acknowledged,omitempty"`
	IsSeen        bool              `protobuf:"varint,7,opt,name=isSeen,proto3" json:"isSeen,omitempty"`
	Tags          []string          `protobuf:"bytes,8,rep,name=tags,proto3" json:"tags,omitempty"`
	Snoozed       bool              `protobuf:"varint,9,opt,name=snoozed,proto3" json:"snoozed,omitempty"`
	SnoozedUntil  int64             `protobuf:"varint,10,opt,name=snoozedUntil,proto3" json:"snoozedUntil,omitempty"`
	Count         int64             `protobuf:"varint,11,opt,name=count,proto3" json:"count,omitempty"`
	LastOccuredAt int64             `protobuf:"varint,12,opt,name=lastOccuredAt,proto3" json:"lastOccuredAt,omitempty"`
	CreatedAt     int64             `protobuf:"varint,13,opt,name=createdAt,proto3" json:"createdAt,omitempty"`
	UpdatedAt     int64             `protobuf:"varint,14,opt,name=updatedAt,proto3" json:"updatedAt,omitempty"`
	Source        string            `protobuf:"bytes,15,opt,name=source,proto3" json:"source,omitempty"`
	Owner         string            `protobuf:"bytes,16,opt,name=owner,proto3" json:"owner,omitempty"`
	Priority      string            `protobuf:"bytes,17,opt,name=priority,proto3" json:"priority,omitempty"`
	Responders    []string          `protobuf:"bytes,18,rep,name=responders,proto3" json:"responders,omitempty"`
	Description   string            `protobuf:"bytes,19,opt,name=description,proto3" json:"description,omitempty"`
	Details       map[string]string `protobuf:"bytes,20,rep,name=details,proto3" json:"details,omitempty" protobuf_key:"bytes,1,opt,name=key,proto3" protobuf_val:"bytes,2,opt,name=value,proto3"`
}

func (x *Alert) Reset() {
	*x = Alert{}
	if protoimpl.UnsafeEnabled {
		mi := &file_opsgenie_proto_msgTypes[4]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *Alert) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*Alert) ProtoMessage() {}

func (x *Alert) ProtoReflect() protoreflect.Message {
	mi := &file_opsgenie_proto_msgTypes[4]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use Alert.ProtoReflect.Descriptor instead.
func (*Alert) Descriptor() ([]byte, []int) {
	return file_opsgenie_proto_rawDescGZIP(), []int{4}
}

func (x *Alert) GetId() string {
	if x != nil {
		return x.Id
	}
	return ""
}

func (x *Alert) GetTinyId() string {
	if x != nil {
		return x.TinyId
	}
	return ""
}

func (x *Alert) GetAlias() string {
	if x != nil {
		return x.Alias
	}
	return ""
}

func (x *Alert) GetMessage() string {
	if x != nil {
		return x.Message
	}
	return ""
}

func (x *Alert) GetStatus() string {
	if x != nil {
		return x.Status
	}
	return ""
}

func (x *Alert) GetAcknowledged() bool {
	if x != nil {
		return x.Acknowledged
	}
	return false
}

func (x *Alert) GetIsSeen() bool {
	if x != nil {
		return x.IsSeen
	}
	return false
}

func (x *Alert) GetTags() []string {
	if x != nil {
		return x.Tags
	}
	return nil
}

func (x *Alert) GetSnoozed() bool {
	if x != nil {
		return x.Snoozed
	}
	return false
}

func (x *Alert) GetSnoozedUntil() int64 {
	if x != nil {
		return x.SnoozedUntil
	}
	return 0
}

func (x *Alert) GetCount() int64 {
	if x != nil {
		return x.Count
	}
	return 0
}

func (x *Alert) GetLastOccuredAt() int64 {
	if x != nil {
		return x.LastOccuredAt
	}
	return 0
}

func (x *Alert) GetCreatedAt() int64 {
	if x != nil {
		return x.CreatedAt
	}
	return 0
}

func (x *Alert) GetUpdatedAt() int64 {
	if x != nil {
		return x.UpdatedAt
	}
	return 0
}

func (x *Alert) GetSource() string {
	if x != nil {
		return x.Source
	}
	return ""
}

func (x *Alert) GetOwner() string {
	if x != nil {
		return x.Owner
	}
	return ""
}

func (x *Alert) GetPriority() string {
	if x != nil {
		return x.Priority
	}
	return ""
}

func (x *Alert) GetResponders() []string {
	if x != nil {
		return x.Responders
	}
	return nil
}

func (x *Alert) GetDescription() string {
	if x != nil {
		return x.Description
	}
	return ""
}

func (x *Alert) GetDetails() map[string]string {
	if x != nil {
		return x.Details
	}
	return nil
}

// Spec implements the specification for an application. This field is then used in the Application CR and contains, all
// possible fields, which can be used by a user to work with Opsgenie.
type Spec struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Queries []*Query `protobuf:"bytes,2,rep,name=queries,proto3" json:"queries,omitempty"`
}

func (x *Spec) Reset() {
	*x = Spec{}
	if protoimpl.UnsafeEnabled {
		mi := &file_opsgenie_proto_msgTypes[5]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *Spec) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*Spec) ProtoMessage() {}

func (x *Spec) ProtoReflect() protoreflect.Message {
	mi := &file_opsgenie_proto_msgTypes[5]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use Spec.ProtoReflect.Descriptor instead.
func (*Spec) Descriptor() ([]byte, []int) {
	return file_opsgenie_proto_rawDescGZIP(), []int{5}
}

func (x *Spec) GetQueries() []*Query {
	if x != nil {
		return x.Queries
	}
	return nil
}

// Query represents a single query for an application. A query is identified by a name and a query.
type Query struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Name  string `protobuf:"bytes,1,opt,name=name,proto3" json:"name,omitempty"`
	Query string `protobuf:"bytes,2,opt,name=query,proto3" json:"query,omitempty"`
}

func (x *Query) Reset() {
	*x = Query{}
	if protoimpl.UnsafeEnabled {
		mi := &file_opsgenie_proto_msgTypes[6]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *Query) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*Query) ProtoMessage() {}

func (x *Query) ProtoReflect() protoreflect.Message {
	mi := &file_opsgenie_proto_msgTypes[6]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use Query.ProtoReflect.Descriptor instead.
func (*Query) Descriptor() ([]byte, []int) {
	return file_opsgenie_proto_rawDescGZIP(), []int{6}
}

func (x *Query) GetName() string {
	if x != nil {
		return x.Name
	}
	return ""
}

func (x *Query) GetQuery() string {
	if x != nil {
		return x.Query
	}
	return ""
}

var File_opsgenie_proto protoreflect.FileDescriptor

var file_opsgenie_proto_rawDesc = []byte{
	0x0a, 0x0e, 0x6f, 0x70, 0x73, 0x67, 0x65, 0x6e, 0x69, 0x65, 0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f,
	0x12, 0x10, 0x70, 0x6c, 0x75, 0x67, 0x69, 0x6e, 0x73, 0x2e, 0x6f, 0x70, 0x73, 0x67, 0x65, 0x6e,
	0x69, 0x65, 0x22, 0x3c, 0x0a, 0x10, 0x47, 0x65, 0x74, 0x41, 0x6c, 0x65, 0x72, 0x74, 0x73, 0x52,
	0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x12, 0x12, 0x0a, 0x04, 0x6e, 0x61, 0x6d, 0x65, 0x18, 0x01,
	0x20, 0x01, 0x28, 0x09, 0x52, 0x04, 0x6e, 0x61, 0x6d, 0x65, 0x12, 0x14, 0x0a, 0x05, 0x71, 0x75,
	0x65, 0x72, 0x79, 0x18, 0x02, 0x20, 0x01, 0x28, 0x09, 0x52, 0x05, 0x71, 0x75, 0x65, 0x72, 0x79,
	0x22, 0x44, 0x0a, 0x11, 0x47, 0x65, 0x74, 0x41, 0x6c, 0x65, 0x72, 0x74, 0x73, 0x52, 0x65, 0x73,
	0x70, 0x6f, 0x6e, 0x73, 0x65, 0x12, 0x2f, 0x0a, 0x06, 0x61, 0x6c, 0x65, 0x72, 0x74, 0x73, 0x18,
	0x01, 0x20, 0x03, 0x28, 0x0b, 0x32, 0x17, 0x2e, 0x70, 0x6c, 0x75, 0x67, 0x69, 0x6e, 0x73, 0x2e,
	0x6f, 0x70, 0x73, 0x67, 0x65, 0x6e, 0x69, 0x65, 0x2e, 0x41, 0x6c, 0x65, 0x72, 0x74, 0x52, 0x06,
	0x61, 0x6c, 0x65, 0x72, 0x74, 0x73, 0x22, 0x35, 0x0a, 0x0f, 0x47, 0x65, 0x74, 0x41, 0x6c, 0x65,
	0x72, 0x74, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x12, 0x12, 0x0a, 0x04, 0x6e, 0x61, 0x6d,
	0x65, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x04, 0x6e, 0x61, 0x6d, 0x65, 0x12, 0x0e, 0x0a,
	0x02, 0x69, 0x64, 0x18, 0x02, 0x20, 0x01, 0x28, 0x09, 0x52, 0x02, 0x69, 0x64, 0x22, 0x41, 0x0a,
	0x10, 0x47, 0x65, 0x74, 0x41, 0x6c, 0x65, 0x72, 0x74, 0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73,
	0x65, 0x12, 0x2d, 0x0a, 0x05, 0x61, 0x6c, 0x65, 0x72, 0x74, 0x18, 0x01, 0x20, 0x01, 0x28, 0x0b,
	0x32, 0x17, 0x2e, 0x70, 0x6c, 0x75, 0x67, 0x69, 0x6e, 0x73, 0x2e, 0x6f, 0x70, 0x73, 0x67, 0x65,
	0x6e, 0x69, 0x65, 0x2e, 0x41, 0x6c, 0x65, 0x72, 0x74, 0x52, 0x05, 0x61, 0x6c, 0x65, 0x72, 0x74,
	0x22, 0x85, 0x05, 0x0a, 0x05, 0x41, 0x6c, 0x65, 0x72, 0x74, 0x12, 0x0e, 0x0a, 0x02, 0x69, 0x64,
	0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x02, 0x69, 0x64, 0x12, 0x16, 0x0a, 0x06, 0x74, 0x69,
	0x6e, 0x79, 0x49, 0x64, 0x18, 0x02, 0x20, 0x01, 0x28, 0x09, 0x52, 0x06, 0x74, 0x69, 0x6e, 0x79,
	0x49, 0x64, 0x12, 0x14, 0x0a, 0x05, 0x61, 0x6c, 0x69, 0x61, 0x73, 0x18, 0x03, 0x20, 0x01, 0x28,
	0x09, 0x52, 0x05, 0x61, 0x6c, 0x69, 0x61, 0x73, 0x12, 0x18, 0x0a, 0x07, 0x6d, 0x65, 0x73, 0x73,
	0x61, 0x67, 0x65, 0x18, 0x04, 0x20, 0x01, 0x28, 0x09, 0x52, 0x07, 0x6d, 0x65, 0x73, 0x73, 0x61,
	0x67, 0x65, 0x12, 0x16, 0x0a, 0x06, 0x73, 0x74, 0x61, 0x74, 0x75, 0x73, 0x18, 0x05, 0x20, 0x01,
	0x28, 0x09, 0x52, 0x06, 0x73, 0x74, 0x61, 0x74, 0x75, 0x73, 0x12, 0x22, 0x0a, 0x0c, 0x61, 0x63,
	0x6b, 0x6e, 0x6f, 0x77, 0x6c, 0x65, 0x64, 0x67, 0x65, 0x64, 0x18, 0x06, 0x20, 0x01, 0x28, 0x08,
	0x52, 0x0c, 0x61, 0x63, 0x6b, 0x6e, 0x6f, 0x77, 0x6c, 0x65, 0x64, 0x67, 0x65, 0x64, 0x12, 0x16,
	0x0a, 0x06, 0x69, 0x73, 0x53, 0x65, 0x65, 0x6e, 0x18, 0x07, 0x20, 0x01, 0x28, 0x08, 0x52, 0x06,
	0x69, 0x73, 0x53, 0x65, 0x65, 0x6e, 0x12, 0x12, 0x0a, 0x04, 0x74, 0x61, 0x67, 0x73, 0x18, 0x08,
	0x20, 0x03, 0x28, 0x09, 0x52, 0x04, 0x74, 0x61, 0x67, 0x73, 0x12, 0x18, 0x0a, 0x07, 0x73, 0x6e,
	0x6f, 0x6f, 0x7a, 0x65, 0x64, 0x18, 0x09, 0x20, 0x01, 0x28, 0x08, 0x52, 0x07, 0x73, 0x6e, 0x6f,
	0x6f, 0x7a, 0x65, 0x64, 0x12, 0x22, 0x0a, 0x0c, 0x73, 0x6e, 0x6f, 0x6f, 0x7a, 0x65, 0x64, 0x55,
	0x6e, 0x74, 0x69, 0x6c, 0x18, 0x0a, 0x20, 0x01, 0x28, 0x03, 0x52, 0x0c, 0x73, 0x6e, 0x6f, 0x6f,
	0x7a, 0x65, 0x64, 0x55, 0x6e, 0x74, 0x69, 0x6c, 0x12, 0x14, 0x0a, 0x05, 0x63, 0x6f, 0x75, 0x6e,
	0x74, 0x18, 0x0b, 0x20, 0x01, 0x28, 0x03, 0x52, 0x05, 0x63, 0x6f, 0x75, 0x6e, 0x74, 0x12, 0x24,
	0x0a, 0x0d, 0x6c, 0x61, 0x73, 0x74, 0x4f, 0x63, 0x63, 0x75, 0x72, 0x65, 0x64, 0x41, 0x74, 0x18,
	0x0c, 0x20, 0x01, 0x28, 0x03, 0x52, 0x0d, 0x6c, 0x61, 0x73, 0x74, 0x4f, 0x63, 0x63, 0x75, 0x72,
	0x65, 0x64, 0x41, 0x74, 0x12, 0x1c, 0x0a, 0x09, 0x63, 0x72, 0x65, 0x61, 0x74, 0x65, 0x64, 0x41,
	0x74, 0x18, 0x0d, 0x20, 0x01, 0x28, 0x03, 0x52, 0x09, 0x63, 0x72, 0x65, 0x61, 0x74, 0x65, 0x64,
	0x41, 0x74, 0x12, 0x1c, 0x0a, 0x09, 0x75, 0x70, 0x64, 0x61, 0x74, 0x65, 0x64, 0x41, 0x74, 0x18,
	0x0e, 0x20, 0x01, 0x28, 0x03, 0x52, 0x09, 0x75, 0x70, 0x64, 0x61, 0x74, 0x65, 0x64, 0x41, 0x74,
	0x12, 0x16, 0x0a, 0x06, 0x73, 0x6f, 0x75, 0x72, 0x63, 0x65, 0x18, 0x0f, 0x20, 0x01, 0x28, 0x09,
	0x52, 0x06, 0x73, 0x6f, 0x75, 0x72, 0x63, 0x65, 0x12, 0x14, 0x0a, 0x05, 0x6f, 0x77, 0x6e, 0x65,
	0x72, 0x18, 0x10, 0x20, 0x01, 0x28, 0x09, 0x52, 0x05, 0x6f, 0x77, 0x6e, 0x65, 0x72, 0x12, 0x1a,
	0x0a, 0x08, 0x70, 0x72, 0x69, 0x6f, 0x72, 0x69, 0x74, 0x79, 0x18, 0x11, 0x20, 0x01, 0x28, 0x09,
	0x52, 0x08, 0x70, 0x72, 0x69, 0x6f, 0x72, 0x69, 0x74, 0x79, 0x12, 0x1e, 0x0a, 0x0a, 0x72, 0x65,
	0x73, 0x70, 0x6f, 0x6e, 0x64, 0x65, 0x72, 0x73, 0x18, 0x12, 0x20, 0x03, 0x28, 0x09, 0x52, 0x0a,
	0x72, 0x65, 0x73, 0x70, 0x6f, 0x6e, 0x64, 0x65, 0x72, 0x73, 0x12, 0x20, 0x0a, 0x0b, 0x64, 0x65,
	0x73, 0x63, 0x72, 0x69, 0x70, 0x74, 0x69, 0x6f, 0x6e, 0x18, 0x13, 0x20, 0x01, 0x28, 0x09, 0x52,
	0x0b, 0x64, 0x65, 0x73, 0x63, 0x72, 0x69, 0x70, 0x74, 0x69, 0x6f, 0x6e, 0x12, 0x3e, 0x0a, 0x07,
	0x64, 0x65, 0x74, 0x61, 0x69, 0x6c, 0x73, 0x18, 0x14, 0x20, 0x03, 0x28, 0x0b, 0x32, 0x24, 0x2e,
	0x70, 0x6c, 0x75, 0x67, 0x69, 0x6e, 0x73, 0x2e, 0x6f, 0x70, 0x73, 0x67, 0x65, 0x6e, 0x69, 0x65,
	0x2e, 0x41, 0x6c, 0x65, 0x72, 0x74, 0x2e, 0x44, 0x65, 0x74, 0x61, 0x69, 0x6c, 0x73, 0x45, 0x6e,
	0x74, 0x72, 0x79, 0x52, 0x07, 0x64, 0x65, 0x74, 0x61, 0x69, 0x6c, 0x73, 0x1a, 0x3a, 0x0a, 0x0c,
	0x44, 0x65, 0x74, 0x61, 0x69, 0x6c, 0x73, 0x45, 0x6e, 0x74, 0x72, 0x79, 0x12, 0x10, 0x0a, 0x03,
	0x6b, 0x65, 0x79, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x03, 0x6b, 0x65, 0x79, 0x12, 0x14,
	0x0a, 0x05, 0x76, 0x61, 0x6c, 0x75, 0x65, 0x18, 0x02, 0x20, 0x01, 0x28, 0x09, 0x52, 0x05, 0x76,
	0x61, 0x6c, 0x75, 0x65, 0x3a, 0x02, 0x38, 0x01, 0x22, 0x39, 0x0a, 0x04, 0x53, 0x70, 0x65, 0x63,
	0x12, 0x31, 0x0a, 0x07, 0x71, 0x75, 0x65, 0x72, 0x69, 0x65, 0x73, 0x18, 0x02, 0x20, 0x03, 0x28,
	0x0b, 0x32, 0x17, 0x2e, 0x70, 0x6c, 0x75, 0x67, 0x69, 0x6e, 0x73, 0x2e, 0x6f, 0x70, 0x73, 0x67,
	0x65, 0x6e, 0x69, 0x65, 0x2e, 0x51, 0x75, 0x65, 0x72, 0x79, 0x52, 0x07, 0x71, 0x75, 0x65, 0x72,
	0x69, 0x65, 0x73, 0x22, 0x31, 0x0a, 0x05, 0x51, 0x75, 0x65, 0x72, 0x79, 0x12, 0x12, 0x0a, 0x04,
	0x6e, 0x61, 0x6d, 0x65, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x04, 0x6e, 0x61, 0x6d, 0x65,
	0x12, 0x14, 0x0a, 0x05, 0x71, 0x75, 0x65, 0x72, 0x79, 0x18, 0x02, 0x20, 0x01, 0x28, 0x09, 0x52,
	0x05, 0x71, 0x75, 0x65, 0x72, 0x79, 0x32, 0xb7, 0x01, 0x0a, 0x08, 0x4f, 0x70, 0x73, 0x67, 0x65,
	0x6e, 0x69, 0x65, 0x12, 0x56, 0x0a, 0x09, 0x47, 0x65, 0x74, 0x41, 0x6c, 0x65, 0x72, 0x74, 0x73,
	0x12, 0x22, 0x2e, 0x70, 0x6c, 0x75, 0x67, 0x69, 0x6e, 0x73, 0x2e, 0x6f, 0x70, 0x73, 0x67, 0x65,
	0x6e, 0x69, 0x65, 0x2e, 0x47, 0x65, 0x74, 0x41, 0x6c, 0x65, 0x72, 0x74, 0x73, 0x52, 0x65, 0x71,
	0x75, 0x65, 0x73, 0x74, 0x1a, 0x23, 0x2e, 0x70, 0x6c, 0x75, 0x67, 0x69, 0x6e, 0x73, 0x2e, 0x6f,
	0x70, 0x73, 0x67, 0x65, 0x6e, 0x69, 0x65, 0x2e, 0x47, 0x65, 0x74, 0x41, 0x6c, 0x65, 0x72, 0x74,
	0x73, 0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73, 0x65, 0x22, 0x00, 0x12, 0x53, 0x0a, 0x08, 0x47,
	0x65, 0x74, 0x41, 0x6c, 0x65, 0x72, 0x74, 0x12, 0x21, 0x2e, 0x70, 0x6c, 0x75, 0x67, 0x69, 0x6e,
	0x73, 0x2e, 0x6f, 0x70, 0x73, 0x67, 0x65, 0x6e, 0x69, 0x65, 0x2e, 0x47, 0x65, 0x74, 0x41, 0x6c,
	0x65, 0x72, 0x74, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x1a, 0x22, 0x2e, 0x70, 0x6c, 0x75,
	0x67, 0x69, 0x6e, 0x73, 0x2e, 0x6f, 0x70, 0x73, 0x67, 0x65, 0x6e, 0x69, 0x65, 0x2e, 0x47, 0x65,
	0x74, 0x41, 0x6c, 0x65, 0x72, 0x74, 0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73, 0x65, 0x22, 0x00,
	0x42, 0x37, 0x5a, 0x35, 0x67, 0x69, 0x74, 0x68, 0x75, 0x62, 0x2e, 0x63, 0x6f, 0x6d, 0x2f, 0x6b,
	0x6f, 0x62, 0x73, 0x69, 0x6f, 0x2f, 0x6b, 0x6f, 0x62, 0x73, 0x2f, 0x70, 0x6b, 0x67, 0x2f, 0x61,
	0x70, 0x69, 0x2f, 0x70, 0x6c, 0x75, 0x67, 0x69, 0x6e, 0x73, 0x2f, 0x6f, 0x70, 0x73, 0x67, 0x65,
	0x6e, 0x69, 0x65, 0x2f, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x62, 0x06, 0x70, 0x72, 0x6f, 0x74, 0x6f,
	0x33,
}

var (
	file_opsgenie_proto_rawDescOnce sync.Once
	file_opsgenie_proto_rawDescData = file_opsgenie_proto_rawDesc
)

func file_opsgenie_proto_rawDescGZIP() []byte {
	file_opsgenie_proto_rawDescOnce.Do(func() {
		file_opsgenie_proto_rawDescData = protoimpl.X.CompressGZIP(file_opsgenie_proto_rawDescData)
	})
	return file_opsgenie_proto_rawDescData
}

var file_opsgenie_proto_msgTypes = make([]protoimpl.MessageInfo, 8)
var file_opsgenie_proto_goTypes = []interface{}{
	(*GetAlertsRequest)(nil),  // 0: plugins.opsgenie.GetAlertsRequest
	(*GetAlertsResponse)(nil), // 1: plugins.opsgenie.GetAlertsResponse
	(*GetAlertRequest)(nil),   // 2: plugins.opsgenie.GetAlertRequest
	(*GetAlertResponse)(nil),  // 3: plugins.opsgenie.GetAlertResponse
	(*Alert)(nil),             // 4: plugins.opsgenie.Alert
	(*Spec)(nil),              // 5: plugins.opsgenie.Spec
	(*Query)(nil),             // 6: plugins.opsgenie.Query
	nil,                       // 7: plugins.opsgenie.Alert.DetailsEntry
}
var file_opsgenie_proto_depIdxs = []int32{
	4, // 0: plugins.opsgenie.GetAlertsResponse.alerts:type_name -> plugins.opsgenie.Alert
	4, // 1: plugins.opsgenie.GetAlertResponse.alert:type_name -> plugins.opsgenie.Alert
	7, // 2: plugins.opsgenie.Alert.details:type_name -> plugins.opsgenie.Alert.DetailsEntry
	6, // 3: plugins.opsgenie.Spec.queries:type_name -> plugins.opsgenie.Query
	0, // 4: plugins.opsgenie.Opsgenie.GetAlerts:input_type -> plugins.opsgenie.GetAlertsRequest
	2, // 5: plugins.opsgenie.Opsgenie.GetAlert:input_type -> plugins.opsgenie.GetAlertRequest
	1, // 6: plugins.opsgenie.Opsgenie.GetAlerts:output_type -> plugins.opsgenie.GetAlertsResponse
	3, // 7: plugins.opsgenie.Opsgenie.GetAlert:output_type -> plugins.opsgenie.GetAlertResponse
	6, // [6:8] is the sub-list for method output_type
	4, // [4:6] is the sub-list for method input_type
	4, // [4:4] is the sub-list for extension type_name
	4, // [4:4] is the sub-list for extension extendee
	0, // [0:4] is the sub-list for field type_name
}

func init() { file_opsgenie_proto_init() }
func file_opsgenie_proto_init() {
	if File_opsgenie_proto != nil {
		return
	}
	if !protoimpl.UnsafeEnabled {
		file_opsgenie_proto_msgTypes[0].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*GetAlertsRequest); i {
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
		file_opsgenie_proto_msgTypes[1].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*GetAlertsResponse); i {
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
		file_opsgenie_proto_msgTypes[2].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*GetAlertRequest); i {
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
		file_opsgenie_proto_msgTypes[3].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*GetAlertResponse); i {
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
		file_opsgenie_proto_msgTypes[4].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*Alert); i {
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
		file_opsgenie_proto_msgTypes[5].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*Spec); i {
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
		file_opsgenie_proto_msgTypes[6].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*Query); i {
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
			RawDescriptor: file_opsgenie_proto_rawDesc,
			NumEnums:      0,
			NumMessages:   8,
			NumExtensions: 0,
			NumServices:   1,
		},
		GoTypes:           file_opsgenie_proto_goTypes,
		DependencyIndexes: file_opsgenie_proto_depIdxs,
		MessageInfos:      file_opsgenie_proto_msgTypes,
	}.Build()
	File_opsgenie_proto = out.File
	file_opsgenie_proto_rawDesc = nil
	file_opsgenie_proto_goTypes = nil
	file_opsgenie_proto_depIdxs = nil
}