package instance

// PrometheusRuleList is the type of the alerting rules for the Prometheus Operator / Victoria Metrics Operator and all
// other compatible custom resources, which are used to represent an alert and should contain the runbook for the
// runbooks plugin.
type PrometheusRuleList struct {
	Items []PrometheusRule `json:"items"`
}

type PrometheusRule struct {
	Metadata struct {
		Annotations map[string]string `json:"annotations,omitempty"`
	} `json:"metadata"`
	Spec PrometheusRuleSpec `json:"spec"`
}

type PrometheusRuleSpec struct {
	Groups []RuleGroup `json:"groups,omitempty"`
}

type RuleGroup struct {
	Name  string `json:"name"`
	Rules []Rule `json:"rules,omitempty"`
}

type Rule struct {
	Alert       string            `json:"alert,omitempty"`
	Expr        string            `json:"expr"`
	For         string            `json:"for,omitempty"`
	Labels      map[string]string `json:"labels,omitempty"`
	Annotations map[string]string `json:"annotations,omitempty"`
}

type Runbook struct {
	ID        string `json:"id" bson:"_id"`
	Alert     string `json:"alert" bson:"alert"`
	Group     string `json:"group" bson:"group"`
	Expr      string `json:"expr" bson:"expr"`
	Message   string `json:"message" bson:"message"`
	Severity  string `json:"severity" bson:"severity"`
	Common    string `json:"common" bson:"common"`
	Runbook   string `json:"runbook" bson:"runbook"`
	UpdatedAt int64  `json:"updatedAt" bson:"updatedAt"`
}
