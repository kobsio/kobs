package store

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"

	applicationv1 "github.com/kobsio/kobs/pkg/kube/apis/application/v1"
	dashboardv1 "github.com/kobsio/kobs/pkg/kube/apis/dashboard/v1"
	teamv1 "github.com/kobsio/kobs/pkg/kube/apis/team/v1"
	userv1 "github.com/kobsio/kobs/pkg/kube/apis/user/v1"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/satellite/plugins/plugin"

	"go.uber.org/zap"
	_ "modernc.org/sqlite"
)

const schema string = `
  CREATE TABLE IF NOT EXISTS plugins (
    name VARCHAR(255),
    type VARCHAR(255),
    satellite VARCHAR(255),
    description TEXT,
    address TEXT,
    PRIMARY KEY (name, type, satellite)
  );

  CREATE TABLE IF NOT EXISTS clusters (
    name VARCHAR(255),
    satellite VARCHAR(255),
    PRIMARY KEY (name, satellite)
  );

  CREATE TABLE IF NOT EXISTS specs (
    type VARCHAR(255),
    cluster VARCHAR(255),
    namespace VARCHAR(255),
    name VARCHAR(255),
    satellite VARCHAR(255),
    spec TEXT,
    PRIMARY KEY (type, cluster, namespace, name, satellite)
  );
`

// Client is the interface with all the methods to interact with the store.
type Client interface {
	SavePlugins(ctx context.Context, satellite string, plugins []plugin.Instance) error
	SaveClusters(ctx context.Context, satellite string, clusters []string) error
	SaveApplications(ctx context.Context, satellite string, applications []applicationv1.ApplicationSpec) error
	SaveDashboards(ctx context.Context, satellite string, dashboards []dashboardv1.DashboardSpec) error
	SaveTeams(ctx context.Context, satellite string, teams []teamv1.TeamSpec) error
	SaveUsers(ctx context.Context, satellite string, users []userv1.UserSpec) error
	GetPlugins(ctx context.Context) ([]plugin.Instance, error)
	GetClusters(ctx context.Context) ([]string, error)
	GetApplicationsBySatellite(ctx context.Context, satellite string, limit, offset int) ([]applicationv1.ApplicationSpec, error)
	GetApplicationsByCluster(ctx context.Context, cluster string, limit, offset int) ([]applicationv1.ApplicationSpec, error)
	GetApplicationsByNamespace(ctx context.Context, namespace string, limit, offset int) ([]applicationv1.ApplicationSpec, error)
	GetApplication(ctx context.Context, cluster, namespace, name string) (applicationv1.ApplicationSpec, error)
	GetDashboardsBySatellite(ctx context.Context, satellite string, limit, offset int) ([]dashboardv1.DashboardSpec, error)
	GetDashboardsByCluster(ctx context.Context, cluster string, limit, offset int) ([]dashboardv1.DashboardSpec, error)
	GetDashboardsByNamespace(ctx context.Context, namespace string, limit, offset int) ([]dashboardv1.DashboardSpec, error)
	GetDashboard(ctx context.Context, cluster, namespace, name string) (dashboardv1.DashboardSpec, error)
	GetTeamsBySatellite(ctx context.Context, satellite string, limit, offset int) ([]teamv1.TeamSpec, error)
	GetTeamsByCluster(ctx context.Context, cluster string, limit, offset int) ([]teamv1.TeamSpec, error)
	GetTeamsByNamespace(ctx context.Context, namespace string, limit, offset int) ([]teamv1.TeamSpec, error)
	GetTeam(ctx context.Context, cluster, namespace, name string) (teamv1.TeamSpec, error)
	GetUsersBySatellite(ctx context.Context, satellite string, limit, offset int) ([]userv1.UserSpec, error)
	GetUsersByCluster(ctx context.Context, cluster string, limit, offset int) ([]userv1.UserSpec, error)
	GetUsersByNamespace(ctx context.Context, namespace string, limit, offset int) ([]userv1.UserSpec, error)
	GetUser(ctx context.Context, cluster, namespace, name string) (userv1.UserSpec, error)
}

type client struct {
	db *sql.DB
}

func NewClient(storeType, storeURI string) (Client, error) {
	if storeType != "sqlite" {
		return nil, fmt.Errorf("invalid store type")
	}

	db, err := sql.Open(storeType, storeURI)
	if err != nil {
		return nil, err
	}

	err = setupSchema(db)
	if err != nil {
		return nil, err
	}

	return &client{
		db: db,
	}, nil
}

// SavePlugins deletes all plugins for the given satellite and insert afterwards all passed plugins.
func (s *client) SavePlugins(ctx context.Context, satellite string, plugins []plugin.Instance) error {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		log.Error(nil, "failed to begin transaction", zap.Error(err))
	}
	defer tx.Rollback()

	if _, err = tx.ExecContext(ctx, "DELETE FROM plugins WHERE satellite=?", satellite); err != nil {
		log.Error(nil, "failed to delete plugins for satellite", zap.String("satellite", satellite), zap.Error(err))
		return err
	}

	insert, err := tx.Prepare("INSERT INTO plugins VALUES (?, ?, ?, ?, ?)")
	if err != nil {
		return err
	}
	defer insert.Close()

	for _, p := range plugins {
		_, err = insert.Exec(p.Name, p.Type, satellite, p.Description, p.Address)
		if err != nil {
			return err
		}
	}

	if err = tx.Commit(); err != nil {
		log.Error(nil, "failed to commit transaction", zap.Error(err))
		return err
	}

	return nil
}

// SaveDashboards deletes all clusters for the given satellite and insert afterwards all passed clusters.
func (s *client) SaveClusters(ctx context.Context, satellite string, clusters []string) error {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		log.Error(nil, "failed to begin transaction", zap.Error(err))
	}
	defer tx.Rollback()

	if _, err = tx.ExecContext(ctx, "DELETE FROM clusters WHERE satellite=?", satellite); err != nil {
		log.Error(nil, "failed to delete clusters for satellite", zap.String("satellite", satellite), zap.Error(err))
		return err
	}

	insert, err := tx.Prepare("INSERT INTO clusters VALUES (?, ?)")
	if err != nil {
		return err
	}
	defer insert.Close()

	for _, cluster := range clusters {
		_, err = insert.Exec(cluster, satellite)
		if err != nil {
			return err
		}
	}

	if err = tx.Commit(); err != nil {
		log.Error(nil, "failed to commit transaction", zap.Error(err))
		return err
	}

	return nil
}

// SaveApplications Deletes all applications for the given satellite and insert afterwards all passed applications.
func (s *client) SaveApplications(ctx context.Context, satellite string, applications []applicationv1.ApplicationSpec) error {
	return save(ctx, satellite, "application", applications, s)
}

// SaveDashboards Deletes all dashboards for the given satellite and insert afterwards all passed dashboards.
func (s *client) SaveDashboards(ctx context.Context, satellite string, dashboards []dashboardv1.DashboardSpec) error {
	return save(ctx, satellite, "dashboard", dashboards, s)
}

// SaveTeams Deletes all teams for the given satellite and insert afterwards all passed teams.
func (s *client) SaveTeams(ctx context.Context, satellite string, teams []teamv1.TeamSpec) error {
	return save(ctx, satellite, "team", teams, s)
}

// SaveUsers Deletes all users for the given satellite and insert afterwards all passed users.
func (s *client) SaveUsers(ctx context.Context, satellite string, users []userv1.UserSpec) error {
	return save(ctx, satellite, "user", users, s)
}

func (s *client) GetPlugins(ctx context.Context) ([]plugin.Instance, error) {
	rows, err := s.db.QueryContext(ctx, "SELECT name, type, description, address FROM plugins")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if rows.Err() != nil {
		return nil, rows.Err()
	}

	var instances []plugin.Instance

	for rows.Next() {
		var instance plugin.Instance
		err := rows.Scan(&instance.Name, &instance.Type, &instance.Description, &instance.Address)
		if err != nil {
			return nil, err
		}

		instances = append(instances, instance)
	}

	return instances, nil
}

func (s *client) GetClusters(ctx context.Context) ([]string, error) {
	rows, err := s.db.QueryContext(ctx, "SELECT name FROM clusters")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if rows.Err() != nil {
		return nil, rows.Err()
	}

	var clusters []string

	for rows.Next() {
		var cluster string
		err := rows.Scan(&cluster)
		if err != nil {
			return nil, err
		}

		clusters = append(clusters, cluster)
	}

	return clusters, nil
}

// GetApplicationsBySatellite Returns slice of applications for given satellite ordered by name
func (s *client) GetApplicationsBySatellite(ctx context.Context, satellite string, limit, offset int) ([]applicationv1.ApplicationSpec, error) {
	if satellite == "" {
		return []applicationv1.ApplicationSpec{}, errors.New("param satellite can not be empty")
	}

	apps, err := getSpecs(ctx, "application", "satellite", satellite, limit, offset, s, applicationv1.ApplicationSpec{})
	if err != nil {
		return apps, err
	}

	return apps, nil
}

// GetApplicationsByCluster Returns slice of applications for given cluster ordered by name
func (s *client) GetApplicationsByCluster(ctx context.Context, cluster string, limit, offset int) ([]applicationv1.ApplicationSpec, error) {
	if cluster == "" {
		return []applicationv1.ApplicationSpec{}, errors.New("param cluster can not be empty")
	}

	apps, err := getSpecs(ctx, "application", "cluster", cluster, limit, offset, s, applicationv1.ApplicationSpec{})
	if err != nil {
		return apps, err
	}

	return apps, nil
}

// GetApplicationsByNamespace Returns slice of applications for given namespace ordered by name
func (s *client) GetApplicationsByNamespace(ctx context.Context, namespace string, limit, offset int) ([]applicationv1.ApplicationSpec, error) {
	if namespace == "" {
		return []applicationv1.ApplicationSpec{}, errors.New("param namespace can not be empty")
	}

	apps, err := getSpecs(ctx, "application", "namespace", namespace, limit, offset, s, applicationv1.ApplicationSpec{})
	if err != nil {
		return apps, err
	}

	return apps, nil
}

// GetApplication Returns a single application by its primary key
func (s *client) GetApplication(ctx context.Context, cluster, namespace, name string) (applicationv1.ApplicationSpec, error) {
	application := applicationv1.ApplicationSpec{}
	err := s.getSpec(ctx, "application", cluster, namespace, name, &application)
	if err != nil {
		return applicationv1.ApplicationSpec{}, err
	}
	return application, nil
}

// GetDashboardsBySatellite Returns slice of dashboards for given satellite ordered by name
func (s *client) GetDashboardsBySatellite(ctx context.Context, satellite string, limit, offset int) ([]dashboardv1.DashboardSpec, error) {
	if satellite == "" {
		return []dashboardv1.DashboardSpec{}, errors.New("param satellite can not be empty")
	}

	dashboards, err := getSpecs(ctx, "dashboard", "satellite", satellite, limit, offset, s, dashboardv1.DashboardSpec{})
	if err != nil {
		return dashboards, err
	}

	return dashboards, nil
}

// GetDashboardsByCluster Returns slice of dashboards for given cluster ordered by name
func (s *client) GetDashboardsByCluster(ctx context.Context, cluster string, limit, offset int) ([]dashboardv1.DashboardSpec, error) {
	if cluster == "" {
		return []dashboardv1.DashboardSpec{}, errors.New("param cluster can not be empty")
	}

	dashboards, err := getSpecs(ctx, "dashboard", "cluster", cluster, limit, offset, s, dashboardv1.DashboardSpec{})
	if err != nil {
		return dashboards, err
	}

	return dashboards, nil
}

// GetDashboardsByNamespace Returns slice of dashboards for given namespace ordered by name
func (s *client) GetDashboardsByNamespace(ctx context.Context, namespace string, limit, offset int) ([]dashboardv1.DashboardSpec, error) {
	if namespace == "" {
		return []dashboardv1.DashboardSpec{}, errors.New("param namespace can not be empty")
	}

	dashboards, err := getSpecs(ctx, "dashboard", "namespace", namespace, limit, offset, s, dashboardv1.DashboardSpec{})
	if err != nil {
		return dashboards, err
	}

	return dashboards, nil
}

// GetDashboard Returns a single dashboard by its primary key
func (s *client) GetDashboard(ctx context.Context, cluster, namespace, name string) (dashboardv1.DashboardSpec, error) {
	dashboard := dashboardv1.DashboardSpec{}
	err := s.getSpec(ctx, "dashboard", cluster, namespace, name, &dashboard)
	if err != nil {
		return dashboardv1.DashboardSpec{}, err
	}
	return dashboard, nil
}

// GetTeamsBySatellite Returns slice of teams for given satellite ordered by name
func (s *client) GetTeamsBySatellite(ctx context.Context, satellite string, limit, offset int) ([]teamv1.TeamSpec, error) {
	if satellite == "" {
		return []teamv1.TeamSpec{}, errors.New("param satellite can not be empty")
	}

	teams, err := getSpecs(ctx, "team", "satellite", satellite, limit, offset, s, teamv1.TeamSpec{})
	if err != nil {
		return teams, err
	}

	return teams, nil
}

// GetTeamByCluster Returns slice of teams for given cluster ordered by name
func (s *client) GetTeamsByCluster(ctx context.Context, cluster string, limit, offset int) ([]teamv1.TeamSpec, error) {
	if cluster == "" {
		return []teamv1.TeamSpec{}, errors.New("param cluster can not be empty")
	}

	teams, err := getSpecs(ctx, "team", "cluster", cluster, limit, offset, s, teamv1.TeamSpec{})
	if err != nil {
		return teams, err
	}

	return teams, nil
}

// GetTeamsByNamespace Returns slice of teams for given namespace ordered by name
func (s *client) GetTeamsByNamespace(ctx context.Context, namespace string, limit, offset int) ([]teamv1.TeamSpec, error) {
	if namespace == "" {
		return []teamv1.TeamSpec{}, errors.New("param namespace can not be empty")
	}

	teams, err := getSpecs(ctx, "team", "namespace", namespace, limit, offset, s, teamv1.TeamSpec{})
	if err != nil {
		return teams, err
	}

	return teams, nil
}

// GetTeam Returns a single team by its primary key
func (s *client) GetTeam(ctx context.Context, cluster, namespace, name string) (teamv1.TeamSpec, error) {
	team := teamv1.TeamSpec{}
	err := s.getSpec(ctx, "team", cluster, namespace, name, &team)
	if err != nil {
		return teamv1.TeamSpec{}, err
	}
	return team, nil
}

// GetUsersBySatellite Returns slice of users for given satellite ordered by name
func (s *client) GetUsersBySatellite(ctx context.Context, satellite string, limit, offset int) ([]userv1.UserSpec, error) {
	if satellite == "" {
		return []userv1.UserSpec{}, errors.New("param satellite can not be empty")
	}

	users, err := getSpecs(ctx, "user", "satellite", satellite, limit, offset, s, userv1.UserSpec{})
	if err != nil {
		return users, err
	}

	return users, nil
}

// GetUsersByCluster Returns slice of users for given cluster ordered by name
func (s *client) GetUsersByCluster(ctx context.Context, cluster string, limit, offset int) ([]userv1.UserSpec, error) {
	if cluster == "" {
		return []userv1.UserSpec{}, errors.New("param cluster can not be empty")
	}

	users, err := getSpecs(ctx, "user", "cluster", cluster, limit, offset, s, userv1.UserSpec{})
	if err != nil {
		return users, err
	}

	return users, nil
}

// GetUsersByNamespace Returns slice of users for given namespace ordered by name
func (s *client) GetUsersByNamespace(ctx context.Context, namespace string, limit, offset int) ([]userv1.UserSpec, error) {
	if namespace == "" {
		return []userv1.UserSpec{}, errors.New("param namespace can not be empty")
	}

	users, err := getSpecs(ctx, "user", "namespace", namespace, limit, offset, s, userv1.UserSpec{})
	if err != nil {
		return users, err
	}

	return users, nil
}

// GetUser Returns a single user by its primary key
func (s *client) GetUser(ctx context.Context, cluster, namespace, name string) (userv1.UserSpec, error) {
	user := userv1.UserSpec{}
	err := s.getSpec(ctx, "user", cluster, namespace, name, &user)
	if err != nil {
		return userv1.UserSpec{}, err
	}
	return user, nil
}

func setupSchema(db *sql.DB) error {
	_, err := db.Exec(schema)
	return err
}

func save[T any](ctx context.Context, satellite, specType string, spec []T, s *client) error {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		log.Error(nil, "failed to begin transaction", zap.Error(err))
	}
	defer tx.Rollback()

	if _, err = tx.ExecContext(ctx, "DELETE FROM specs WHERE type=? AND satellite=?", specType, satellite); err != nil {
		log.Error(nil, "failed to delete "+specType+" for satellite", zap.String("satellite", satellite), zap.Error(err))
		return err
	}

	if err = insertSpecs(ctx, specType, satellite, spec, tx); err != nil {
		log.Error(nil, "failed to insert "+specType, zap.Error(err))
		return err
	}

	if err = tx.Commit(); err != nil {
		log.Error(nil, "failed to commit transaction", zap.Error(err))
		return err
	}
	return nil
}

func insertSpecs[T any](ctx context.Context, specType, satellite string, specs []T, tx *sql.Tx) error {
	insert, err := tx.PrepareContext(ctx, "INSERT INTO specs VALUES (?, ?, ?, ?, ?, ?)")
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

		_, err = insert.ExecContext(ctx, specType, cluster, namespace, name, satellite, string(jsonBytes))
		if err != nil {
			return err
		}
	}
	return nil
}

func (s *client) getSpec(ctx context.Context, specType, cluster, namespace, name string, dest any) error {
	row := s.db.QueryRowContext(ctx, "SELECT spec FROM specs WHERE type=? AND cluster=? AND namespace=? AND NAME=?", specType, cluster, namespace, name)
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

func getSpecs[T any](ctx context.Context, specType, filterKey, filterValue string, limit int, offset int, s *client, dest T) ([]T, error) {
	query := fmt.Sprintf("SELECT spec FROM specs WHERE type=? AND %s=? ORDER BY name LIMIT %d OFFSET %d", filterKey, limit, offset)
	rows, err := s.db.QueryContext(ctx, query, specType, filterValue)
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
