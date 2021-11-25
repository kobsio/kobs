package containerinstances

// getInterval returns the duration for the Prometheus resolution for a given start and end time.
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
