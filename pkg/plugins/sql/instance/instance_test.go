package instance

import (
	"context"
	"database/sql"
	"fmt"
	"testing"

	"github.com/orlangure/gnomock"
	"github.com/orlangure/gnomock/preset/mysql"
	"github.com/orlangure/gnomock/preset/postgres"
	"github.com/stretchr/testify/require"

	"github.com/kobsio/kobs/pkg/plugins/sql/instance/clickhouse"
)

func TestCompletions(t *testing.T) {
	setupPostgres := func(t *testing.T) (string, *gnomock.Container) {
		p := postgres.Preset(
			postgres.WithUser("gnomock", "password"),
			postgres.WithDatabase("mydb"),
		)

		c, err := gnomock.Start(p)
		if err != nil {
			t.Fatal(err)
		}

		return fmt.Sprintf("postgres://gnomock:password@%s/mydb?sslmode=disable", c.DefaultAddress()), c
	}

	setupMysql := func(t *testing.T) (string, *gnomock.Container) {
		p := mysql.Preset(
			mysql.WithUser("gnomock", "password"),
			mysql.WithDatabase("mydb"),
		)

		c, err := gnomock.Start(p)
		if err != nil {
			t.Fatal(err)
		}

		return fmt.Sprintf("gnomock:password@tcp(%s)/mydb", c.DefaultAddress()), c
	}

	setupClickhouse := func(t *testing.T) (string, *gnomock.Container) {
		p := clickhouse.Preset()

		c, err := gnomock.Start(p)
		if err != nil {
			t.Fatal(err)
		}

		return fmt.Sprintf("http://%s", c.DefaultAddress()), c
	}

	seedDatabase := func(t *testing.T, driver, connString string) {
		db, err := sql.Open(driver, connString)
		require.NoError(t, err)

		_, err = db.ExecContext(context.Background(), "CREATE TABLE mytable (id int, foo varchar(255));")
		require.NoError(t, err)

		_, err = db.ExecContext(context.Background(), "INSERT INTO mytable VALUES (0, 'bar'), (1, 'foobar');")
		require.NoError(t, err)
	}

	t.Run("postgres completions", func(t *testing.T) {
		connString, _ := setupPostgres(t)
		seedDatabase(t, "postgres", connString)

		instance, err := New("instance", map[string]any{
			"driver":  "postgres",
			"address": connString,
		})
		require.NoError(t, err)

		completions, err := instance.GetCompletions(context.TODO())
		require.NoError(t, err)
		require.Contains(t, completions["mytable"], "id")
		require.Contains(t, completions["mytable"], "foo")
	})

	t.Run("mysql completions", func(t *testing.T) {
		connString, _ := setupMysql(t)
		seedDatabase(t, "mysql", connString)

		instance, err := New("instance", map[string]any{
			"driver":  "mysql",
			"address": connString,
		})
		require.NoError(t, err)

		completions, err := instance.GetCompletions(context.TODO())
		require.NoError(t, err)
		require.Contains(t, completions["mytable"], "id")
		require.Contains(t, completions["mytable"], "foo")
	})

	t.Run("clickhouse completions", func(t *testing.T) {
		connString, _ := setupClickhouse(t)
		instance, err := New("instance", map[string]any{
			"driver":  "clickhouse",
			"address": connString + "/system",
		})
		require.NoError(t, err)

		completions, err := instance.GetCompletions(context.TODO())
		require.NoError(t, err)
		require.Contains(t, completions["tables"], "database")
		require.Contains(t, completions["tables"], "name")
		require.Contains(t, completions["tables"], "uuid")
	})
}

func TestGetQueryResults(t *testing.T) {
	setupPostgres := func(t *testing.T) (string, *gnomock.Container) {
		p := postgres.Preset(
			postgres.WithUser("gnomock", "password"),
			postgres.WithDatabase("mydb"),
		)

		c, err := gnomock.Start(p)
		if err != nil {
			t.Fatal(err)
		}

		return fmt.Sprintf("postgres://gnomock:password@%s/mydb?sslmode=disable", c.DefaultAddress()), c
	}

	seedDatabase := func(t *testing.T, driver, connString string) {
		db, err := sql.Open(driver, connString)
		require.NoError(t, err)

		_, err = db.ExecContext(context.Background(), "CREATE TABLE foo (id int, name varchar(255), num real)")
		require.NoError(t, err)

		_, err = db.ExecContext(context.Background(), "INSERT INTO foo VALUES (0, 'foo', 1.23), (1, 'bar', 3.14)")
		require.NoError(t, err)
	}

	t.Run("can query rows", func(t *testing.T) {
		connString, _ := setupPostgres(t)
		seedDatabase(t, "postgres", connString)
		instance, err := New("instance", map[string]any{
			"driver":  "postgres",
			"address": connString,
		})
		require.NoError(t, err)

		rows, cols, err := instance.GetQueryResults(context.Background(), "SELECT * FROM foo")
		require.NoError(t, err)
		require.Equal(t, []string{"id", "name", "num"}, cols)

		require.Len(t, rows, 2)
		require.Equal(t, int64(0), rows[0]["id"])
		require.Equal(t, int64(1), rows[1]["id"])

		require.Equal(t, "foo", rows[0]["name"])
		require.Equal(t, "bar", rows[1]["name"])

		require.InDelta(t, 1.23, rows[0]["num"], 1e-6)
		require.InDelta(t, 3.14, rows[1]["num"], 1e-6)
	})
}
