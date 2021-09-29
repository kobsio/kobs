package instance

import (
	"sync"
)

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

// parallelize runs the given functions in parallel.
func parallelize(functions ...func()) {
	var waitGroup sync.WaitGroup
	waitGroup.Add(len(functions))

	defer waitGroup.Wait()

	for _, function := range functions {
		go func(copy func()) {
			defer waitGroup.Done()
			copy()
		}(function)
	}
}
