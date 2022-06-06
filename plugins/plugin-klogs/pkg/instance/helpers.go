package instance

// appendIfMissing appends a value to a slice, when this values doesn't exist in the slice already.
func appendIfMissing(items []string, item string) []string {
	for _, ele := range items {
		if ele == item {
			return items
		}
	}

	return append(items, item)
}

// contains checks if the given slice of string contains the given item. It returns true when the slice contains the
// given item.
func contains(items []string, item string) bool {
	for _, ele := range items {
		if ele == item {
			return true
		}
	}

	return false
}
