package instance

// Response is the structure of successful Elasticsearch API call.
type Response struct {
	ScrollID string `json:"_scroll_id"`
	Took     int64  `json:"took"`
	TimedOut bool   `json:"timed_out"`
	Shards   struct {
		Total      int64 `json:"total"`
		Successful int64 `json:"successful"`
		Skipped    int64 `json:"skipped"`
		Failed     int64 `json:"failed"`
	} `json:"_shards"`
	Hits struct {
		Total struct {
			Value    int64  `json:"value"`
			Relation string `json:"relation"`
		} `json:"total"`
		Hits []map[string]interface{} `json:"hits"`
	} `json:"hits"`
	Aggregations struct {
		LogCount struct {
			Buckets []Bucket `json:"buckets"`
		} `json:"logcount"`
	} `json:"aggregations"`
}

// Bucket is the structure of a bucket returned by the Elasticsearch API.
type Bucket struct {
	KeyAsString string `json:"key_as_string"`
	Key         int64  `json:"key"`
	DocCount    int64  `json:"doc_count"`
}

// ResponseError is the structure of failed Elasticsearch API call.
type ResponseError struct {
	Error struct {
		RootCause []struct {
			Type   string `json:"type"`
			Reason string `json:"reason"`
		} `json:"root_cause"`
		Type     string `json:"type"`
		Reason   string `json:"reason"`
		CausedBy struct {
			Type   string `json:"type"`
			Reason string `json:"reason"`
		} `json:"caused_by"`
	} `json:"error"`
	Status int `json:"status"`
}

// Data is the transformed Response result, which is passed to the React UI. It contains only the important fields, like
// the time a request took, the number of hits, the documents and the buckets.
type Data struct {
	Took      int64                    `json:"took"`
	Hits      int64                    `json:"hits"`
	Documents []map[string]interface{} `json:"documents"`
	Buckets   []Bucket                 `json:"buckets"`
}
