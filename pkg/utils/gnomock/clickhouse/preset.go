// Package clickhouse provides a Gnomock Preset for a ClickHouse database.
package clickhouse

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/orlangure/gnomock"
)

const defaultPort = 8123
const defaultVersion = "22.8.16"

// Preset creates a new Gnomock ClickHouse preset. This preset includes a ClickHouse
// specific healthcheck function, default ClickHouse image and port, and allows to
// optionally set up initial state.
func Preset() gnomock.Preset {
	return &P{}
}

// P is a Gnomock Preset implementation of ClickHouse database
type P struct {
	Queries []string `json:"queries"`
	Version string   `json:"version"`
}

// Image returns an image that should be pulled to create this container
func (p *P) Image() string {
	return fmt.Sprintf("docker.io/clickhouse/clickhouse-server:%s", p.Version)
}

// Ports returns ports that should be used to access this container
func (p *P) Ports() gnomock.NamedPorts {
	return gnomock.DefaultTCP(defaultPort)
}

// Options returns a list of options to configure this container
func (p *P) Options() []gnomock.Option {
	p.setDefaults()

	opts := []gnomock.Option{
		gnomock.WithHealthCheck(p.healthcheck),
		gnomock.WithInit(p.initf()),
	}

	return opts
}

func (p *P) healthcheck(ctx context.Context, c *gnomock.Container) error {
	db, err := connect(c)
	if err != nil {
		return err
	}

	defer func() {
		_ = db.Close()
	}()

	var one int

	row := db.QueryRow(`select 1`)

	err = row.Scan(&one)
	if err != nil {
		return err
	}

	if one != 1 {
		return fmt.Errorf("unexpected healthcheck result: 1 != %d", one)
	}

	return nil
}

func (p *P) initf() gnomock.InitFunc {
	return func(ctx context.Context, c *gnomock.Container) error {
		db, err := connect(c)
		if err != nil {
			return err
		}

		defer func() { _ = db.Close() }()

		for _, q := range p.Queries {
			_, err = db.Exec(q)
			if err != nil {
				return err
			}
		}

		return nil
	}
}

func (p *P) setDefaults() {
	if p.Version == "" {
		p.Version = defaultVersion
	}
}

func connect(c *gnomock.Container) (*sql.DB, error) {
	connStr := fmt.Sprintf("http://%s:%d", c.Host, c.Port(gnomock.DefaultPort))

	conn, err := sql.Open("clickhouse", connStr)
	if err != nil {
		return nil, err
	}

	return conn, conn.Ping()
}
