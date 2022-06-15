package users

import (
	"testing"

	dashboardv1 "github.com/kobsio/kobs/pkg/kube/apis/dashboard/v1"

	"github.com/stretchr/testify/require"
)

func TestMount(t *testing.T) {
	router := Mount(Config{DefaultDashboards: []dashboardv1.Reference{}}, nil)
	require.NotNil(t, router)
}
