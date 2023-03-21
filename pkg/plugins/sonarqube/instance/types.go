package instance

// ResponseError is the structure for a failed SonarQube API request.
type ResponseError struct {
	Errors []struct {
		Msg string `json:"msg"`
	} `json:"errors"`
}

type ResponseProjects struct {
	Paging     Paging    `json:"paging"`
	Components []Project `json:"components"`
}

type Paging struct {
	PageIndex int64 `json:"pageIndex"`
	PageSize  int64 `json:"pageSize"`
	Total     int64 `json:"total"`
}

type Project struct {
	Organization string `json:"organization"`
	Key          string `json:"key"`
	Qualifier    string `json:"qualifier"`
	Name         string `json:"name"`
	Project      string `json:"project"`
}

type ResponseProjectMeasures struct {
	Component ProjectMeasures `json:"component"`
	Metrics   []Metric        `json:"metrics"`
}

type ProjectMeasures struct {
	Key         string `json:"key"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Qualifier   string `json:"qualifier"`
	Measures    []struct {
		Metric    string `json:"metric"`
		Value     string `json:"value"`
		BestValue bool   `json:"bestValue,omitempty"`
	} `json:"measures"`
}

type Metric struct {
	Key                   string `json:"key"`
	Name                  string `json:"name"`
	Description           string `json:"description"`
	Domain                string `json:"domain"`
	Type                  string `json:"type"`
	HigherValuesAreBetter bool   `json:"higherValuesAreBetter"`
	Qualitative           bool   `json:"qualitative"`
	Hidden                bool   `json:"hidden"`
	DecimalScale          int    `json:"decimalScale,omitempty"`
	BestValue             string `json:"bestValue,omitempty"`
	WorstValue            string `json:"worstValue,omitempty"`
}
