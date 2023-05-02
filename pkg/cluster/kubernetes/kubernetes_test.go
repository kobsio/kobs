package kubernetes

import (
	"context"
	"fmt"
	"testing"

	applicationv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/application/v1"
	dashboardv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/dashboard/v1"
	teamv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/team/v1"
	userv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/user/v1"
	applicationfakeclient "github.com/kobsio/kobs/pkg/cluster/kubernetes/clients/application/clientset/versioned/fake"
	applicationfake "github.com/kobsio/kobs/pkg/cluster/kubernetes/clients/application/clientset/versioned/typed/application/v1/fake"
	dashboardfakeclient "github.com/kobsio/kobs/pkg/cluster/kubernetes/clients/dashboard/clientset/versioned/fake"
	dashboardfake "github.com/kobsio/kobs/pkg/cluster/kubernetes/clients/dashboard/clientset/versioned/typed/dashboard/v1/fake"
	teamfakeclient "github.com/kobsio/kobs/pkg/cluster/kubernetes/clients/team/clientset/versioned/fake"
	teamfake "github.com/kobsio/kobs/pkg/cluster/kubernetes/clients/team/clientset/versioned/typed/team/v1/fake"
	userfakeclient "github.com/kobsio/kobs/pkg/cluster/kubernetes/clients/user/clientset/versioned/fake"
	userfake "github.com/kobsio/kobs/pkg/cluster/kubernetes/clients/user/clientset/versioned/typed/user/v1/fake"

	"github.com/stretchr/testify/require"
	"go.opentelemetry.io/otel"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/client-go/kubernetes/fake"
	fakecorev1 "k8s.io/client-go/kubernetes/typed/core/v1/fake"
	kubernetesTesting "k8s.io/client-go/testing"
)

func TestGetNamespaces(t *testing.T) {
	var getClient = func() client {
		return client{
			clientset: fake.NewSimpleClientset(&corev1.Namespace{
				ObjectMeta: metav1.ObjectMeta{
					Name: "default",
				},
			}, &corev1.Namespace{
				ObjectMeta: metav1.ObjectMeta{
					Name: "kube-system",
				},
			}),
			tracer: otel.Tracer("cluster"),
		}
	}

	t.Run("should return namespaces", func(t *testing.T) {
		client := getClient()
		namespaces, err := client.GetNamespaces(context.Background())
		require.NoError(t, err)
		require.Equal(t, []string([]string{"default", "kube-system"}), namespaces)
	})

	t.Run("should return error", func(t *testing.T) {
		client := getClient()
		client.clientset.CoreV1().(*fakecorev1.FakeCoreV1).PrependReactor("list", "namespaces", func(action kubernetesTesting.Action) (handled bool, ret runtime.Object, err error) {
			return true, &corev1.NamespaceList{}, fmt.Errorf("error getting namespaces")
		})
		namespaces, err := client.GetNamespaces(context.Background())
		require.Error(t, err)
		require.Equal(t, "error getting namespaces", err.Error())
		require.Equal(t, []string(nil), namespaces)
	})
}

func TestGetApplications(t *testing.T) {
	var getClient = func() client {
		return client{
			applicationClientset: applicationfakeclient.NewSimpleClientset(&applicationv1.Application{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "application1",
					Namespace: "default",
				},
				Spec: applicationv1.ApplicationSpec{
					Teams: []string{"team1"},
				},
			}, &applicationv1.Application{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "application2",
					Namespace: "default",
				},
			}),
			tracer: otel.Tracer("cluster"),
		}
	}

	t.Run("should get applications error", func(t *testing.T) {
		client := getClient()
		client.applicationClientset.KobsV1().(*applicationfake.FakeKobsV1).PrependReactor("list", "applications", func(action kubernetesTesting.Action) (handled bool, ret runtime.Object, err error) {
			return true, &applicationv1.ApplicationList{}, fmt.Errorf("error getting applications")
		})
		applications, err := client.GetApplications(context.Background(), "cluster", "")
		require.Error(t, err)
		require.Equal(t, "error getting applications", err.Error())
		require.Equal(t, []applicationv1.ApplicationSpec([]applicationv1.ApplicationSpec(nil)), applications)
	})

	t.Run("should get applications", func(t *testing.T) {
		client := getClient()
		applications, err := client.GetApplications(context.Background(), "cluster", "default")
		require.NoError(t, err)
		require.Equal(t, []applicationv1.ApplicationSpec{
			{ID: "/cluster/cluster/namespace/default/name/application1", Cluster: "cluster", Namespace: "default", Name: "application1", Teams: []string{"team1"}},
			{ID: "/cluster/cluster/namespace/default/name/application2", Cluster: "cluster", Namespace: "default", Name: "application2"},
		}, applications)
	})
}

func TestGetApplication(t *testing.T) {
	var getClient = func() client {
		return client{
			applicationClientset: applicationfakeclient.NewSimpleClientset(&applicationv1.Application{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "application1",
					Namespace: "default",
				},
			}, &applicationv1.Application{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "application2",
					Namespace: "default",
				},
			}),
			tracer: otel.Tracer("cluster"),
		}
	}

	t.Run("should get applications error", func(t *testing.T) {
		client := getClient()
		client.applicationClientset.KobsV1().(*applicationfake.FakeKobsV1).PrependReactor("get", "applications", func(action kubernetesTesting.Action) (handled bool, ret runtime.Object, err error) {
			return true, &applicationv1.Application{}, fmt.Errorf("error getting application")
		})
		_, err := client.GetApplication(context.Background(), "cluster", "", "")
		require.Error(t, err)
		require.Equal(t, "error getting application", err.Error())
	})

	t.Run("should get application", func(t *testing.T) {
		client := getClient()
		applications, err := client.GetApplication(context.Background(), "cluster", "default", "application1")
		require.NoError(t, err)
		require.Equal(t, &applicationv1.ApplicationSpec{ID: "/cluster/cluster/namespace/default/name/application1", Cluster: "cluster", Namespace: "default", Name: "application1"}, applications)
	})
}

func TestGetTeams(t *testing.T) {
	var getClient = func() client {
		return client{
			teamClientset: teamfakeclient.NewSimpleClientset(&teamv1.Team{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "team1",
					Namespace: "default",
				},
			}, &teamv1.Team{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "team2",
					Namespace: "default",
				},
			}),
			tracer: otel.Tracer("cluster"),
		}
	}

	t.Run("should get teams error", func(t *testing.T) {
		client := getClient()
		client.teamClientset.KobsV1().(*teamfake.FakeKobsV1).PrependReactor("list", "teams", func(action kubernetesTesting.Action) (handled bool, ret runtime.Object, err error) {
			return true, &teamv1.TeamList{}, fmt.Errorf("error getting teams")
		})
		teams, err := client.GetTeams(context.Background(), "cluster", "")
		require.Error(t, err)
		require.Equal(t, "error getting teams", err.Error())
		require.Equal(t, []teamv1.TeamSpec([]teamv1.TeamSpec(nil)), teams)
	})

	t.Run("should get teams", func(t *testing.T) {
		client := getClient()
		teams, err := client.GetTeams(context.Background(), "cluster", "default")
		require.NoError(t, err)
		require.Equal(t, []teamv1.TeamSpec{
			{Cluster: "cluster", Namespace: "default", Name: "team1"},
			{Cluster: "cluster", Namespace: "default", Name: "team2"},
		}, teams)
	})
}

func TestGetTeam(t *testing.T) {
	var getClient = func() client {
		return client{
			teamClientset: teamfakeclient.NewSimpleClientset(&teamv1.Team{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "team1",
					Namespace: "default",
				},
			}, &teamv1.Team{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "team2",
					Namespace: "default",
				},
			}),
			tracer: otel.Tracer("cluster"),
		}
	}

	t.Run("should get teams error", func(t *testing.T) {
		client := getClient()
		client.teamClientset.KobsV1().(*teamfake.FakeKobsV1).PrependReactor("get", "teams", func(action kubernetesTesting.Action) (handled bool, ret runtime.Object, err error) {
			return true, &teamv1.Team{}, fmt.Errorf("error getting team")
		})
		_, err := client.GetTeam(context.Background(), "cluster", "", "")
		require.Error(t, err)
		require.Equal(t, "error getting team", err.Error())
	})

	t.Run("should get team", func(t *testing.T) {
		client := getClient()
		teams, err := client.GetTeam(context.Background(), "cluster", "default", "team1")
		require.NoError(t, err)
		require.Equal(t, &teamv1.TeamSpec{Cluster: "cluster", Namespace: "default", Name: "team1"}, teams)
	})
}

func TestGetDashboards(t *testing.T) {
	var getClient = func() client {
		return client{
			dashboardClientset: dashboardfakeclient.NewSimpleClientset(&dashboardv1.Dashboard{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "dashboard1",
					Namespace: "default",
				},
			}, &dashboardv1.Dashboard{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "dashboard2",
					Namespace: "default",
				},
			}),
			tracer: otel.Tracer("cluster"),
		}
	}

	t.Run("should get dashboards error", func(t *testing.T) {
		client := getClient()
		client.dashboardClientset.KobsV1().(*dashboardfake.FakeKobsV1).PrependReactor("list", "dashboards", func(action kubernetesTesting.Action) (handled bool, ret runtime.Object, err error) {
			return true, &dashboardv1.DashboardList{}, fmt.Errorf("error getting dashboards")
		})
		dashboards, err := client.GetDashboards(context.Background(), "cluster", "")
		require.Error(t, err)
		require.Equal(t, "error getting dashboards", err.Error())
		require.Equal(t, []dashboardv1.DashboardSpec([]dashboardv1.DashboardSpec(nil)), dashboards)
	})

	t.Run("should get dashboards", func(t *testing.T) {
		client := getClient()
		dashboards, err := client.GetDashboards(context.Background(), "cluster", "default")
		require.NoError(t, err)
		require.Equal(t, []dashboardv1.DashboardSpec{
			{ID: "/cluster/cluster/namespace/default/name/dashboard1", Cluster: "cluster", Namespace: "default", Name: "dashboard1", Title: "dashboard1"},
			{ID: "/cluster/cluster/namespace/default/name/dashboard2", Cluster: "cluster", Namespace: "default", Name: "dashboard2", Title: "dashboard2"},
		}, dashboards)
	})
}

func TestGetDashboard(t *testing.T) {
	var getClient = func() client {
		return client{
			dashboardClientset: dashboardfakeclient.NewSimpleClientset(&dashboardv1.Dashboard{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "dashboard1",
					Namespace: "default",
				},
			}, &dashboardv1.Dashboard{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "dashboard2",
					Namespace: "default",
				},
			}),
			tracer: otel.Tracer("cluster"),
		}
	}

	t.Run("should get dashboards error", func(t *testing.T) {
		client := getClient()
		client.dashboardClientset.KobsV1().(*dashboardfake.FakeKobsV1).PrependReactor("get", "dashboards", func(action kubernetesTesting.Action) (handled bool, ret runtime.Object, err error) {
			return true, &dashboardv1.Dashboard{}, fmt.Errorf("error getting dashboard")
		})
		_, err := client.GetDashboard(context.Background(), "cluster", "", "")
		require.Error(t, err)
		require.Equal(t, "error getting dashboard", err.Error())
	})

	t.Run("should get dashboard", func(t *testing.T) {
		client := getClient()
		dashboards, err := client.GetDashboard(context.Background(), "cluster", "default", "dashboard1")
		require.NoError(t, err)
		require.Equal(t, &dashboardv1.DashboardSpec{ID: "/cluster/cluster/namespace/default/name/dashboard1", Cluster: "cluster", Namespace: "default", Name: "dashboard1", Title: "dashboard1"}, dashboards)
	})
}

func TestGetUsers(t *testing.T) {
	var getClient = func() client {
		return client{
			userClientset: userfakeclient.NewSimpleClientset(&userv1.User{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "user1",
					Namespace: "default",
				},
			}, &userv1.User{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "user2",
					Namespace: "default",
				},
			}),
			tracer: otel.Tracer("cluster"),
		}
	}

	t.Run("should get users error", func(t *testing.T) {
		client := getClient()
		client.userClientset.KobsV1().(*userfake.FakeKobsV1).PrependReactor("list", "users", func(action kubernetesTesting.Action) (handled bool, ret runtime.Object, err error) {
			return true, &userv1.UserList{}, fmt.Errorf("error getting users")
		})
		users, err := client.GetUsers(context.Background(), "cluster", "")
		require.Error(t, err)
		require.Equal(t, "error getting users", err.Error())
		require.Equal(t, []userv1.UserSpec([]userv1.UserSpec(nil)), users)
	})

	t.Run("should get users", func(t *testing.T) {
		client := getClient()
		users, err := client.GetUsers(context.Background(), "cluster", "default")
		require.NoError(t, err)
		require.Equal(t, []userv1.UserSpec{{Cluster: "cluster", Namespace: "default", Name: "user1"}, {Cluster: "cluster", Namespace: "default", Name: "user2"}}, users)
	})
}

func TestGetUser(t *testing.T) {
	var getClient = func() client {
		return client{
			userClientset: userfakeclient.NewSimpleClientset(&userv1.User{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "user1",
					Namespace: "default",
				},
			}, &userv1.User{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "user2",
					Namespace: "default",
				},
			}),
			tracer: otel.Tracer("cluster"),
		}
	}

	t.Run("should get users error", func(t *testing.T) {
		client := getClient()
		client.userClientset.KobsV1().(*userfake.FakeKobsV1).PrependReactor("get", "users", func(action kubernetesTesting.Action) (handled bool, ret runtime.Object, err error) {
			return true, &userv1.User{}, fmt.Errorf("error getting user")
		})
		_, err := client.GetUser(context.Background(), "cluster", "", "")
		require.Error(t, err)
		require.Equal(t, "error getting user", err.Error())
	})

	t.Run("should get user", func(t *testing.T) {
		client := getClient()
		users, err := client.GetUser(context.Background(), "cluster", "default", "user1")
		require.NoError(t, err)
		require.Equal(t, &userv1.UserSpec{Cluster: "cluster", Namespace: "default", Name: "user1"}, users)
	})
}
