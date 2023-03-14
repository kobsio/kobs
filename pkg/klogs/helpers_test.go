package klogs

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestGetInterval(t *testing.T) {
	for _, tt := range []struct {
		interval          int64
		bucketTime        int64
		timeStart         int64
		timeEnd           int64
		expectedTimeStart int64
		expectedTimeEnd   int64
	}{
		{interval: 124, bucketTime: 1640188920, timeStart: 1640189016, timeEnd: 1640192745, expectedTimeStart: 1640189016, expectedTimeEnd: 1640189044},
		{interval: 124, bucketTime: 1640190780, timeStart: 1640189016, timeEnd: 1640192745, expectedTimeStart: 1640190780, expectedTimeEnd: 1640190904},
		{interval: 124, bucketTime: 1640192640, timeStart: 1640189016, timeEnd: 1640192745, expectedTimeStart: 1640192640, expectedTimeEnd: 1640192745},
	} {
		t.Run(fmt.Sprintf("%d", tt.bucketTime), func(t *testing.T) {
			actualTimeStart, actualTimeEnd := getBucketTimes(tt.interval, tt.bucketTime, tt.timeStart, tt.timeEnd)
			require.Equal(t, tt.expectedTimeStart, actualTimeStart)
			require.Equal(t, tt.expectedTimeEnd, actualTimeEnd)
		})
	}
}

func TestAppendIfMissing(t *testing.T) {
	items := []string{"foo", "bar"}

	items = appendIfMissing(items, "foo")
	require.Equal(t, []string{"foo", "bar"}, items)

	items = appendIfMissing(items, "hello")
	items = appendIfMissing(items, "world")
	require.Equal(t, []string{"foo", "bar", "hello", "world"}, items)
}

func TestContains(t *testing.T) {
	items := []string{"foo", "bar"}

	require.Equal(t, true, contains(items, "foo"))
	require.Equal(t, false, contains(items, "hello world"))
}
