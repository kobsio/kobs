// Code generated by protoc-gen-gogo. DO NOT EDIT.
// source: opsgenie.proto

package proto

import (
	fmt "fmt"
	proto "github.com/gogo/protobuf/proto"
	math "math"
)

// Reference imports to suppress errors if they are not otherwise used.
var _ = proto.Marshal
var _ = fmt.Errorf
var _ = math.Inf

// DeepCopyInto supports using GetAlertsRequest within kubernetes types, where deepcopy-gen is used.
func (in *GetAlertsRequest) DeepCopyInto(out *GetAlertsRequest) {
	p := proto.Clone(in).(*GetAlertsRequest)
	*out = *p
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new GetAlertsRequest. Required by controller-gen.
func (in *GetAlertsRequest) DeepCopy() *GetAlertsRequest {
	if in == nil {
		return nil
	}
	out := new(GetAlertsRequest)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyInterface is an autogenerated deepcopy function, copying the receiver, creating a new GetAlertsRequest. Required by controller-gen.
func (in *GetAlertsRequest) DeepCopyInterface() interface{} {
	return in.DeepCopy()
}

// DeepCopyInto supports using GetAlertsResponse within kubernetes types, where deepcopy-gen is used.
func (in *GetAlertsResponse) DeepCopyInto(out *GetAlertsResponse) {
	p := proto.Clone(in).(*GetAlertsResponse)
	*out = *p
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new GetAlertsResponse. Required by controller-gen.
func (in *GetAlertsResponse) DeepCopy() *GetAlertsResponse {
	if in == nil {
		return nil
	}
	out := new(GetAlertsResponse)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyInterface is an autogenerated deepcopy function, copying the receiver, creating a new GetAlertsResponse. Required by controller-gen.
func (in *GetAlertsResponse) DeepCopyInterface() interface{} {
	return in.DeepCopy()
}

// DeepCopyInto supports using GetAlertRequest within kubernetes types, where deepcopy-gen is used.
func (in *GetAlertRequest) DeepCopyInto(out *GetAlertRequest) {
	p := proto.Clone(in).(*GetAlertRequest)
	*out = *p
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new GetAlertRequest. Required by controller-gen.
func (in *GetAlertRequest) DeepCopy() *GetAlertRequest {
	if in == nil {
		return nil
	}
	out := new(GetAlertRequest)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyInterface is an autogenerated deepcopy function, copying the receiver, creating a new GetAlertRequest. Required by controller-gen.
func (in *GetAlertRequest) DeepCopyInterface() interface{} {
	return in.DeepCopy()
}

// DeepCopyInto supports using GetAlertResponse within kubernetes types, where deepcopy-gen is used.
func (in *GetAlertResponse) DeepCopyInto(out *GetAlertResponse) {
	p := proto.Clone(in).(*GetAlertResponse)
	*out = *p
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new GetAlertResponse. Required by controller-gen.
func (in *GetAlertResponse) DeepCopy() *GetAlertResponse {
	if in == nil {
		return nil
	}
	out := new(GetAlertResponse)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyInterface is an autogenerated deepcopy function, copying the receiver, creating a new GetAlertResponse. Required by controller-gen.
func (in *GetAlertResponse) DeepCopyInterface() interface{} {
	return in.DeepCopy()
}

// DeepCopyInto supports using Alert within kubernetes types, where deepcopy-gen is used.
func (in *Alert) DeepCopyInto(out *Alert) {
	p := proto.Clone(in).(*Alert)
	*out = *p
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new Alert. Required by controller-gen.
func (in *Alert) DeepCopy() *Alert {
	if in == nil {
		return nil
	}
	out := new(Alert)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyInterface is an autogenerated deepcopy function, copying the receiver, creating a new Alert. Required by controller-gen.
func (in *Alert) DeepCopyInterface() interface{} {
	return in.DeepCopy()
}

// DeepCopyInto supports using Spec within kubernetes types, where deepcopy-gen is used.
func (in *Spec) DeepCopyInto(out *Spec) {
	p := proto.Clone(in).(*Spec)
	*out = *p
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new Spec. Required by controller-gen.
func (in *Spec) DeepCopy() *Spec {
	if in == nil {
		return nil
	}
	out := new(Spec)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyInterface is an autogenerated deepcopy function, copying the receiver, creating a new Spec. Required by controller-gen.
func (in *Spec) DeepCopyInterface() interface{} {
	return in.DeepCopy()
}

// DeepCopyInto supports using Query within kubernetes types, where deepcopy-gen is used.
func (in *Query) DeepCopyInto(out *Query) {
	p := proto.Clone(in).(*Query)
	*out = *p
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new Query. Required by controller-gen.
func (in *Query) DeepCopy() *Query {
	if in == nil {
		return nil
	}
	out := new(Query)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyInterface is an autogenerated deepcopy function, copying the receiver, creating a new Query. Required by controller-gen.
func (in *Query) DeepCopyInterface() interface{} {
	return in.DeepCopy()
}
