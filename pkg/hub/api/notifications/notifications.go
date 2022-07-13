package notifications

import (
	"fmt"
	"net/http"

	authContext "github.com/kobsio/kobs/pkg/hub/middleware/userauth/context"
	"github.com/kobsio/kobs/pkg/hub/store"
	userv1 "github.com/kobsio/kobs/pkg/kube/apis/user/v1"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/kobsio/kobs/pkg/log"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
	"go.uber.org/zap"
)

type Config userv1.Notifications

type Router struct {
	*chi.Mux
	config      Config
	storeClient store.Client
	tracer      trace.Tracer
}

func (router *Router) getNotificationGroups(w http.ResponseWriter, r *http.Request) {
	ctx, span := router.tracer.Start(r.Context(), "getNotificationGroups")
	defer span.End()

	user, err := authContext.GetUser(ctx)
	if err != nil || user.Email == "" {
		log.Warn(ctx, "Could not get user, return default notification groups", zap.Error(err))
		span.AddEvent("returnedGroups", trace.WithAttributes(attribute.String("groups", fmt.Sprintf("%#v", router.config.Groups))))
		render.JSON(w, r, router.config.Groups)
		return
	}

	users, err := router.storeClient.GetUsersByEmail(ctx, user.Email)
	if err != nil {
		log.Error(ctx, "Could not get user, return default notification groups", zap.Error(err), zap.String("email", user.Email))
		span.AddEvent("returnedGroups", trace.WithAttributes(attribute.String("groups", fmt.Sprintf("%#v", router.config.Groups))))
		render.JSON(w, r, router.config.Groups)
		return
	}

	var userNotificationGroups []userv1.NotificationsGroup
	for _, v := range users {
		userNotificationGroups = append(userNotificationGroups, v.Notifications.Groups...)
	}

	if len(userNotificationGroups) > 0 {
		log.Debug(ctx, "Return user notification groups", zap.Int("groupsCount", len(userNotificationGroups)))
		span.AddEvent("returnedGroups", trace.WithAttributes(attribute.String("groups", fmt.Sprintf("%#v", userNotificationGroups))))
		render.JSON(w, r, userNotificationGroups)
		return
	}

	teams, err := router.storeClient.GetTeamsByGroups(ctx, user.Teams)
	if err != nil {
		log.Error(ctx, "Could not get teams, return default notification groups", zap.Error(err), zap.String("email", user.Email), zap.Strings("teams", user.Teams))
		span.AddEvent("returnedGroups", trace.WithAttributes(attribute.String("groups", fmt.Sprintf("%#v", router.config.Groups))))
		render.JSON(w, r, router.config.Groups)
		return
	}

	var teamNotificationGroups []userv1.NotificationsGroup
	for _, v := range teams {
		teamNotificationGroups = append(teamNotificationGroups, v.Notifications.Groups...)
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

func Mount(config Config, storeClient store.Client) chi.Router {
	router := Router{
		chi.NewRouter(),
		config,
		storeClient,
		otel.Tracer("notifications"),
	}

	router.Get("/groups", router.getNotificationGroups)

	return router
}
