package permissions

import (
	"testing"

	authContext "github.com/kobsio/kobs/pkg/hub/auth/context"
	userv1 "github.com/kobsio/kobs/pkg/kube/apis/user/v1"

	"github.com/stretchr/testify/require"
	apiextensionsv1 "k8s.io/apiextensions-apiserver/pkg/apis/apiextensions/v1"
)

func TestCheckPermissions(t *testing.T) {
	t.Run("permissions disabled", func(t *testing.T) {
		require.NoError(t, CheckPermissions(false, nil, "", "", ""))
	})

	t.Run("invalid permission format", func(t *testing.T) {
		user := &authContext.User{Permissions: userv1.Permissions{Plugins: []userv1.Plugin{{Name: "helm", Permissions: apiextensionsv1.JSON{Raw: []byte(`"clusters": "*"`)}}}}}
		require.Error(t, CheckPermissions(true, user, "", "", ""))
	})

	t.Run("access forbidden", func(t *testing.T) {
		user := &authContext.User{Permissions: userv1.Permissions{Plugins: []userv1.Plugin{{Name: "helm", Permissions: apiextensionsv1.JSON{Raw: []byte(`[{"clusters": ["*"], "namespaces": ["namespace2"], "names": ["*"]}]`)}}}}}
		require.Error(t, CheckPermissions(true, user, "cluster1", "namespace1", "name1"))
	})

	t.Run("access allowed", func(t *testing.T) {
		user := &authContext.User{Permissions: userv1.Permissions{Plugins: []userv1.Plugin{{Name: "helm", Permissions: apiextensionsv1.JSON{Raw: []byte(`[{"clusters": ["*"], "namespaces": ["*"], "names": ["*"]}]`)}}}}}
		require.NoError(t, CheckPermissions(true, user, "cluster1", "namespace1", "name1"))
	})
}

func TestHasAccess(t *testing.T) {
	require.Equal(t, true, hasAccess("cluster1", "namespace1", "name1", []Permissions{{Clusters: []string{"*"}, Namespaces: []string{"*"}, Names: []string{"*"}}}))
	require.Equal(t, true, hasAccess("cluster1", "namespace1", "name1", []Permissions{{Clusters: []string{"*"}, Namespaces: []string{"namespace1"}, Names: []string{"*"}}}))
	require.Equal(t, true, hasAccess("cluster1", "namespace1", "name1", []Permissions{{Clusters: []string{"cluster1"}, Namespaces: []string{"*"}, Names: []string{"*"}}}))
	require.Equal(t, true, hasAccess("cluster1", "namespace1", "name1", []Permissions{{Clusters: []string{"*"}, Namespaces: []string{"*"}, Names: []string{"*"}}}))

	require.Equal(t, false, hasAccess("cluster2", "namespace1", "name1", []Permissions{{Clusters: []string{"cluster1"}, Namespaces: []string{"namespace1"}, Names: []string{"name1"}}}))
	require.Equal(t, false, hasAccess("cluster1", "namespace2", "name1", []Permissions{{Clusters: []string{"cluster1"}, Namespaces: []string{"namespace1"}, Names: []string{"name1"}}}))
	require.Equal(t, false, hasAccess("cluster1", "namespace1", "name2", []Permissions{{Clusters: []string{"cluster1"}, Namespaces: []string{"namespace1"}, Names: []string{"name1"}}}))
}
