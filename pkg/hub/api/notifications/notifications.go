package notifications

import (
	"fmt"
	"net/http"

	authContext "github.com/kobsio/kobs/pkg/hub/auth/context"
	"github.com/kobsio/kobs/pkg/hub/db"
	"github.com/kobsio/kobs/pkg/instrument/log"

	userv1 "github.com/kobsio/kobs/pkg/client/kubernetes/apis/user/v1"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
	"go.uber.org/zap"
)

type Config userv1.Notifications

type Router struct {
	*chi.Mux
	config      Config
	storeClient db.Client
	tracer      trace.Tracer
}

func (router *Router) getNotificationGroups(w http.ResponseWriter, r *http.Request) {
	ctx, span := router.tracer.Start(r.Context(), "getNotificationGroups")
	defer span.End()

	authUser := authContext.MustGetUser(ctx)
	if authUser.ID == "" {
		log.Warn(ctx, "user has no email, return default notification groups")
		span.AddEvent("returnedGroups", trace.WithAttributes(attribute.String("groups", fmt.Sprintf("%#v", router.config.Groups))))
		render.JSON(w, r, router.config.Groups)
		return
	}

	user, err := router.storeClient.GetUserByID(ctx, authUser.ID)
	if err != nil {
		log.Error(ctx, "could not get user, return default notification groups", zap.Error(err), zap.String("id", authUser.ID))
		span.AddEvent("returnedGroups", trace.WithAttributes(attribute.String("groups", fmt.Sprintf("%#v", router.config.Groups))))
		render.JSON(w, r, router.config.Groups)
		return
	}

	notificationGroups := user.Notifications.Groups
	if len(notificationGroups) > 0 {
		log.Debug(ctx, "Return user notification groups", zap.Int("groupsCount", len(notificationGroups)))
		span.AddEvent("returnedGroups", trace.WithAttributes(attribute.String("groups", fmt.Sprintf("%#v", notificationGroups))))
		render.JSON(w, r, notificationGroups)
		return
	}

	teams, err := router.storeClient.GetTeamsByIDs(ctx, user.Permissions.Teams)
	if err != nil {
		log.Error(ctx, "Could not get teams, return default notification groups", zap.Error(err), zap.String("email", user.ID), zap.Strings("teams", user.Permissions.Teams))
		span.AddEvent("returnedGroups", trace.WithAttributes(attribute.String("groups", fmt.Sprintf("%#v", router.config.Groups))))
		render.JSON(w, r, router.config.Groups)
		return
	}

	var teamNotificationGroups []userv1.NotificationsGroup
	for _, team := range teams {
		teamNotificationGroups = append(teamNotificationGroups, team.Notifications.Groups...)
	}
	if len(teamNotificationGroups) > 0 {
		log.Debug(ctx, "Return team notification groups", zap.Int("groupsCount", len(teamNotificationGroups)))
		span.AddEvent("returnedGroups", trace.WithAttributes(attribute.String("groups", fmt.Sprintf("%#v", teamNotificationGroups))))
		render.JSON(w, r, teamNotificationGroups)
		return
	}

	log.Debug(ctx, "Return default notification groups")
	span.AddEvent("returnedGroups", trace.WithAttributes(attribute.String("groups", fmt.Sprintf("%#v", router.config.Groups))))
	render.JSON(w, r, router.config.Groups)
}

func Mount(config Config, storeClient db.Client) chi.Router {
	router := Router{
		chi.NewRouter(),
		config,
		storeClient,
		otel.Tracer("notifications"),
	}

	router.Get("/groups", router.getNotificationGroups)

	return router
}
