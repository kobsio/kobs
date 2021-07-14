package instance

import (
	"time"
)

// formateTime is used to format the shown time for a bucket. This is required because the bar chart component in the
// frontend can not handle time series very well, so that we have to use strings instead of times.
func formateTime(timestamp, timeDiff int64) string {
	timeDiff = timeDiff / 1000

	if timeDiff < 3600 {
		return time.Unix(timestamp/1000, 0).Format("15:04:05")
	} else if timeDiff < 86400 {
		return time.Unix(timestamp/1000, 0).Format("15:04")
	} else if timeDiff < 604800 {
		return time.Unix(timestamp/1000, 0).Format("01-02 15:04")
	}

	return time.Unix(timestamp/1000, 0).Format("01-02")
}
