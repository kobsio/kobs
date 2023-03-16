package instance

// ResponseError is the structure of failed Grafana API call.
type ResponseError struct {
	Message string `json:"message"`
}

// Dashboard is the structure of a single Grafana dashboard. It contains the dashboard data and metadata. If this is
// used via the search API it also contains a type field, because the API also returns folders.
type Dashboard struct {
	DashboardData
	DashboardMetadata
	Type string `json:"type,omitempty"`
}

// SingleDashboardResponse is the structure of the data returned by the Grafana API to get a dashboard by its uid.
type SingleDashboardResponse struct {
	Dashboard DashboardData     `json:"dashboard"`
	Metadata  DashboardMetadata `json:"meta"`
}

// DashboardData is the structure for the dashbord data returned by the Grafana API.
type DashboardData struct {
	ID    int      `json:"id"`
	UID   string   `json:"uid"`
	Title string   `json:"title"`
	Tags  []string `json:"tags"`
}

// DashboardMetadata contains the metadata of a dashboard returned by the Grafana API.
type DashboardMetadata struct {
	URL         string `json:"url"`
	FolderID    int    `json:"folderId"`
	FolderUID   string `json:"folderUid"`
	FolderTitle string `json:"folderTitle,omitempty"`
	FolderURL   string `json:"folderUrl,omitempty"`
}
