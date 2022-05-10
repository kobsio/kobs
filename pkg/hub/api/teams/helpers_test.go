package teams

import (
	"testing"

	teamv1 "github.com/kobsio/kobs/pkg/kube/apis/team/v1"
	"github.com/stretchr/testify/require"
)

func TestAppendIfMissing(t *testing.T) {
	teams := []teamv1.TeamSpec{{Group: "team1"}, {Group: "team2"}}

	teams = appendIfMissing(teams, teamv1.TeamSpec{Group: "team1"})
	require.Equal(t, []teamv1.TeamSpec{{Group: "team1"}, {Group: "team2"}}, teams)

	teams = appendIfMissing(teams, teamv1.TeamSpec{Group: "team3"})
	require.Equal(t, []teamv1.TeamSpec{{Group: "team1"}, {Group: "team2"}, {Group: "team3"}}, teams)
}
