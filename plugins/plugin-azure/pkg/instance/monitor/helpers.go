package monitor

import (
	"time"
)

// getMetricsOptions returns the options for a metrics request.
func getMetricsOptions(timeStart, timeEnd int64) (string, string, int32) {
	interval := getInterval(timeStart, timeEnd)
	top := int32(500)

	timeStartISO := time.Unix(timeStart, 0).UTC()
	timeEndISO := time.Unix(timeEnd, 0).UTC()
	timespan := timeStartISO.Format("2006-01-02T15:04:05") + "/" + timeEndISO.Format("2006-01-02T15:04:05")

	return interval, timespan, top
}

// getInterval returns the duration for the given start and end time.
func getInterval(start, end int64) string {
	switch seconds := end - start; {
	case seconds <= 21600:
		return "PT1M"
	case seconds <= 86400:
		return "PT5M"
	case seconds <= 259200:
		return "PT15M"
	case seconds <= 518400:
		return "PT30M"
	case seconds <= 1036800:
		return "PT1H"
	case seconds <= 2073600:
		return "PT6H"
	case seconds <= 4147200:
		return "PT12H"
	default:
		return "P1D"
	}
}
