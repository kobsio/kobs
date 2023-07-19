package instance

// appendIfMissing appends a runbook to the list of runbooks when it is not already in the list.
func appendIfMissing(items []Runbook, item Runbook) []Runbook {
	for _, ele := range items {
		if ele.ID == item.ID {
			return items
		}
	}

	return append(items, item)
}
