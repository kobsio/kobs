package utils

// AppendIf appends a value to a slice, when the predicate returns true
func AppendIf[T any](items []T, item T, predecate func(iter, newItem T) bool) []T {
	for _, ele := range items {
		if !predecate(ele, item) {
			return items
		}
	}

	return append(items, item)
}

// AppendIfStringIsMissing appends item to items, when it's not already in there
func AppendIfStringIsMissing(items []string, item string) []string {
	return AppendIf(items, item, func(a, b string) bool { return a != b })
}
