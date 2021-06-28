package placeholders

import (
	"bytes"
	"encoding/json"
	"html/template"

	dashboard "github.com/kobsio/kobs/pkg/api/apis/dashboard/v1beta1"
)

// Replace replaces the placeholders in a dashboard, with the provided values from the placeholders map. The
// placeholders must use the following format in the dashboard to be replaced: "{% .placeholder %}".
// To replace the placeholders we have to convert the dashboard to it's json string representation, which is then passed
// to the template together with the placeholders. The result is then unmarshaled back to the dashboard struct and
// returned.
func Replace(placeholders map[string]string, dash dashboard.DashboardSpec) (*dashboard.DashboardSpec, error) {
	out, err := json.Marshal(dash)
	if err != nil {
		return nil, err
	}

	tpl, err := template.New("dashboard").Delims("{%", "%}").Parse(string(out))
	if err != nil {
		return nil, err
	}

	var buf bytes.Buffer
	err = tpl.Execute(&buf, placeholders)
	if err != nil {
		return nil, err
	}

	var dashPlaceholders dashboard.DashboardSpec
	err = json.Unmarshal([]byte(buf.String()), &dashPlaceholders)
	if err != nil {
		return nil, err
	}

	return &dashPlaceholders, nil
}
