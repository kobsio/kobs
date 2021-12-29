package cluster

import (
	"context"
	"fmt"
	"testing"
	"time"

	application "github.com/kobsio/kobs/pkg/api/apis/application/v1beta1"
	dashboard "github.com/kobsio/kobs/pkg/api/apis/dashboard/v1beta1"
	team "github.com/kobsio/kobs/pkg/api/apis/team/v1beta1"
	user "github.com/kobsio/kobs/pkg/api/apis/user/v1beta1"
	applicationfakeclient "github.com/kobsio/kobs/pkg/api/clients/application/clientset/versioned/fake"
	applicationfake "github.com/kobsio/kobs/pkg/api/clients/application/clientset/versioned/typed/application/v1beta1/fake"
	dashboardfakeclient "github.com/kobsio/kobs/pkg/api/clients/dashboard/clientset/versioned/fake"
	dashboardfake "github.com/kobsio/kobs/pkg/api/clients/dashboard/clientset/versioned/typed/dashboard/v1beta1/fake"
	teamfakeclient "github.com/kobsio/kobs/pkg/api/clients/team/clientset/versioned/fake"
	teamfake "github.com/kobsio/kobs/pkg/api/clients/team/clientset/versioned/typed/team/v1beta1/fake"
	userfakeclient "github.com/kobsio/kobs/pkg/api/clients/user/clientset/versioned/fake"
	userfake "github.com/kobsio/kobs/pkg/api/clients/user/clientset/versioned/typed/user/v1beta1/fake"

	"github.com/stretchr/testify/require"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	runtime "k8s.io/apimachinery/pkg/runtime"
	"k8s.io/client-go/kubernetes/fake"
	fakecorev1 "k8s.io/client-go/kubernetes/typed/core/v1/fake"
	kubernetesTesting "k8s.io/client-go/testing"
)

func TestGetName(t *testing.T) {
	client := client{name: "test"}
	require.Equal(t, client.GetName(), "test")
}

func TestGetCRDs(t *testing.T) {
	client := client{crds: []CRD{}}
	require.Equal(t, client.GetCRDs(), []CRD{})
}

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
		}
	}

	t.Run("get namespaces", func(t *testing.T) {
		client := getClient()
		namespaces, err := client.GetNamespaces(context.Background(), 10*time.Second)
		require.NoError(t, err)
		require.Equal(t, []string([]string{"default", "kube-system"}), namespaces)
	})

	t.Run("get namespaces from cache", func(t *testing.T) {
		client := getClient()
		client.cache = Cache{
			namespaces:          []string{"default", "kube-system", "kube-public"},
			namespacesLastFetch: time.Now().Add(-5 * time.Second),
		}

		namespaces, err := client.GetNamespaces(context.Background(), 10*time.Second)
		require.NoError(t, err)
		require.Equal(t, []string([]string{"default", "kube-system", "kube-public"}), namespaces)
	})

	t.Run("get namespaces error", func(t *testing.T) {
		client := getClient()
		client.clientset.CoreV1().(*fakecorev1.FakeCoreV1).PrependReactor("list", "namespaces", func(action kubernetesTesting.Action) (handled bool, ret runtime.Object, err error) {
			return true, &corev1.NamespaceList{}, fmt.Errorf("error getting namespaces")
		})
		namespaces, err := client.GetNamespaces(context.Background(), 10*time.Second)
		require.Error(t, err)
		require.Equal(t, "error getting namespaces", err.Error())
		require.Equal(t, []string(nil), namespaces)
	})
}

func TestGetApplications(t *testing.T) {
	var getClient = func() client {
		return client{
			name: "test",
			applicationClientset: applicationfakeclient.NewSimpleClientset(&application.Application{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "application1",
					Namespace: "default",
				},
			}, &application.Application{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "application2",
					Namespace: "default",
				},
			}),
		}
	}

	t.Run("get applications error", func(t *testing.T) {
		client := getClient()
		client.applicationClientset.KobsV1beta1().(*applicationfake.FakeKobsV1beta1).PrependReactor("list", "applications", func(action kubernetesTesting.Action) (handled bool, ret runtime.Object, err error) {
			return true, &application.ApplicationList{}, fmt.Errorf("error getting applications")
		})
		applications, err := client.GetApplications(context.Background(), "")
		require.Error(t, err)
		require.Equal(t, "error getting applications", err.Error())
		require.Equal(t, []application.ApplicationSpec([]application.ApplicationSpec(nil)), applications)
	})

	t.Run("get applications", func(t *testing.T) {
		client := getClient()
		applications, err := client.GetApplications(context.Background(), "default")
		require.NoError(t, err)
		require.Equal(t, []application.ApplicationSpec{{Cluster: "test", Namespace: "default", Name: "application1"}, {Cluster: "test", Namespace: "default", Name: "application2"}}, applications)
	})
}

func TestGetApplication(t *testing.T) {
	var getClient = func() client {
		return client{
			name: "test",
			applicationClientset: applicationfakeclient.NewSimpleClientset(&application.Application{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "application1",
					Namespace: "default",
				},
			}, &application.Application{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "application2",
					Namespace: "default",
				},
			}),
		}
	}

	t.Run("get applications error", func(t *testing.T) {
		client := getClient()
		client.applicationClientset.KobsV1beta1().(*applicationfake.FakeKobsV1beta1).PrependReactor("get", "applications", func(action kubernetesTesting.Action) (handled bool, ret runtime.Object, err error) {
			return true, &application.Application{}, fmt.Errorf("error getting application")
		})
		_, err := client.GetApplication(context.Background(), "", "")
		require.Error(t, err)
		require.Equal(t, "error getting application", err.Error())
	})

	t.Run("get application", func(t *testing.T) {
		client := getClient()
		applications, err := client.GetApplication(context.Background(), "default", "application1")
		require.NoError(t, err)
		require.Equal(t, &application.ApplicationSpec{Cluster: "test", Namespace: "default", Name: "application1"}, applications)
	})
}

func TestGetTeams(t *testing.T) {
	var getClient = func() client {
		return client{
			name: "test",
			teamClientset: teamfakeclient.NewSimpleClientset(&team.Team{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "team1",
					Namespace: "default",
				},
			}, &team.Team{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "team2",
					Namespace: "default",
				},
			}),
		}
	}

	t.Run("get teams error", func(t *testing.T) {
		client := getClient()
		client.teamClientset.KobsV1beta1().(*teamfake.FakeKobsV1beta1).PrependReactor("list", "teams", func(action kubernetesTesting.Action) (handled bool, ret runtime.Object, err error) {
			return true, &team.TeamList{}, fmt.Errorf("error getting teams")
		})
		teams, err := client.GetTeams(context.Background(), "")
		require.Error(t, err)
		require.Equal(t, "error getting teams", err.Error())
		require.Equal(t, []team.TeamSpec([]team.TeamSpec(nil)), teams)
	})

	t.Run("get teams", func(t *testing.T) {
		client := getClient()
		teams, err := client.GetTeams(context.Background(), "default")
		require.NoError(t, err)
		require.Equal(t, []team.TeamSpec{{Cluster: "test", Namespace: "default", Name: "team1"}, {Cluster: "test", Namespace: "default", Name: "team2"}}, teams)
	})
}

func TestGetTeam(t *testing.T) {
	var getClient = func() client {
		return client{
			name: "test",
			teamClientset: teamfakeclient.NewSimpleClientset(&team.Team{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "team1",
					Namespace: "default",
				},
			}, &team.Team{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "team2",
					Namespace: "default",
				},
			}),
		}
	}

	t.Run("get teams error", func(t *testing.T) {
		client := getClient()
		client.teamClientset.KobsV1beta1().(*teamfake.FakeKobsV1beta1).PrependReactor("get", "teams", func(action kubernetesTesting.Action) (handled bool, ret runtime.Object, err error) {
			return true, &team.Team{}, fmt.Errorf("error getting team")
		})
		_, err := client.GetTeam(context.Background(), "", "")
		require.Error(t, err)
		require.Equal(t, "error getting team", err.Error())
	})

	t.Run("get team", func(t *testing.T) {
		client := getClient()
		teams, err := client.GetTeam(context.Background(), "default", "team1")
		require.NoError(t, err)
		require.Equal(t, &team.TeamSpec{Cluster: "test", Namespace: "default", Name: "team1"}, teams)
	})
}

func TestGetDashboards(t *testing.T) {
	var getClient = func() client {
		return client{
			name: "test",
			dashboardClientset: dashboardfakeclient.NewSimpleClientset(&dashboard.Dashboard{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "dashboard1",
					Namespace: "default",
				},
			}, &dashboard.Dashboard{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "dashboard2",
					Namespace: "default",
				},
			}),
		}
	}

	t.Run("get dashboards error", func(t *testing.T) {
		client := getClient()
		client.dashboardClientset.KobsV1beta1().(*dashboardfake.FakeKobsV1beta1).PrependReactor("list", "dashboards", func(action kubernetesTesting.Action) (handled bool, ret runtime.Object, err error) {
			return true, &dashboard.DashboardList{}, fmt.Errorf("error getting dashboards")
		})
		dashboards, err := client.GetDashboards(context.Background(), "")
		require.Error(t, err)
		require.Equal(t, "error getting dashboards", err.Error())
		require.Equal(t, []dashboard.DashboardSpec([]dashboard.DashboardSpec(nil)), dashboards)
	})

	t.Run("get dashboards", func(t *testing.T) {
		client := getClient()
		dashboards, err := client.GetDashboards(context.Background(), "default")
		require.NoError(t, err)
		require.Equal(t, []dashboard.DashboardSpec{{Cluster: "test", Namespace: "default", Name: "dashboard1", Title: "dashboard1"}, {Cluster: "test", Namespace: "default", Name: "dashboard2", Title: "dashboard2"}}, dashboards)
	})
}

func TestGetDashboard(t *testing.T) {
	var getClient = func() client {
		return client{
			name: "test",
			dashboardClientset: dashboardfakeclient.NewSimpleClientset(&dashboard.Dashboard{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "dashboard1",
					Namespace: "default",
				},
			}, &dashboard.Dashboard{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "dashboard2",
					Namespace: "default",
				},
			}),
		}
	}

	t.Run("get dashboards error", func(t *testing.T) {
		client := getClient()
		client.dashboardClientset.KobsV1beta1().(*dashboardfake.FakeKobsV1beta1).PrependReactor("get", "dashboards", func(action kubernetesTesting.Action) (handled bool, ret runtime.Object, err error) {
			return true, &dashboard.Dashboard{}, fmt.Errorf("error getting dashboard")
		})
		_, err := client.GetDashboard(context.Background(), "", "")
		require.Error(t, err)
		require.Equal(t, "error getting dashboard", err.Error())
	})

	t.Run("get dashboard", func(t *testing.T) {
		client := getClient()
		dashboards, err := client.GetDashboard(context.Background(), "default", "dashboard1")
		require.NoError(t, err)
		require.Equal(t, &dashboard.DashboardSpec{Cluster: "test", Namespace: "default", Name: "dashboard1", Title: "dashboard1"}, dashboards)
	})
}

func TestGetUsers(t *testing.T) {
	var getClient = func() client {
		return client{
			name: "test",
			userClientset: userfakeclient.NewSimpleClientset(&user.User{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "user1",
					Namespace: "default",
				},
			}, &user.User{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "user2",
					Namespace: "default",
				},
			}),
		}
	}

	t.Run("get users error", func(t *testing.T) {
		client := getClient()
		client.userClientset.KobsV1beta1().(*userfake.FakeKobsV1beta1).PrependReactor("list", "users", func(action kubernetesTesting.Action) (handled bool, ret runtime.Object, err error) {
			return true, &user.UserList{}, fmt.Errorf("error getting users")
		})
		users, err := client.GetUsers(context.Background(), "")
		require.Error(t, err)
		require.Equal(t, "error getting users", err.Error())
		require.Equal(t, []user.UserSpec([]user.UserSpec(nil)), users)
	})

	t.Run("get users", func(t *testing.T) {
		client := getClient()
		users, err := client.GetUsers(context.Background(), "default")
		require.NoError(t, err)
		require.Equal(t, []user.UserSpec{{Cluster: "test", Namespace: "default", Name: "user1"}, {Cluster: "test", Namespace: "default", Name: "user2"}}, users)
	})
}

func TestGetUser(t *testing.T) {
	var getClient = func() client {
		return client{
			name: "test",
			userClientset: userfakeclient.NewSimpleClientset(&user.User{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "user1",
					Namespace: "default",
				},
			}, &user.User{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "user2",
					Namespace: "default",
				},
			}),
		}
	}

	t.Run("get users error", func(t *testing.T) {
		client := getClient()
		client.userClientset.KobsV1beta1().(*userfake.FakeKobsV1beta1).PrependReactor("get", "users", func(action kubernetesTesting.Action) (handled bool, ret runtime.Object, err error) {
			return true, &user.User{}, fmt.Errorf("error getting user")
		})
		_, err := client.GetUser(context.Background(), "", "")
		require.Error(t, err)
		require.Equal(t, "error getting user", err.Error())
	})

	t.Run("get user", func(t *testing.T) {
		client := getClient()
		users, err := client.GetUser(context.Background(), "default", "user1")
		require.NoError(t, err)
		require.Equal(t, &user.UserSpec{Cluster: "test", Namespace: "default", Name: "user1"}, users)
	})
}
