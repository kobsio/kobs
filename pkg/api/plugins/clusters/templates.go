package clusters

import (
	"context"

	"github.com/kobsio/kobs/pkg/api/plugins/clusters/cluster"
	templateProto "github.com/kobsio/kobs/pkg/api/plugins/template/proto"

	"github.com/sirupsen/logrus"
)

func getTemplates(ctx context.Context, cs []*cluster.Cluster) []*templateProto.Template {
	log.Tracef("Fetch templates")

	var templates []*templateProto.Template

	for _, c := range cs {
		clusterTemplates, err := c.GetTemplates(ctx)
		if err != nil {
			log.WithError(err).WithFields(logrus.Fields{"cluster": c.GetName()}).Errorf("Could not get templates")
			continue
		}

		for _, template := range clusterTemplates {
			templates = appendTemplateIfMissing(templates, template)
		}
	}

	log.WithFields(logrus.Fields{"templates": len(templates)}).Tracef("Fetched templates")
	return templates
}

// appendTemplateIfMissing appends a template to the list of templates, when is the name isn't already present in the
// list.
func appendTemplateIfMissing(templates []*templateProto.Template, template *templateProto.Template) []*templateProto.Template {
	for _, ele := range templates {
		if ele.Name == template.Name {
			return templates
		}
	}

	return append(templates, template)
}
