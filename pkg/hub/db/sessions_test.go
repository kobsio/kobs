package db

import (
	"context"
	"testing"

	authContext "github.com/kobsio/kobs/pkg/hub/auth/context"

	"github.com/orlangure/gnomock"
	"github.com/stretchr/testify/require"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func TestCreateSession(t *testing.T) {
	uri, container := setupDatabase(t)
	defer gnomock.Stop(container)
	c, _ := NewClient(Config{URI: uri})

	session, err := c.CreateSession(context.Background(), authContext.User{ID: "userid"})
	require.NoError(t, err)
	require.NotNil(t, session)
}

func TestGetSession(t *testing.T) {
	uri, container := setupDatabase(t)
	defer gnomock.Stop(container)
	c, _ := NewClient(Config{URI: uri})

	session, err := c.CreateSession(context.Background(), authContext.User{ID: "userid"})
	require.NoError(t, err)
	require.NotNil(t, session)

	t.Run("should return session", func(t *testing.T) {
		actualSession, err := c.GetSession(context.Background(), session.ID)
		require.NoError(t, err)
		require.Equal(t, session.ID, actualSession.ID)
		require.Equal(t, session.User.ID, actualSession.User.ID)
	})

	t.Run("should fail to return session, when session does not exists", func(t *testing.T) {
		_, err := c.GetSession(context.Background(), primitive.NewObjectID())
		require.Error(t, err)
		require.Equal(t, ErrSessionNotFound, err)
	})
}

func TestGetAndUpdateSession(t *testing.T) {
	uri, container := setupDatabase(t)
	defer gnomock.Stop(container)
	c, _ := NewClient(Config{URI: uri})

	session, err := c.CreateSession(context.Background(), authContext.User{ID: "userid"})
	require.NoError(t, err)
	require.NotNil(t, session)

	t.Run("should return and update session", func(t *testing.T) {
		actualSession, err := c.GetAndUpdateSession(context.Background(), session.ID)
		require.NoError(t, err)
		require.Equal(t, session.ID, actualSession.ID)
		require.Equal(t, session.User.ID, actualSession.User.ID)
	})

	t.Run("should fail to update session, when session does not exists", func(t *testing.T) {
		_, err := c.GetAndUpdateSession(context.Background(), primitive.NewObjectID())
		require.Error(t, err)
		require.Equal(t, ErrSessionNotFound, err)
	})
}

func TestDeleteSession(t *testing.T) {
	uri, container := setupDatabase(t)
	defer gnomock.Stop(container)
	c, _ := NewClient(Config{URI: uri})

	session, err := c.CreateSession(context.Background(), authContext.User{ID: "userid"})
	require.NoError(t, err)
	require.NotNil(t, session)

	t.Run("should delete session", func(t *testing.T) {
		err := c.DeleteSession(context.Background(), session.ID)
		require.NoError(t, err)
	})

	t.Run("should fail to delete session, when session does not exists", func(t *testing.T) {
		err := c.DeleteSession(context.Background(), primitive.NewObjectID())
		require.Error(t, err)
		require.Equal(t, ErrSessionNotFound, err)
	})
}
