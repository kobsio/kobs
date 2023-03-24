package incident

import (
	"time"
)

// Response is the structure of the Opsgenie API response.
type Response struct {
	Data struct {
		Entries    []Entry `json:"entries"`
		NextOffset string  `json:"nextOffset"`
	} `json:"data"`
	Took      float64 `json:"took"`
	RequestID string  `json:"requestId"`
}

// Entry is the structure for a single incident timeline entry.
type Entry struct {
	ID          string      `json:"id"`
	Group       string      `json:"group"`
	Type        string      `json:"type"`
	EventTime   time.Time   `json:"eventTime"`
	Hidden      bool        `json:"hidden"`
	Actor       Actor       `json:"actor"`
	Description Description `json:"description"`
	LastEdit    LastEdit    `json:"lastEdit"`
}

type Actor struct {
	Name string `json:"name"`
	Type string `json:"type"`
}

type Description struct {
	Name string `json:"name"`
	Type string `json:"type"`
}

type LastEdit struct {
	EditTime time.Time `json:"editTime"`
	Actor    Actor     `json:"actor"`
}

// ResolveIncidentData is the data which can be sent to the Opsgenie api within the body of an resolve incident request.
type ResolveIncidentData struct {
	Note string `json:"note"`
}
