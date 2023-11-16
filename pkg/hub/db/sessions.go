package db

import (
	"context"
	"fmt"
	"time"

	authContext "github.com/kobsio/kobs/pkg/hub/auth/context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
)

var (
	// ErrSessionNotFound is our custom error which is returned when we are not able to find a session with the
	// provided session id.
	ErrSessionNotFound = fmt.Errorf("session not found")
)

// Session is the structure of a single session as it is saved in the database. Each session contains an id and a
// user to which the session belongs to. The session also contains a `createdAt` and `updatedAt` field, so that we know
// when a session was created or used the last time.
type Session struct {
	ID        primitive.ObjectID `json:"id" bson:"_id"`
	User      authContext.User   `json:"user" bson:"user"`
	CreatedAt time.Time          `json:"createdAt" bson:"createdAt"`
	UpdatedAt time.Time          `json:"updatedAt" bson:"updatedAt"`
}

// CreateSession creates a new session for the provided `user`.
func (c *client) CreateSession(ctx context.Context, user authContext.User) (*Session, error) {
	now := time.Now()
	session := Session{
		ID:        primitive.NewObjectID(),
		User:      user,
		CreatedAt: now,
		UpdatedAt: now,
	}

	ctx, span := c.tracer.Start(ctx, "db.CreateSession")
	span.SetAttributes(attribute.Key("sessionID").String(session.ID.String()))
	span.SetAttributes(attribute.Key("userID").String(user.ID))
	defer span.End()

	_, err := c.coll(ctx, "sessions").InsertOne(ctx, session)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return nil, err
	}

	return &session, nil
}

// GetSession returns the session with the provided session id.
func (c *client) GetSession(ctx context.Context, sessionID primitive.ObjectID) (*Session, error) {
	ctx, span := c.tracer.Start(ctx, "db.GetSession")
	span.SetAttributes(attribute.Key("sessionID").String(sessionID.String()))
	defer span.End()

	res := c.coll(ctx, "sessions").FindOne(ctx, bson.D{{Key: "_id", Value: sessionID}})
	if res.Err() != nil {
		span.RecordError(res.Err())
		span.SetStatus(codes.Error, res.Err().Error())
		if res.Err() == mongo.ErrNoDocuments {
			return nil, ErrSessionNotFound
		}
		return nil, res.Err()
	}

	var session Session
	err := res.Decode(&session)
	if err != nil {
		return nil, err
	}

	return &session, nil
}

// GetAndUpdateSession returns the session for the provided `sessionID` and updates the `updatedAt` field of the session
// to the current time, so that we know when the session was used the last time.
func (c *client) GetAndUpdateSession(ctx context.Context, sessionID primitive.ObjectID) (*Session, error) {
	ctx, span := c.tracer.Start(ctx, "db.UpdateSession")
	span.SetAttributes(attribute.Key("sessionID").String(sessionID.String()))
	defer span.End()

	res := c.coll(ctx, "sessions").FindOneAndUpdate(ctx, bson.D{{Key: "_id", Value: sessionID}}, bson.D{{Key: "$set", Value: bson.D{{Key: "updatedAt", Value: time.Now()}}}})
	if res.Err() != nil {
		span.RecordError(res.Err())
		span.SetStatus(codes.Error, res.Err().Error())
		if res.Err() == mongo.ErrNoDocuments {
			return nil, ErrSessionNotFound
		}
		return nil, res.Err()
	}

	var session Session
	err := res.Decode(&session)
	if err != nil {
		return nil, err
	}

	return &session, nil
}

// DeleteSession deletes an existing user session, so that the session can not be used anymore to make requests against
// our API which requires an authenticated user.
func (c *client) DeleteSession(ctx context.Context, sessionID primitive.ObjectID) error {
	ctx, span := c.tracer.Start(ctx, "db.DeleteSession")
	span.SetAttributes(attribute.Key("sessionID").String(sessionID.String()))
	defer span.End()

	res, err := c.coll(ctx, "sessions").DeleteOne(ctx, bson.D{{Key: "_id", Value: sessionID}})
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return err
	}

	if res.DeletedCount != 1 {
		span.RecordError(ErrSessionNotFound)
		span.SetStatus(codes.Error, ErrSessionNotFound.Error())
		return ErrSessionNotFound
	}

	return nil
}
