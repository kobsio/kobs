package instance

import "testing"

func TestAppendIfMissing(t *testing.T) {
	items := []Runbook{
		{ID: "1"},
		{ID: "2"},
		{ID: "3"},
	}

	item := Runbook{
		ID: "4",
	}

	items = appendIfMissing(items, item)
	if len(items) != 4 {
		t.Errorf("Expected length of items to be 4, got %d", len(items))
	}

	items = appendIfMissing(items, item)
	if len(items) != 4 {
		t.Errorf("Expected length of items to be 4, got %d", len(items))
	}
}
