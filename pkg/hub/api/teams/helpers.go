package teams

import (
	teamv1 "github.com/kobsio/kobs/pkg/kube/apis/team/v1"
)

// appendIfMissing appends a given team to a list of teams, when there isn't an existing team with the same group key in
// the slice.
func appendIfMissing(teams []teamv1.TeamSpec, team teamv1.TeamSpec) []teamv1.TeamSpec {
	for _, t := range teams {
		if t.Group == team.Group {
			return teams
		}
	}

	return append(teams, team)
}
