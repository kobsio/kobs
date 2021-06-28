// +build !ignore_autogenerated

/*
Copyright The Kubernetes Authors.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

// Code generated by deepcopy-gen. DO NOT EDIT.

package v1beta1

import (
	dashboardv1beta1 "github.com/kobsio/kobs/pkg/api/apis/dashboard/v1beta1"
	runtime "k8s.io/apimachinery/pkg/runtime"
)

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *Application) DeepCopyInto(out *Application) {
	*out = *in
	out.TypeMeta = in.TypeMeta
	in.ObjectMeta.DeepCopyInto(&out.ObjectMeta)
	in.Spec.DeepCopyInto(&out.Spec)
	return
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new Application.
func (in *Application) DeepCopy() *Application {
	if in == nil {
		return nil
	}
	out := new(Application)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyObject is an autogenerated deepcopy function, copying the receiver, creating a new runtime.Object.
func (in *Application) DeepCopyObject() runtime.Object {
	if c := in.DeepCopy(); c != nil {
		return c
	}
	return nil
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *ApplicationList) DeepCopyInto(out *ApplicationList) {
	*out = *in
	out.TypeMeta = in.TypeMeta
	in.ListMeta.DeepCopyInto(&out.ListMeta)
	if in.Items != nil {
		in, out := &in.Items, &out.Items
		*out = make([]Application, len(*in))
		for i := range *in {
			(*in)[i].DeepCopyInto(&(*out)[i])
		}
	}
	return
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new ApplicationList.
func (in *ApplicationList) DeepCopy() *ApplicationList {
	if in == nil {
		return nil
	}
	out := new(ApplicationList)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyObject is an autogenerated deepcopy function, copying the receiver, creating a new runtime.Object.
func (in *ApplicationList) DeepCopyObject() runtime.Object {
	if c := in.DeepCopy(); c != nil {
		return c
	}
	return nil
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *ApplicationSpec) DeepCopyInto(out *ApplicationSpec) {
	*out = *in
	if in.Links != nil {
		in, out := &in.Links, &out.Links
		*out = make([]Link, len(*in))
		copy(*out, *in)
	}
	if in.Teams != nil {
		in, out := &in.Teams, &out.Teams
		*out = make([]Reference, len(*in))
		copy(*out, *in)
	}
	if in.Dependencies != nil {
		in, out := &in.Dependencies, &out.Dependencies
		*out = make([]Reference, len(*in))
		copy(*out, *in)
	}
	if in.Dashboards != nil {
		in, out := &in.Dashboards, &out.Dashboards
		*out = make([]dashboardv1beta1.Reference, len(*in))
		for i := range *in {
			(*in)[i].DeepCopyInto(&(*out)[i])
		}
	}
	return
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new ApplicationSpec.
func (in *ApplicationSpec) DeepCopy() *ApplicationSpec {
	if in == nil {
		return nil
	}
	out := new(ApplicationSpec)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *Link) DeepCopyInto(out *Link) {
	*out = *in
	return
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new Link.
func (in *Link) DeepCopy() *Link {
	if in == nil {
		return nil
	}
	out := new(Link)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *Reference) DeepCopyInto(out *Reference) {
	*out = *in
	return
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new Reference.
func (in *Reference) DeepCopy() *Reference {
	if in == nil {
		return nil
	}
	out := new(Reference)
	in.DeepCopyInto(out)
	return out
}
