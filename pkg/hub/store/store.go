package store

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"

	"go.uber.org/zap"
	_ "modernc.org/sqlite"

	applicationv1 "github.com/kobsio/kobs/pkg/kube/apis/application/v1"
	dashboardv1 "github.com/kobsio/kobs/pkg/kube/apis/dashboard/v1"
	teamv1 "github.com/kobsio/kobs/pkg/kube/apis/team/v1"
	userv1 "github.com/kobsio/kobs/pkg/kube/apis/user/v1"
	"github.com/kobsio/kobs/pkg/log"
)

const schema string = `
  CREATE TABLE IF NOT EXISTS specs (
    type VARCHAR(255),
	cluster VARCHAR(255),
	namespace VARCHAR(255),
	name VARCHAR(255),
    satellite VARCHAR(255),
	spec TEXT,
	PRIMARY KEY (type, cluster, namespace, name)
  );
`

type Config struct {
	DSNUri string `json:"dsnUri"`
}

// Client is the interface with all the methods to interact with the store.
type Client interface {
	SaveApplications(satellite string, applications []applicationv1.ApplicationSpec) error
	SaveDashboards(satellite string, dashboards []dashboardv1.DashboardSpec) error
	SaveTeams(satellite string, teams []teamv1.TeamSpec) error
	SaveUsers(satellite string, users []userv1.UserSpec) error
	GetApplicationsBySatellite(satellite string, limit, offset int) ([]applicationv1.ApplicationSpec, error)
	GetApplicationsByCluster(cluster string, limit, offset int) ([]applicationv1.ApplicationSpec, error)
	GetApplicationsByNamespace(namespace string, limit, offset int) ([]applicationv1.ApplicationSpec, error)
	GetApplication(cluster, namespace, name string) (applicationv1.ApplicationSpec, error)
	GetDashboardsBySatellite(satellite string, limit, offset int) ([]dashboardv1.DashboardSpec, error)
	GetDashboardsByCluster(cluster string, limit, offset int) ([]dashboardv1.DashboardSpec, error)
	GetDashboardsByNamespace(namespace string, limit, offset int) ([]dashboardv1.DashboardSpec, error)
	GetDashboard(cluster, namespace, name string) (dashboardv1.DashboardSpec, error)
	GetTeamsBySatellite(satellite string, limit, offset int) ([]teamv1.TeamSpec, error)
	GetTeamByCluster(cluster string, limit, offset int) ([]teamv1.TeamSpec, error)
	GetTeamsByNamespace(namespace string, limit, offset int) ([]teamv1.TeamSpec, error)
	GetTeam(cluster, namespace, name string) (teamv1.TeamSpec, error)
	GetUsersBySatellite(satellite string, limit, offset int) ([]userv1.UserSpec, error)
	GetUsersByCluster(cluster string, limit, offset int) ([]userv1.UserSpec, error)
	GetUsersByNamespace(namespace string, limit, offset int) ([]userv1.UserSpec, error)
	GetUser(cluster, namespace, name string) (userv1.UserSpec, error)
}

type client struct {
	config *Config
	db     *sql.DB
}

func NewClient(cfg *Config) (Client, error) {
	db, err := sql.Open("sqlite", cfg.DSNUri)
	if err != nil {
		return nil, err
	}

	err = setupSchema(db)
	if err != nil {
		return nil, err
	}

	return &client{
		config: cfg,
		db:     db,
	}, nil
}

//SaveApplications Deletes all applications for the given satellite and insert afterwards all passed applications.
func (s *client) SaveApplications(satellite string, applications []applicationv1.ApplicationSpec) error {
	return save(satellite, "application", applications, s)
}

//SaveDashboards Deletes all dashboards for the given satellite and insert afterwards all passed dashboards.
func (s *client) SaveDashboards(satellite string, dashboards []dashboardv1.DashboardSpec) error {
	return save(satellite, "dashboard", dashboards, s)
}

//SaveTeams Deletes all teams for the given satellite and insert afterwards all passed teams.
func (s *client) SaveTeams(satellite string, teams []teamv1.TeamSpec) error {
	return save(satellite, "team", teams, s)
}

//SaveUsers Deletes all users for the given satellite and insert afterwards all passed users.
func (s *client) SaveUsers(satellite string, users []userv1.UserSpec) error {
	return save(satellite, "user", users, s)
}

//GetApplicationsBySatellite Returns slice of applications for given satellite ordered by name
func (s *client) GetApplicationsBySatellite(satellite string, limit, offset int) ([]applicationv1.ApplicationSpec, error) {
	if satellite == "" {
		return []applicationv1.ApplicationSpec{}, errors.New("param satellite can not be empty")
	}

	apps, err := getSpecs("application", "satellite", satellite, limit, offset, s, applicationv1.ApplicationSpec{})
	if err != nil {
		return apps, err
	}

	return apps, nil
}

//GetApplicationsByCluster Returns slice of applications for given cluster ordered by name
func (s *client) GetApplicationsByCluster(cluster string, limit, offset int) ([]applicationv1.ApplicationSpec, error) {
	if cluster == "" {
		return []applicationv1.ApplicationSpec{}, errors.New("param cluster can not be empty")
	}

	apps, err := getSpecs("application", "cluster", cluster, limit, offset, s, applicationv1.ApplicationSpec{})
	if err != nil {
		return apps, err
	}

	return apps, nil
}

//GetApplicationsByNamespace Returns slice of applications for given namespace ordered by name
func (s *client) GetApplicationsByNamespace(namespace string, limit, offset int) ([]applicationv1.ApplicationSpec, error) {
	if namespace == "" {
		return []applicationv1.ApplicationSpec{}, errors.New("param namespace can not be empty")
	}

	apps, err := getSpecs("application", "namespace", namespace, limit, offset, s, applicationv1.ApplicationSpec{})
	if err != nil {
		return apps, err
	}

	return apps, nil
}

//GetApplication Returns a single application by its primary key
func (s *client) GetApplication(cluster, namespace, name string) (applicationv1.ApplicationSpec, error) {
	application := applicationv1.ApplicationSpec{}
	err := s.getSpec("application", cluster, namespace, name, &application)
	if err != nil {
		return applicationv1.ApplicationSpec{}, err
	}
	return application, nil
}

//GetDashboardsBySatellite Returns slice of dashboards for given satellite ordered by name
func (s *client) GetDashboardsBySatellite(satellite string, limit, offset int) ([]dashboardv1.DashboardSpec, error) {
	if satellite == "" {
		return []dashboardv1.DashboardSpec{}, errors.New("param satellite can not be empty")
	}

	dashboards, err := getSpecs("dashboard", "satellite", satellite, limit, offset, s, dashboardv1.DashboardSpec{})
	if err != nil {
		return dashboards, err
	}

	return dashboards, nil
}

//GetDashboardsByCluster Returns slice of dashboards for given cluster ordered by name
func (s *client) GetDashboardsByCluster(cluster string, limit, offset int) ([]dashboardv1.DashboardSpec, error) {
	if cluster == "" {
		return []dashboardv1.DashboardSpec{}, errors.New("param cluster can not be empty")
	}

	dashboards, err := getSpecs("dashboard", "cluster", cluster, limit, offset, s, dashboardv1.DashboardSpec{})
	if err != nil {
		return dashboards, err
	}

	return dashboards, nil
}

//GetDashboardsByNamespace Returns slice of dashboards for given namespace ordered by name
func (s *client) GetDashboardsByNamespace(namespace string, limit, offset int) ([]dashboardv1.DashboardSpec, error) {
	if namespace == "" {
		return []dashboardv1.DashboardSpec{}, errors.New("param namespace can not be empty")
	}

	dashboards, err := getSpecs("dashboard", "namespace", namespace, limit, offset, s, dashboardv1.DashboardSpec{})
	if err != nil {
		return dashboards, err
	}

	return dashboards, nil
}

//GetDashboard Returns a single dashboard by its primary key
func (s *client) GetDashboard(cluster, namespace, name string) (dashboardv1.DashboardSpec, error) {
	dashboard := dashboardv1.DashboardSpec{}
	err := s.getSpec("dashboard", cluster, namespace, name, &dashboard)
	if err != nil {
		return dashboardv1.DashboardSpec{}, err
	}
	return dashboard, nil
}

//GetTeamsBySatellite Returns slice of teams for given satellite ordered by name
func (s *client) GetTeamsBySatellite(satellite string, limit, offset int) ([]teamv1.TeamSpec, error) {
	if satellite == "" {
		return []teamv1.TeamSpec{}, errors.New("param satellite can not be empty")
	}

	teams, err := getSpecs("team", "satellite", satellite, limit, offset, s, teamv1.TeamSpec{})
	if err != nil {
		return teams, err
	}

	return teams, nil
}

//GetTeamByCluster Returns slice of teams for given cluster ordered by name
func (s *client) GetTeamByCluster(cluster string, limit, offset int) ([]teamv1.TeamSpec, error) {
	if cluster == "" {
		return []teamv1.TeamSpec{}, errors.New("param cluster can not be empty")
	}

	teams, err := getSpecs("team", "cluster", cluster, limit, offset, s, teamv1.TeamSpec{})
	if err != nil {
		return teams, err
	}

	return teams, nil
}

//GetTeamsByNamespace Returns slice of teams for given namespace ordered by name
func (s *client) GetTeamsByNamespace(namespace string, limit, offset int) ([]teamv1.TeamSpec, error) {
	if namespace == "" {
		return []teamv1.TeamSpec{}, errors.New("param namespace can not be empty")
	}

	teams, err := getSpecs("team", "namespace", namespace, limit, offset, s, teamv1.TeamSpec{})
	if err != nil {
		return teams, err
	}

	return teams, nil
}

//GetTeam Returns a single team by its primary key
func (s *client) GetTeam(cluster, namespace, name string) (teamv1.TeamSpec, error) {
	team := teamv1.TeamSpec{}
	err := s.getSpec("team", cluster, namespace, name, &team)
	if err != nil {
		return teamv1.TeamSpec{}, err
	}
	return team, nil
}

//GetUsersBySatellite Returns slice of users for given satellite ordered by name
func (s *client) GetUsersBySatellite(satellite string, limit, offset int) ([]userv1.UserSpec, error) {
	if satellite == "" {
		return []userv1.UserSpec{}, errors.New("param satellite can not be empty")
	}

	users, err := getSpecs("user", "satellite", satellite, limit, offset, s, userv1.UserSpec{})
	if err != nil {
		return users, err
	}

	return users, nil
}

//GetUsersByCluster Returns slice of users for given cluster ordered by name
func (s *client) GetUsersByCluster(cluster string, limit, offset int) ([]userv1.UserSpec, error) {
	if cluster == "" {
		return []userv1.UserSpec{}, errors.New("param cluster can not be empty")
	}

	users, err := getSpecs("user", "cluster", cluster, limit, offset, s, userv1.UserSpec{})
	if err != nil {
		return users, err
	}

	return users, nil
}

//GetUsersByNamespace Returns slice of users for given namespace ordered by name
func (s *client) GetUsersByNamespace(namespace string, limit, offset int) ([]userv1.UserSpec, error) {
	if namespace == "" {
		return []userv1.UserSpec{}, errors.New("param namespace can not be empty")
	}

	users, err := getSpecs("user", "namespace", namespace, limit, offset, s, userv1.UserSpec{})
	if err != nil {
		return users, err
	}

	return users, nil
}

//GetUser Returns a single user by its primary key
func (s *client) GetUser(cluster, namespace, name string) (userv1.UserSpec, error) {
	user := userv1.UserSpec{}
	err := s.getSpec("user", cluster, namespace, name, &user)
	if err != nil {
		return userv1.UserSpec{}, err
	}
	return user, nil
}

func setupSchema(db *sql.DB) error {
	_, err := db.Exec(schema)
	return err
}

func save[T any](satellite, specType string, spec []T, s *client) error {
	tx, err := s.db.BeginTx(context.Background(), nil)
	if err != nil {
		log.Error(nil, "failed to begin transaction", zap.Error(err))
	}
	defer tx.Rollback()

	if _, err = tx.Exec("DELETE FROM specs WHERE type=? AND satellite=?", specType, satellite); err != nil {
		log.Error(nil, "failed to delete "+specType+" for satellite", zap.String("satellite", satellite), zap.Error(err))
		return err
	}

	if err = insertSpecs(specType, satellite, spec, tx); err != nil {
		log.Error(nil, "failed to insert "+specType, zap.Error(err))
		return err
	}

	if err = tx.Commit(); err != nil {
		log.Error(nil, "failed to commit transaction", zap.Error(err))
		return err
	}
	return nil
}

func insertSpecs[T any](specType, satellite string, specs []T, tx *sql.Tx) error {
	insert, err := tx.Prepare("INSERT INTO specs VALUES (?, ?, ?, ?, ?, ?)")
	if err != nil {
		return err
	}
	defer insert.Close()

	for _, s := range specs {
		jsonBytes, err := json.Marshal(s)
		if err != nil {
			return err
		}

		var cluster, namespace, name string
		switch spec := any(s).(type) {
		case applicationv1.ApplicationSpec:
			cluster = spec.Cluster
			namespace = spec.Namespace
			name = spec.Name
		case dashboardv1.DashboardSpec:
			cluster = spec.Cluster
			namespace = spec.Namespace
			name = spec.Name
		case teamv1.TeamSpec:
			cluster = spec.Cluster
			namespace = spec.Namespace
			name = spec.Name
		case userv1.UserSpec:
			cluster = spec.Cluster
			namespace = spec.Namespace
			name = spec.Name
		default:
			return errors.New("unsupported spec type")
		}

		_, err = insert.Exec(specType, cluster, namespace, name, satellite, string(jsonBytes))
		if err != nil {
			return err
		}
	}
	return nil
}

func (s *client) getSpec(specType, cluster, namespace, name string, dest any) error {
	row := s.db.QueryRow("SELECT spec FROM specs WHERE type=? AND cluster=? AND namespace=? AND NAME=?", specType, cluster, namespace, name)
	var spec string

	var err error
	if err = row.Scan(&spec); err == sql.ErrNoRows {
		return err
	}
	err = json.Unmarshal([]byte(spec), &dest)
	if err != nil {
		return err
	}

	return nil
}

func getSpecs[T any](specType, filterKey, filterValue string, limit int, offset int, s *client, dest T) ([]T, error) {
	query := fmt.Sprintf("SELECT spec FROM specs WHERE type=? AND %s=? ORDER BY name LIMIT %d OFFSET %d", filterKey, limit, offset)
	rows, err := s.db.Query(query, specType, filterValue)
	if err != nil {
		log.Error(nil, "failed to query specs", zap.String(filterKey, filterValue), zap.Error(err))
		return []T{}, err
	}
	defer rows.Close()

	var apps []T
	apps, err = scanRows(rows, dest)
	if err != nil {
		return apps, err
	}

	return apps, nil
}

func scanRows[T any](rows *sql.Rows, dest T) ([]T, error) {
	var specs []T
	for rows.Next() {
		var spec string
		err := rows.Scan(&spec)
		if err != nil {
			return []T{}, err
		}

		err = json.Unmarshal([]byte(spec), &dest)
		if err != nil {
			log.Error(nil, "failed to unmarshal spec", zap.String("spec", spec), zap.Error(err))
			return []T{}, err
		}
		specs = append(specs, dest)
	}
	return specs, nil
}
