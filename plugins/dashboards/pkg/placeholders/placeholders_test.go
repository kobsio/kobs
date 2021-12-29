package placeholders

import (
	"testing"

	dashboard "github.com/kobsio/kobs/pkg/api/apis/dashboard/v1beta1"

	"github.com/stretchr/testify/require"
)

func TestReplace(t *testing.T) {
	dash := dashboard.DashboardSpec{
		Cluster: "{{ .cluster }}",
	}

	actualDashboard, err := Replace(map[string]string{"cluster": "test"}, dash)

	require.NoError(t, err)
	require.Equal(t, "test", actualDashboard.Cluster)
}
