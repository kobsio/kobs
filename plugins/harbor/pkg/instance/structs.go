package instance

import "time"

// ResponseError is the structure for a failed Harbor API request.
type ResponseError struct {
	Errors []struct {
		Code    string `json:"code"`
		Message string `json:"message"`
	} `json:"errors"`
}

// ProjectsData contains all the projects returned by the Harbor API and the total number of projects for pagination.
// The total number of projects is returned via the "x-total-count" header from teh API.
type ProjectsData struct {
	Projects []Project `json:"projects"`
	Total    int64     `json:"total"`
}

// Project is the structure for a project returned by the Harbor API.
type Project struct {
	Name       string `json:"name"`
	Deleted    bool   `json:"deleted"`
	RepoCount  int64  `json:"repo_count"`
	ChartCount int64  `json:"chart_count"`
	ProjectID  int64  `json:"project_id"`
	RegistryID int64  `json:"registry_id"`
	Metadata   struct {
		EnableContentTrust   string `json:"enable_content_trust"`
		AutoScan             string `json:"auto_scan"`
		Severity             string `json:"severity"`
		Public               string `json:"public"`
		ReuseSysCveAllowlist string `json:"reuse_sys_cve_allowlist"`
		PreventVul           string `json:"prevent_vul"`
		RetentionID          string `json:"retention_id"`
	} `json:"metadata"`
}

// RepositoriesData contains all the repositories returned by the Harbor API and the total number of repositories for
// pagination.
type RepositoriesData struct {
	Repositories []Repository `json:"repositories"`
	Total        int64        `json:"total"`
}

// Repository is the structure of a single repository returned by the Harbor API.
type Repository struct {
	ArtifactCount int64     `json:"artifact_count"`
	ID            int64     `json:"id"`
	Name          string    `json:"name"`
	ProjectID     int64     `json:"project_id"`
	PullCount     int64     `json:"pull_count"`
	CreationTime  string    `json:"creation_time"`
	UpdateTime    time.Time `json:"update_time"`
}

// ArtifactsData contains all the artifacts returned by the Harbor API and the total number of artifacts for pagination.
type ArtifactsData struct {
	Artifacts []Artifact `json:"artifacts"`
	Total     int64      `json:"total"`
}

// Artifact is the structure of a single artifact returned by the Harbor API.
type Artifact struct {
	Digest     string `json:"digest"`
	ExtraAttrs struct {
		Architecture string `json:"architecture"`
		Author       string `json:"author"`
		Config       struct {
			Cmd          []string               `json:"Cmd"`
			Entrypoint   []string               `json:"Entrypoint"`
			Env          []string               `json:"Env"`
			ExposedPorts map[string]interface{} `json:"ExposedPorts"`
			Labels       map[string]string      `json:"Labels"`
			User         string                 `json:"User"`
			WorkingDir   string                 `json:"WorkingDir"`
		} `json:"config"`
		Created time.Time `json:"created"`
		Os      string    `json:"os"`
	} `json:"extra_attrs"`
	Icon              string                          `json:"icon"`
	ID                int64                           `json:"id"`
	ManifestMediaType string                          `json:"manifest_media_type"`
	MediaType         string                          `json:"media_type"`
	ProjectID         int64                           `json:"project_id"`
	PullTime          time.Time                       `json:"pull_time"`
	PushTime          time.Time                       `json:"push_time"`
	References        interface{}                     `json:"references"`
	RepositoryID      int64                           `json:"repository_id"`
	ScanOverview      map[string]ArtifactScanOverview `json:"scan_overview"`
	Size              int64                           `json:"size"`
	Tags              []ArtifactTag                   `json:"tags"`
	Type              string                          `json:"type"`
}

type ArtifactScanOverview struct {
	CompletePercent int64     `json:"complete_percent"`
	Duration        int64     `json:"duration"`
	EndTime         time.Time `json:"end_time"`
	ReportID        string    `json:"report_id"`
	ScanStatus      string    `json:"scan_status"`
	Severity        string    `json:"severity"`
	StartTime       time.Time `json:"start_time"`
}

type ArtifactTag struct {
	ArtifactID   int64     `json:"artifact_id"`
	ID           int64     `json:"id"`
	Immutable    bool      `json:"immutable"`
	Name         string    `json:"name"`
	PullTime     time.Time `json:"pull_time"`
	PushTime     time.Time `json:"push_time"`
	RepositoryID int64     `json:"repository_id"`
	Signed       bool      `json:"signed"`
}

type Vulnerability struct {
	GeneratedAt time.Time `json:"generated_at"`
	Scanner     struct {
		Name    string `json:"name"`
		Vendor  string `json:"vendor"`
		Version string `json:"version"`
	} `json:"scanner"`
	Severity        string `json:"severity"`
	Vulnerabilities []struct {
		ID              string   `json:"id"`
		Package         string   `json:"package"`
		Version         string   `json:"version"`
		FixVersion      string   `json:"fix_version"`
		Severity        string   `json:"severity"`
		Description     string   `json:"description"`
		Links           []string `json:"links"`
		ArtifactDigests []string `json:"artifact_digests"`
	} `json:"vulnerabilities"`
}

type BuildHistoryItem struct {
	Created    time.Time `json:"created"`
	CreatedBy  string    `json:"created_by"`
	EmptyLayer bool      `json:"empty_layer,omitempty"`
}
