// Code generated by protoc-gen-go-grpc. DO NOT EDIT.

package proto

import (
	context "context"
	grpc "google.golang.org/grpc"
	codes "google.golang.org/grpc/codes"
	status "google.golang.org/grpc/status"
)

// This is a compile-time assertion to ensure that this generated file
// is compatible with the grpc package it is being compiled against.
// Requires gRPC-Go v1.32.0 or later.
const _ = grpc.SupportPackageIsVersion7

// DatasourcesClient is the client API for Datasources service.
//
// For semantics around ctx use and closing/ending streaming RPCs, please refer to https://pkg.go.dev/google.golang.org/grpc/?tab=doc#ClientConn.NewStream.
type DatasourcesClient interface {
	GetDatasources(ctx context.Context, in *GetDatasourcesRequest, opts ...grpc.CallOption) (*GetDatasourcesResponse, error)
	GetDatasource(ctx context.Context, in *GetDatasourceRequest, opts ...grpc.CallOption) (*GetDatasourceResponse, error)
	GetVariables(ctx context.Context, in *GetVariablesRequest, opts ...grpc.CallOption) (*GetVariablesResponse, error)
	GetMetrics(ctx context.Context, in *GetMetricsRequest, opts ...grpc.CallOption) (*GetMetricsResponse, error)
	GetLogs(ctx context.Context, in *GetLogsRequest, opts ...grpc.CallOption) (*GetLogsResponse, error)
	GetTraces(ctx context.Context, in *GetTracesRequest, opts ...grpc.CallOption) (*GetTracesResponse, error)
}

type datasourcesClient struct {
	cc grpc.ClientConnInterface
}

func NewDatasourcesClient(cc grpc.ClientConnInterface) DatasourcesClient {
	return &datasourcesClient{cc}
}

func (c *datasourcesClient) GetDatasources(ctx context.Context, in *GetDatasourcesRequest, opts ...grpc.CallOption) (*GetDatasourcesResponse, error) {
	out := new(GetDatasourcesResponse)
	err := c.cc.Invoke(ctx, "/datasources.Datasources/GetDatasources", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *datasourcesClient) GetDatasource(ctx context.Context, in *GetDatasourceRequest, opts ...grpc.CallOption) (*GetDatasourceResponse, error) {
	out := new(GetDatasourceResponse)
	err := c.cc.Invoke(ctx, "/datasources.Datasources/GetDatasource", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *datasourcesClient) GetVariables(ctx context.Context, in *GetVariablesRequest, opts ...grpc.CallOption) (*GetVariablesResponse, error) {
	out := new(GetVariablesResponse)
	err := c.cc.Invoke(ctx, "/datasources.Datasources/GetVariables", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *datasourcesClient) GetMetrics(ctx context.Context, in *GetMetricsRequest, opts ...grpc.CallOption) (*GetMetricsResponse, error) {
	out := new(GetMetricsResponse)
	err := c.cc.Invoke(ctx, "/datasources.Datasources/GetMetrics", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *datasourcesClient) GetLogs(ctx context.Context, in *GetLogsRequest, opts ...grpc.CallOption) (*GetLogsResponse, error) {
	out := new(GetLogsResponse)
	err := c.cc.Invoke(ctx, "/datasources.Datasources/GetLogs", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *datasourcesClient) GetTraces(ctx context.Context, in *GetTracesRequest, opts ...grpc.CallOption) (*GetTracesResponse, error) {
	out := new(GetTracesResponse)
	err := c.cc.Invoke(ctx, "/datasources.Datasources/GetTraces", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

// DatasourcesServer is the server API for Datasources service.
// All implementations must embed UnimplementedDatasourcesServer
// for forward compatibility
type DatasourcesServer interface {
	GetDatasources(context.Context, *GetDatasourcesRequest) (*GetDatasourcesResponse, error)
	GetDatasource(context.Context, *GetDatasourceRequest) (*GetDatasourceResponse, error)
	GetVariables(context.Context, *GetVariablesRequest) (*GetVariablesResponse, error)
	GetMetrics(context.Context, *GetMetricsRequest) (*GetMetricsResponse, error)
	GetLogs(context.Context, *GetLogsRequest) (*GetLogsResponse, error)
	GetTraces(context.Context, *GetTracesRequest) (*GetTracesResponse, error)
	mustEmbedUnimplementedDatasourcesServer()
}

// UnimplementedDatasourcesServer must be embedded to have forward compatible implementations.
type UnimplementedDatasourcesServer struct {
}

func (UnimplementedDatasourcesServer) GetDatasources(context.Context, *GetDatasourcesRequest) (*GetDatasourcesResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "method GetDatasources not implemented")
}
func (UnimplementedDatasourcesServer) GetDatasource(context.Context, *GetDatasourceRequest) (*GetDatasourceResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "method GetDatasource not implemented")
}
func (UnimplementedDatasourcesServer) GetVariables(context.Context, *GetVariablesRequest) (*GetVariablesResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "method GetVariables not implemented")
}
func (UnimplementedDatasourcesServer) GetMetrics(context.Context, *GetMetricsRequest) (*GetMetricsResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "method GetMetrics not implemented")
}
func (UnimplementedDatasourcesServer) GetLogs(context.Context, *GetLogsRequest) (*GetLogsResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "method GetLogs not implemented")
}
func (UnimplementedDatasourcesServer) GetTraces(context.Context, *GetTracesRequest) (*GetTracesResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "method GetTraces not implemented")
}
func (UnimplementedDatasourcesServer) mustEmbedUnimplementedDatasourcesServer() {}

// UnsafeDatasourcesServer may be embedded to opt out of forward compatibility for this service.
// Use of this interface is not recommended, as added methods to DatasourcesServer will
// result in compilation errors.
type UnsafeDatasourcesServer interface {
	mustEmbedUnimplementedDatasourcesServer()
}

func RegisterDatasourcesServer(s grpc.ServiceRegistrar, srv DatasourcesServer) {
	s.RegisterService(&Datasources_ServiceDesc, srv)
}

func _Datasources_GetDatasources_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(GetDatasourcesRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(DatasourcesServer).GetDatasources(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/datasources.Datasources/GetDatasources",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(DatasourcesServer).GetDatasources(ctx, req.(*GetDatasourcesRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _Datasources_GetDatasource_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(GetDatasourceRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(DatasourcesServer).GetDatasource(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/datasources.Datasources/GetDatasource",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(DatasourcesServer).GetDatasource(ctx, req.(*GetDatasourceRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _Datasources_GetVariables_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(GetVariablesRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(DatasourcesServer).GetVariables(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/datasources.Datasources/GetVariables",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(DatasourcesServer).GetVariables(ctx, req.(*GetVariablesRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _Datasources_GetMetrics_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(GetMetricsRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(DatasourcesServer).GetMetrics(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/datasources.Datasources/GetMetrics",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(DatasourcesServer).GetMetrics(ctx, req.(*GetMetricsRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _Datasources_GetLogs_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(GetLogsRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(DatasourcesServer).GetLogs(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/datasources.Datasources/GetLogs",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(DatasourcesServer).GetLogs(ctx, req.(*GetLogsRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _Datasources_GetTraces_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(GetTracesRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(DatasourcesServer).GetTraces(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/datasources.Datasources/GetTraces",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(DatasourcesServer).GetTraces(ctx, req.(*GetTracesRequest))
	}
	return interceptor(ctx, in, info, handler)
}

// Datasources_ServiceDesc is the grpc.ServiceDesc for Datasources service.
// It's only intended for direct use with grpc.RegisterService,
// and not to be introspected or modified (even as a copy)
var Datasources_ServiceDesc = grpc.ServiceDesc{
	ServiceName: "datasources.Datasources",
	HandlerType: (*DatasourcesServer)(nil),
	Methods: []grpc.MethodDesc{
		{
			MethodName: "GetDatasources",
			Handler:    _Datasources_GetDatasources_Handler,
		},
		{
			MethodName: "GetDatasource",
			Handler:    _Datasources_GetDatasource_Handler,
		},
		{
			MethodName: "GetVariables",
			Handler:    _Datasources_GetVariables_Handler,
		},
		{
			MethodName: "GetMetrics",
			Handler:    _Datasources_GetMetrics_Handler,
		},
		{
			MethodName: "GetLogs",
			Handler:    _Datasources_GetLogs_Handler,
		},
		{
			MethodName: "GetTraces",
			Handler:    _Datasources_GetTraces_Handler,
		},
	},
	Streams:  []grpc.StreamDesc{},
	Metadata: "datasources.proto",
}
