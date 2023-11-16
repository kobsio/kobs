package db

import (
	"testing"

	authContext "github.com/kobsio/kobs/pkg/hub/auth/context"

	"github.com/orlangure/gnomock"
	"github.com/stretchr/testify/require"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func TestSessions(t *testing.T) {
	uri, container := setupDatabase(t)
	defer func(cs *gnomock.Container) {
		err := gnomock.Stop(cs)
		if err != nil {
			t.Error(err)
		}
	}(container)
	c, _ := NewClient(Config{URI: uri})

	t.Run("CreateSession", func(t *testing.T) {
		session, err := c.CreateSession(ctx(t), authContext.User{ID: "userid"})
		require.NoError(t, err)
		require.NotNil(t, session)
	})

	t.Run("GetSession", func(t *testing.T) {
		session, err := c.CreateSession(ctx(t), authContext.User{ID: "userid"})
		require.NoError(t, err)
		require.NotNil(t, session)

		ctx := ctx(t)
		t.Run("should return session", func(t *testing.T) {
			actualSession, err := c.GetSession(ctx, session.ID)
			require.NoError(t, err)
			require.Equal(t, session.ID, actualSession.ID)
			require.Equal(t, session.User.ID, actualSession.User.ID)
		})

		t.Run("should fail to return session, when session does not exists", func(t *testing.T) {
			_, err := c.GetSession(ctx, primitive.NewObjectID())
			require.Error(t, err)
			require.Equal(t, ErrSessionNotFound, err)
		})
	})

	t.Run("GetAndUpdateSession", func(t *testing.T) {
		session, err := c.CreateSession(ctx(t), authContext.User{ID: "userid"})
		require.NoError(t, err)
		require.NotNil(t, session)

		ctx := ctx(t)
		t.Run("should return and update session", func(t *testing.T) {
			actualSession, err := c.GetAndUpdateSession(ctx, session.ID)
			require.NoError(t, err)
			require.Equal(t, session.ID, actualSession.ID)
			require.Equal(t, session.User.ID, actualSession.User.ID)
		})

		t.Run("should fail to update session, when session does not exists", func(t *testing.T) {
			_, err := c.GetAndUpdateSession(ctx, primitive.NewObjectID())
			require.Error(t, err)
			require.Equal(t, ErrSessionNotFound, err)
		})
	})

	t.Run("DeleteSession", func(t *testing.T) {
		session, err := c.CreateSession(ctx(t), authContext.User{ID: "userid"})
		require.NoError(t, err)
		require.NotNil(t, session)

		ctx := ctx(t)
		t.Run("should delete session", func(t *testing.T) {
			err := c.DeleteSession(ctx, session.ID)
			require.NoError(t, err)
		})

		t.Run("should fail to delete session, when session does not exists", func(t *testing.T) {
			err := c.DeleteSession(ctx, primitive.NewObjectID())
			require.Error(t, err)
			require.Equal(t, ErrSessionNotFound, err)
		})
	})
}
