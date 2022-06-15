package clusters

// appendIfMissing appends a value to a slice, when this values doesn't exist in the slice already.
func appendIfMissing(items []string, item string) []string {
	for _, ele := range items {
		if ele == item {
			return items
		}
	}

	return append(items, item)
}
