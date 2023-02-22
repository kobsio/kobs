package utils

// Some returns true, when predecate evaluates true for at least one of item in items
func Some[T any](items []T, predecate func(x T) bool) bool {
	for _, ele := range items {
		if predecate(ele) {
			return true
		}
	}

	return false
}

// Contains returns true when item is in items
func Contains(items []string, item string) bool {
	return Some(items, func(a string) bool { return a == item })
}
