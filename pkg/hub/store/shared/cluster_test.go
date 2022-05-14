package shared

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestParseNamespaceID(t *testing.T) {
	for _, tt := range []struct {
		id                string
		expectedSatellite string
		expectedCluster   string
		expectedNamespace string
		expectedError     bool
	}{
		{
			id:                "/satellite/satellite1/cluster/cluster1/namespace/namespace1",
			expectedSatellite: "satellite1",
			expectedCluster:   "cluster1",
			expectedNamespace: "namespace1",
			expectedError:     false,
		},
		{
			id:                "/satellite/satellite1/cluster/cluster1",
			expectedSatellite: "satellite1",
			expectedCluster:   "cluster1",
			expectedNamespace: "",
			expectedError:     false,
		},
		{
			id:                "afakeid",
			expectedSatellite: "",
			expectedCluster:   "",
			expectedNamespace: "",
			expectedError:     true,
		},
	} {
		t.Run(tt.id, func(t *testing.T) {
			satellite, cluster, namespace, err := ParseNamespaceID(tt.id)

			if tt.expectedError {
				require.Error(t, err)
			} else {
				require.NoError(t, err)
			}

			require.Equal(t, tt.expectedSatellite, satellite)
			require.Equal(t, tt.expectedCluster, cluster)
			require.Equal(t, tt.expectedNamespace, namespace)
		})
	}
}
