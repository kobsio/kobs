package applications

import (
	"fmt"
	"net/http"
	"strconv"

	authContext "github.com/kobsio/kobs/pkg/hub/auth/context"
	"github.com/kobsio/kobs/pkg/hub/store/shared"
	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/middleware/errresponse"

	"github.com/go-chi/render"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.uber.org/zap"
)

// Topology is the structure of the topology graph.
type Topology struct {
	Edges []Edge `json:"edges"`
	Nodes []Node `json:"nodes"`
}

// Node is the structure for a node in the topology graph.
type Node struct {
	Data NodeData `json:"data"`
}

// NodeData is the data for a node.
type NodeData struct {
	ID        string `json:"id"`
	Label     string `json:"label"`
	Cluster   string `json:"cluster"`
	Namespace string `json:"namespace"`
	Name      string `json:"name"`
	External  string `json:"external"`
}

// Edge is the structure for a edge in the topology graph.
type Edge struct {
	Data EdgeData `json:"data"`
}

// EdgeData is the data for a edge.
type EdgeData struct {
	ID              string `json:"id"`
	Source          string `json:"source"`
	SourceCluster   string `json:"-"`
	SourceNamespace string `json:"-"`
	SourceName      string `json:"-"`
	Target          string `json:"target"`
	TargetCluster   string `json:"-"`
	TargetNamespace string `json:"-"`
	TargetName      string `json:"-"`
	Description     string `json:"description"`
}

func createTopologyGraph(topology []shared.Topology) Topology {
	var edges []Edge
	var nodes []Node

	for _, t := range topology {
		edges = append(edges, Edge{
			Data: EdgeData{
				ID:              t.ID,
				Source:          t.SourceID,
				SourceCluster:   fmt.Sprintf("%s (%s)", t.SourceCluster, t.SourceSatellite),
				SourceNamespace: t.SourceNamespace,
				SourceName:      t.SourceName,
				Target:          t.TargetID,
				TargetCluster:   fmt.Sprintf("%s (%s)", t.TargetCluster, t.TargetSatellite),
				TargetNamespace: t.TargetNamespace,
				TargetName:      t.TargetName,
				Description:     t.TopologyDescription,
			},
		})

		var external string
		if t.TopologyExternal {
			external = "External"
		}

		nodes = appendNodeIfMissing(nodes, Node{
			Data: NodeData{
				ID:        t.SourceID,
				Label:     fmt.Sprintf("%s (%s / %s)", t.SourceName, t.SourceName, t.SourceCluster),
				Cluster:   fmt.Sprintf("%s (%s)", t.SourceCluster, t.SourceSatellite),
				Namespace: t.SourceNamespace,
				Name:      t.SourceName,
				External:  external,
			},
		})
	}

	for _, t := range topology {
		nodes = appendNodeIfMissing(nodes, Node{
			Data: NodeData{
				ID:        t.TargetID,
				Label:     fmt.Sprintf("%s (%s / %s)", t.TargetName, t.TargetName, t.TargetCluster),
				Cluster:   fmt.Sprintf("%s (%s)", t.TargetCluster, t.TargetSatellite),
				Namespace: t.TargetNamespace,
				Name:      t.TargetName,
				External:  "",
			},
		})
	}

	return Topology{
		Edges: edges,
		Nodes: nodes,
	}
}

// appendTopologyIfMissing appends a an topology item to a list of topology items, when the item doesn't already exists.
func appendTopologyIfMissing(items []shared.Topology, item shared.Topology) []shared.Topology {
	for _, i := range items {
		if i.ID == item.ID {
			return items
		}
	}

	return append(items, item)
}

// appendNodeIfMissing appends a node to the list of nodes, when is isn't already present in the list.
func appendNodeIfMissing(nodes []Node, node Node) []Node {
	for _, ele := range nodes {
		if ele.Data.ID == node.Data.ID {
			return nodes
		}
	}

	return append(nodes, node)
}

func (router *Router) getApplicationsTopology(w http.ResponseWriter, r *http.Request) {
	ctx, span := router.tracer.Start(r.Context(), "getApplicationsTopology")
	defer span.End()

	user, err := authContext.GetUser(ctx)
	if err != nil {
		log.Warn(ctx, "The user is not authorized to access the applications", zap.Error(err))
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to access the applications")
		return
	}

	teams := user.Teams
	all := r.URL.Query().Get("all")
	clusterIDs := r.URL.Query()["clusterID"]
	namespaceIDs := r.URL.Query()["namespaceID"]
	tags := r.URL.Query()["tag"]
	searchTerm := r.URL.Query().Get("searchTerm")
	external := r.URL.Query().Get("external")

	span.SetAttributes(attribute.Key("teams").StringSlice(teams))
	span.SetAttributes(attribute.Key("all").String(all))
	span.SetAttributes(attribute.Key("clusterIDs").StringSlice(clusterIDs))
	span.SetAttributes(attribute.Key("namespaceIDs").StringSlice(namespaceIDs))
	span.SetAttributes(attribute.Key("tags").StringSlice(tags))
	span.SetAttributes(attribute.Key("searchTerm").String(searchTerm))
	span.SetAttributes(attribute.Key("external").String(external))

	// Check if the user requested to see all applications, if this is the case we have to check if he is alowed to do
	// so. If a team isn't part of any teams "user.Teams" is "nil" we handle it the same ways as he wants to see all
	// applications.
	parsedAll, _ := strconv.ParseBool(all)
	if parsedAll == true || teams == nil {
		if !user.HasApplicationAccess("", "", "", []string{""}) {
			log.Warn(ctx, "The user is not authorized to view all applications")
			span.RecordError(fmt.Errorf("user is not authorized to view all applications"))
			span.SetStatus(codes.Error, "user is not authorized to view all applications")
			errresponse.Render(w, r, nil, http.StatusForbidden, "You are not allowed to view all applications")
			return
		}

		teams = nil
	}

	applications, err := router.storeClient.GetApplicationsByFilter(ctx, teams, clusterIDs, namespaceIDs, tags, searchTerm, external, 0, 0)
	if err != nil {
		log.Error(ctx, "Could not get applications", zap.Error(err))
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get applications")
		return
	}

	var applicationIDs []string
	for _, application := range applications {
		applicationIDs = append(applicationIDs, application.ID)
	}

	sourceTopology, err := router.storeClient.GetTopologyByIDs(ctx, "SourceID", applicationIDs)
	if err != nil {
		log.Error(ctx, "Could not get source topology", zap.Error(err))
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get source topology")
		return
	}

	targetTopology, err := router.storeClient.GetTopologyByIDs(ctx, "TargetID", applicationIDs)
	if err != nil {
		log.Error(ctx, "Could not get target topology", zap.Error(err))
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get target topology")
		return
	}

	var topology []shared.Topology
	for _, t := range sourceTopology {
		topology = appendTopologyIfMissing(topology, t)
	}
	for _, t := range targetTopology {
		topology = appendTopologyIfMissing(topology, t)
	}

	topologyGraph := createTopologyGraph(topology)
	render.JSON(w, r, topologyGraph)
}

func (router *Router) getApplicationTopology(w http.ResponseWriter, r *http.Request) {
	ctx, span := router.tracer.Start(r.Context(), "getApplicationTopology")
	defer span.End()

	user, err := authContext.GetUser(ctx)
	if err != nil {
		log.Warn(ctx, "The user is not authorized to access the application", zap.Error(err))
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		errresponse.Render(w, r, err, http.StatusUnauthorized, "You are not authorized to access the application")
		return
	}

	id := r.URL.Query().Get("id")

	span.SetAttributes(attribute.Key("id").String(id))

	application, err := router.storeClient.GetApplicationByID(ctx, id)
	if err != nil {
		log.Error(ctx, "Could not get application", zap.Error(err), zap.String("id", id))
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get application")
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return
	}

	if application == nil {
		log.Error(ctx, "Application was not found", zap.Error(err), zap.String("id", id))
		span.RecordError(fmt.Errorf("application was not found"))
		span.SetStatus(codes.Error, "application was not found")
		errresponse.Render(w, r, err, http.StatusBadRequest, "Application was not found")
		return
	}

	if !user.HasApplicationAccess(application.Satellite, application.Cluster, application.Namespace, application.Teams) {
		log.Warn(ctx, "The user is not authorized to view the application", zap.String("id", id))
		span.RecordError(fmt.Errorf("user is not authorized to view the application"))
		span.SetStatus(codes.Error, "user is not authorized to view the application")
		errresponse.Render(w, r, nil, http.StatusForbidden, "You are not allowed to view the application")
		return
	}

	sourceTopology, err := router.storeClient.GetTopologyByIDs(ctx, "SourceID", []string{id})
	if err != nil {
		log.Error(ctx, "Could not get source topology", zap.Error(err))
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get source topology")
		return
	}

	targetTopology, err := router.storeClient.GetTopologyByIDs(ctx, "TargetID", []string{id})
	if err != nil {
		log.Error(ctx, "Could not get target topology", zap.Error(err))
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		errresponse.Render(w, r, err, http.StatusInternalServerError, "Could not get target topology")
		return
	}

	var topology []shared.Topology
	for _, t := range sourceTopology {
		topology = appendTopologyIfMissing(topology, t)
	}
	for _, t := range targetTopology {
		topology = appendTopologyIfMissing(topology, t)
	}

	topologyGraph := createTopologyGraph(topology)
	render.JSON(w, r, topologyGraph)
}
