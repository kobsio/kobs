// Code generated by protoc-gen-gogo. DO NOT EDIT.
// source: application.proto

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

// DeepCopyInto supports using Application within kubernetes types, where deepcopy-gen is used.
func (in *Application) DeepCopyInto(out *Application) {
	p := proto.Clone(in).(*Application)
	*out = *p
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new Application. Required by controller-gen.
func (in *Application) DeepCopy() *Application {
	if in == nil {
		return nil
	}
	out := new(Application)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyInterface is an autogenerated deepcopy function, copying the receiver, creating a new Application. Required by controller-gen.
func (in *Application) DeepCopyInterface() interface{} {
	return in.DeepCopy()
}

// DeepCopyInto supports using ApplicationLink within kubernetes types, where deepcopy-gen is used.
func (in *ApplicationLink) DeepCopyInto(out *ApplicationLink) {
	p := proto.Clone(in).(*ApplicationLink)
	*out = *p
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new ApplicationLink. Required by controller-gen.
func (in *ApplicationLink) DeepCopy() *ApplicationLink {
	if in == nil {
		return nil
	}
	out := new(ApplicationLink)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyInterface is an autogenerated deepcopy function, copying the receiver, creating a new ApplicationLink. Required by controller-gen.
func (in *ApplicationLink) DeepCopyInterface() interface{} {
	return in.DeepCopy()
}

// DeepCopyInto supports using ApplicationResources within kubernetes types, where deepcopy-gen is used.
func (in *ApplicationResources) DeepCopyInto(out *ApplicationResources) {
	p := proto.Clone(in).(*ApplicationResources)
	*out = *p
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new ApplicationResources. Required by controller-gen.
func (in *ApplicationResources) DeepCopy() *ApplicationResources {
	if in == nil {
		return nil
	}
	out := new(ApplicationResources)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyInterface is an autogenerated deepcopy function, copying the receiver, creating a new ApplicationResources. Required by controller-gen.
func (in *ApplicationResources) DeepCopyInterface() interface{} {
	return in.DeepCopy()
}

// DeepCopyInto supports using ApplicationMetrics within kubernetes types, where deepcopy-gen is used.
func (in *ApplicationMetrics) DeepCopyInto(out *ApplicationMetrics) {
	p := proto.Clone(in).(*ApplicationMetrics)
	*out = *p
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new ApplicationMetrics. Required by controller-gen.
func (in *ApplicationMetrics) DeepCopy() *ApplicationMetrics {
	if in == nil {
		return nil
	}
	out := new(ApplicationMetrics)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyInterface is an autogenerated deepcopy function, copying the receiver, creating a new ApplicationMetrics. Required by controller-gen.
func (in *ApplicationMetrics) DeepCopyInterface() interface{} {
	return in.DeepCopy()
}

// DeepCopyInto supports using ApplicationMetricsVariable within kubernetes types, where deepcopy-gen is used.
func (in *ApplicationMetricsVariable) DeepCopyInto(out *ApplicationMetricsVariable) {
	p := proto.Clone(in).(*ApplicationMetricsVariable)
	*out = *p
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new ApplicationMetricsVariable. Required by controller-gen.
func (in *ApplicationMetricsVariable) DeepCopy() *ApplicationMetricsVariable {
	if in == nil {
		return nil
	}
	out := new(ApplicationMetricsVariable)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyInterface is an autogenerated deepcopy function, copying the receiver, creating a new ApplicationMetricsVariable. Required by controller-gen.
func (in *ApplicationMetricsVariable) DeepCopyInterface() interface{} {
	return in.DeepCopy()
}

// DeepCopyInto supports using ApplicationMetricsChart within kubernetes types, where deepcopy-gen is used.
func (in *ApplicationMetricsChart) DeepCopyInto(out *ApplicationMetricsChart) {
	p := proto.Clone(in).(*ApplicationMetricsChart)
	*out = *p
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new ApplicationMetricsChart. Required by controller-gen.
func (in *ApplicationMetricsChart) DeepCopy() *ApplicationMetricsChart {
	if in == nil {
		return nil
	}
	out := new(ApplicationMetricsChart)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyInterface is an autogenerated deepcopy function, copying the receiver, creating a new ApplicationMetricsChart. Required by controller-gen.
func (in *ApplicationMetricsChart) DeepCopyInterface() interface{} {
	return in.DeepCopy()
}

// DeepCopyInto supports using ApplicationMetricsQuery within kubernetes types, where deepcopy-gen is used.
func (in *ApplicationMetricsQuery) DeepCopyInto(out *ApplicationMetricsQuery) {
	p := proto.Clone(in).(*ApplicationMetricsQuery)
	*out = *p
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new ApplicationMetricsQuery. Required by controller-gen.
func (in *ApplicationMetricsQuery) DeepCopy() *ApplicationMetricsQuery {
	if in == nil {
		return nil
	}
	out := new(ApplicationMetricsQuery)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyInterface is an autogenerated deepcopy function, copying the receiver, creating a new ApplicationMetricsQuery. Required by controller-gen.
func (in *ApplicationMetricsQuery) DeepCopyInterface() interface{} {
	return in.DeepCopy()
}

// DeepCopyInto supports using ApplicationLogs within kubernetes types, where deepcopy-gen is used.
func (in *ApplicationLogs) DeepCopyInto(out *ApplicationLogs) {
	p := proto.Clone(in).(*ApplicationLogs)
	*out = *p
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new ApplicationLogs. Required by controller-gen.
func (in *ApplicationLogs) DeepCopy() *ApplicationLogs {
	if in == nil {
		return nil
	}
	out := new(ApplicationLogs)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyInterface is an autogenerated deepcopy function, copying the receiver, creating a new ApplicationLogs. Required by controller-gen.
func (in *ApplicationLogs) DeepCopyInterface() interface{} {
	return in.DeepCopy()
}

// DeepCopyInto supports using ApplicationLogsQuery within kubernetes types, where deepcopy-gen is used.
func (in *ApplicationLogsQuery) DeepCopyInto(out *ApplicationLogsQuery) {
	p := proto.Clone(in).(*ApplicationLogsQuery)
	*out = *p
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new ApplicationLogsQuery. Required by controller-gen.
func (in *ApplicationLogsQuery) DeepCopy() *ApplicationLogsQuery {
	if in == nil {
		return nil
	}
	out := new(ApplicationLogsQuery)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyInterface is an autogenerated deepcopy function, copying the receiver, creating a new ApplicationLogsQuery. Required by controller-gen.
func (in *ApplicationLogsQuery) DeepCopyInterface() interface{} {
	return in.DeepCopy()
}

// DeepCopyInto supports using ApplicationTraces within kubernetes types, where deepcopy-gen is used.
func (in *ApplicationTraces) DeepCopyInto(out *ApplicationTraces) {
	p := proto.Clone(in).(*ApplicationTraces)
	*out = *p
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new ApplicationTraces. Required by controller-gen.
func (in *ApplicationTraces) DeepCopy() *ApplicationTraces {
	if in == nil {
		return nil
	}
	out := new(ApplicationTraces)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyInterface is an autogenerated deepcopy function, copying the receiver, creating a new ApplicationTraces. Required by controller-gen.
func (in *ApplicationTraces) DeepCopyInterface() interface{} {
	return in.DeepCopy()
}
