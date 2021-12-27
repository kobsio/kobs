package instance

import (
	"testing"

	"github.com/kobsio/kobs/pkg/api/apis/user/v1beta1"
	authContext "github.com/kobsio/kobs/pkg/api/middleware/auth/context"
	v1 "k8s.io/apiextensions-apiserver/pkg/apis/apiextensions/v1"

	"github.com/stretchr/testify/require"
)

func TestCheckPermissions(t *testing.T) {
	for _, tt := range []struct {
		name          string
		instance      *instance
		user          *authContext.User
		expectedError bool
	}{
		{
			name:          "permissions are not enabled",
			instance:      &instance{permissionsEnabled: false},
			user:          &authContext.User{},
			expectedError: false,
		},
		{
			name:          "invalid permission format",
			instance:      &instance{permissionsEnabled: true},
			user:          &authContext.User{Permissions: v1beta1.Permissions{Plugins: []v1beta1.Plugin{{Name: "opsgenie"}}}},
			expectedError: true,
		},
		{
			name:          "access forbidden",
			instance:      &instance{permissionsEnabled: true},
			user:          &authContext.User{Permissions: v1beta1.Permissions{Plugins: []v1beta1.Plugin{{Name: "opsgenie", Permissions: v1.JSON{Raw: []byte(`["acknowledgeAlert", "snoozeAlert"]`)}}}}},
			expectedError: true,
		},
		{
			name:          "access allowed",
			instance:      &instance{permissionsEnabled: true},
			user:          &authContext.User{Permissions: v1beta1.Permissions{Plugins: []v1beta1.Plugin{{Name: "opsgenie", Permissions: v1.JSON{Raw: []byte(`["closeAlert"]`)}}}}},
			expectedError: false,
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			actualError := tt.instance.CheckPermissions("opsgenie", tt.user, "closeAlert")

			if tt.expectedError {
				require.Error(t, actualError)
			} else {
				require.NoError(t, actualError)
			}
		})
	}
}

func TestHasAccess(t *testing.T) {
	for _, tt := range []struct {
		name              string
		action            string
		permissions       Permissions
		expectedHasAccess bool
	}{
		{
			name:              "has access for closeAlert",
			action:            "closeAlert",
			permissions:       []string{"closeAlert"},
			expectedHasAccess: true,
		},
		{
			name:              "has access for closeAlert via wildcard",
			action:            "closeAlert",
			permissions:       []string{"*"},
			expectedHasAccess: true,
		},
		{
			name:              "has no access for closeAlert",
			action:            "closeAlert",
			permissions:       []string{"acknowledgeAlert", "snoozeAlert"},
			expectedHasAccess: false,
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			actualHasAccess := hasAccess(tt.action, tt.permissions)
			require.Equal(t, tt.expectedHasAccess, actualHasAccess)
		})
	}
}
