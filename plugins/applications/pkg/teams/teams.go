package teams

import (
	"context"
	"time"

	application "github.com/kobsio/kobs/pkg/api/apis/application/v1beta1"
	"github.com/kobsio/kobs/pkg/api/clusters"
)

// Cache is the structure which can be used for caching a list of loaded teams.
type Cache struct {
	LastFetch     time.Time
	CacheDuration time.Duration
	Teams         []Team
}

// Team is the structure for a single team, like it is used by the applications plugin. It contains the cluster,
// namespace and name of a loaded Team CR and a list of corresponding applications.
type Team struct {
	Cluster      string `json:"cluster"`
	Namespace    string `json:"namespace"`
	Name         string `json:"name"`
	Applications []application.ApplicationSpec
}

// Get returns a list of teams. For that we are looping through all clusters and getting all the Team CRs from each of
// the clusters. After that we are transforming each Team CR into our internal Teams structure, by just keeping the
// cluster, namespace and name of each team. In the following we have to loop again to each cluster, to retrieve all the
// applications. The we are are going through each team and application to check if the application contains a reference
// for the team. If this is the case we are adding the application to the team.
func Get(ctx context.Context, clusters *clusters.Clusters) []Team {
	var cachedTeams []Team

	for _, c := range clusters.Clusters {
		teams, err := c.GetTeams(ctx, "")
		if err != nil {
			continue
		}

		for _, team := range teams {
			cachedTeams = append(cachedTeams, Team{
				Cluster:   team.Cluster,
				Namespace: team.Namespace,
				Name:      team.Name,
			})
		}
	}

	for _, c := range clusters.Clusters {
		applications, err := c.GetApplications(ctx, "")
		if err != nil {
			continue
		}

		for i := 0; i < len(cachedTeams); i++ {
			var teamApplications []application.ApplicationSpec

			for _, application := range applications {
				if doesApplicationContainsTeam(application, cachedTeams[i].Cluster, cachedTeams[i].Namespace, cachedTeams[i].Name) {
					teamApplications = append(teamApplications, application)
				}
			}

			cachedTeams[i].Applications = append(cachedTeams[i].Applications, teamApplications...)
		}
	}

	return cachedTeams
}

// GetApplications returns the applications for the requested team.
func GetApplications(teams []Team, cluster, namespace, name string) []application.ApplicationSpec {
	for _, t := range teams {
		if t.Cluster == cluster && t.Namespace == namespace && t.Name == name {
			return t.Applications
		}
	}

	return nil
}

// doesApplicationContainsTeam checks if the given team name exists in a slice of teams.
func doesApplicationContainsTeam(application application.ApplicationSpec, cluster, namespace, name string) bool {
	for _, t := range application.Teams {
		if t.Cluster == "" {
			t.Cluster = application.Cluster
		}

		if t.Namespace == "" {
			t.Namespace = application.Namespace
		}

		if t.Cluster == cluster && t.Namespace == namespace && t.Name == name {
			return true
		}
	}

	return false
}
