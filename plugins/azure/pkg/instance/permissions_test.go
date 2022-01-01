package instance

import (
	"testing"

	user "github.com/kobsio/kobs/pkg/api/apis/user/v1beta1"
	authContext "github.com/kobsio/kobs/pkg/api/middleware/auth/context"

	"github.com/stretchr/testify/require"
	v1 "k8s.io/apiextensions-apiserver/pkg/apis/apiextensions/v1"
)

func TestCheckPermissions(t *testing.T) {
	t.Run("permissions disabled", func(t *testing.T) {
		instance := instance{permissionsEnabled: false}
		require.NoError(t, instance.CheckPermissions("", nil, "", "", ""))
	})

	t.Run("invalid permission format", func(t *testing.T) {
		instance := instance{permissionsEnabled: true}
		user := &authContext.User{Permissions: user.Permissions{Plugins: []user.Plugin{{Name: "azure", Permissions: v1.JSON{Raw: []byte(`"resources": "*"`)}}}}}
		require.Error(t, instance.CheckPermissions("azure", user, "", "", ""))
	})

	t.Run("access forbidden", func(t *testing.T) {
		instance := instance{permissionsEnabled: true}
		user := &authContext.User{Permissions: user.Permissions{Plugins: []user.Plugin{{Name: "azure", Permissions: v1.JSON{Raw: []byte(`[{"resources": ["*"], "resourceGroups": ["helloworld"], "verbs": ["*"]}]`)}}}}}
		require.Error(t, instance.CheckPermissions("azure", user, "kubernetesservices", "foobar", "get"))
	})

	t.Run("invalid permission format", func(t *testing.T) {
		instance := instance{permissionsEnabled: true}
		user := &authContext.User{Permissions: user.Permissions{Plugins: []user.Plugin{{Name: "azure", Permissions: v1.JSON{Raw: []byte(`[{"resources": ["*"], "resourceGroups": ["*"], "verbs": ["*"]}]`)}}}}}
		require.NoError(t, instance.CheckPermissions("azure", user, "kubernetesservices", "foobar", "get"))
	})
}

func TestHasAccess(t *testing.T) {
	require.Equal(t, false, hasAccess("kubernetesservices", "foobar", "get", []Permissions{{Resources: []string{"*"}, ResourceGroups: []string{"*"}, Verbs: []string{"patch"}}}))
	require.Equal(t, false, hasAccess("kubernetesservices", "foobar", "get", []Permissions{{Resources: []string{"*"}, ResourceGroups: []string{"helloworld"}, Verbs: []string{"*"}}}))
	require.Equal(t, false, hasAccess("kubernetesservices", "foobar", "get", []Permissions{{Resources: []string{"containerinstances"}, ResourceGroups: []string{"*"}, Verbs: []string{"*"}}}))
	require.Equal(t, true, hasAccess("kubernetesservices", "foobar", "get", []Permissions{{Resources: []string{"*"}, ResourceGroups: []string{"*"}, Verbs: []string{"*"}}}))
}
