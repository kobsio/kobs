// Code generated by mockery v2.12.3. DO NOT EDIT.

package instance

import (
	context "context"
	http "net/http"

	github "github.com/google/go-github/github"

	mock "github.com/stretchr/testify/mock"

	oauth2 "golang.org/x/oauth2"
)

// MockInstance is an autogenerated mock type for the Instance type
type MockInstance struct {
	mock.Mock
}

// GetName provides a mock function with given fields:
func (_m *MockInstance) GetName() string {
	ret := _m.Called()

	var r0 string
	if rf, ok := ret.Get(0).(func() string); ok {
		r0 = rf()
	} else {
		r0 = ret.Get(0).(string)
	}

	return r0
}

// GetOrganization provides a mock function with given fields:
func (_m *MockInstance) GetOrganization() string {
	ret := _m.Called()

	var r0 string
	if rf, ok := ret.Get(0).(func() string); ok {
		r0 = rf()
	} else {
		r0 = ret.Get(0).(string)
	}

	return r0
}

// OAuthCallback provides a mock function with given fields: ctx, state, code
func (_m *MockInstance) OAuthCallback(ctx context.Context, state string, code string) (*oauth2.Token, *github.User, error) {
	ret := _m.Called(ctx, state, code)

	var r0 *oauth2.Token
	if rf, ok := ret.Get(0).(func(context.Context, string, string) *oauth2.Token); ok {
		r0 = rf(ctx, state, code)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*oauth2.Token)
		}
	}

	var r1 *github.User
	if rf, ok := ret.Get(1).(func(context.Context, string, string) *github.User); ok {
		r1 = rf(ctx, state, code)
	} else {
		if ret.Get(1) != nil {
			r1 = ret.Get(1).(*github.User)
		}
	}

	var r2 error
	if rf, ok := ret.Get(2).(func(context.Context, string, string) error); ok {
		r2 = rf(ctx, state, code)
	} else {
		r2 = ret.Error(2)
	}

	return r0, r1, r2
}

// OAuthIsAuthenticated provides a mock function with given fields: ctx, token
func (_m *MockInstance) OAuthIsAuthenticated(ctx context.Context, token *oauth2.Token) (*github.User, error) {
	ret := _m.Called(ctx, token)

	var r0 *github.User
	if rf, ok := ret.Get(0).(func(context.Context, *oauth2.Token) *github.User); ok {
		r0 = rf(ctx, token)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*github.User)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, *oauth2.Token) error); ok {
		r1 = rf(ctx, token)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// OAuthLoginURL provides a mock function with given fields:
func (_m *MockInstance) OAuthLoginURL() string {
	ret := _m.Called()

	var r0 string
	if rf, ok := ret.Get(0).(func() string); ok {
		r0 = rf()
	} else {
		r0 = ret.Get(0).(string)
	}

	return r0
}

// TokenFromCookie provides a mock function with given fields: r
func (_m *MockInstance) TokenFromCookie(r *http.Request) (*oauth2.Token, error) {
	ret := _m.Called(r)

	var r0 *oauth2.Token
	if rf, ok := ret.Get(0).(func(*http.Request) *oauth2.Token); ok {
		r0 = rf(r)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*oauth2.Token)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(*http.Request) error); ok {
		r1 = rf(r)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// TokenToCookie provides a mock function with given fields: token
func (_m *MockInstance) TokenToCookie(token *oauth2.Token) (*http.Cookie, error) {
	ret := _m.Called(token)

	var r0 *http.Cookie
	if rf, ok := ret.Get(0).(func(*oauth2.Token) *http.Cookie); ok {
		r0 = rf(token)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*http.Cookie)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(*oauth2.Token) error); ok {
		r1 = rf(token)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

type NewMockInstanceT interface {
	mock.TestingT
	Cleanup(func())
}

// NewMockInstance creates a new instance of MockInstance. It also registers a testing interface on the mock and a cleanup function to assert the mocks expectations.
func NewMockInstance(t NewMockInstanceT) *MockInstance {
	mock := &MockInstance{}
	mock.Mock.Test(t)

	t.Cleanup(func() { mock.AssertExpectations(t) })

	return mock
}
