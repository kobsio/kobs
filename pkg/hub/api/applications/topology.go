package applications

import (
	"fmt"
	"net/http"
	"strconv"

	applicationv1 "github.com/kobsio/kobs/pkg/cluster/kubernetes/apis/application/v1"
	authContext "github.com/kobsio/kobs/pkg/hub/auth/context"
	"github.com/kobsio/kobs/pkg/hub/db"
	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/utils/middleware/errresponse"

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

func createTopologyGraph(topology []db.Topology) Topology {
	var edges []Edge
	var nodes []Node

	for _, t := range topology {
		edges = append(edges, Edge{
			Data: EdgeData{
				ID:              t.ID,
				Source:          t.SourceID,
				SourceCluster:   t.SourceCluster,
				SourceNamespace: t.SourceNamespace,
				SourceName:      t.SourceName,
				Target:          t.TargetID,
				TargetCluster:   t.TargetCluster,
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
				Cluster:   t.SourceCluster,
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
				Cluster:   t.TargetCluster,
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
func appendTopologyIfMissing(items []db.Topology, item db.Topology) []db.Topology {
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

	user := authContext.MustGetUser(ctx)
	teams := user.Teams
	all := r.URL.Query().Get("all")
	clusters := r.URL.Query()["cluster"]
	namespaces := r.URL.Query()["namespace"]
	tags := r.URL.Query()["tag"]
	searchTerm := r.URL.Query().Get("searchTerm")
	external := r.URL.Query().Get("external")

	span.SetAttributes(attribute.Key("teams").StringSlice(teams))
	span.SetAttributes(attribute.Key("all").String(all))
	span.SetAttributes(attribute.Key("clusters").StringSlice(clusters))
	span.SetAttributes(attribute.Key("namespaces").StringSlice(namespaces))
	span.SetAttributes(attribute.Key("tags").StringSlice(tags))
	span.SetAttributes(attribute.Key("searchTerm").String(searchTerm))
	span.SetAttributes(attribute.Key("external").String(external))

	// Check if the user requested to see all applications, if this is the case we have to check if he is alowed to do
	// so. If a team isn't part of any teams "user.Teams" is "nil" we handle it the same ways as he wants to see all
	// applications.
	parsedAll, _ := strconv.ParseBool(all)
	if parsedAll || teams == nil {
		if !user.HasApplicationAccess(&applicationv1.ApplicationSpec{}) {
			log.Warn(ctx, "The user is not authorized to view all applications")
			span.RecordError(fmt.Errorf("user is not authorized to view all applications"))
			span.SetStatus(codes.Error, "user is not authorized to view all applications")
			errresponse.Render(w, r, http.StatusForbidden, "You are not allowed to view all applications")
			return
		}

		teams = nil
	}

	applications, err := router.dbClient.GetApplicationsByFilter(ctx, teams, clusters, namespaces, tags, searchTerm, external, 0, 0)
	if err != nil {
		log.Error(ctx, "Failed to get applications", zap.Error(err))
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get applications")
		return
	}

	var applicationIDs []string
	for _, application := range applications {
		applicationIDs = append(applicationIDs, application.ID)
	}

	sourceTopology, err := router.dbClient.GetTopologyByIDs(ctx, "sourceID", applicationIDs)
	if err != nil {
		log.Error(ctx, "Failed to get source topology", zap.Error(err))
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get source topology")
		return
	}

	targetTopology, err := router.dbClient.GetTopologyByIDs(ctx, "targetID", applicationIDs)
	if err != nil {
		log.Error(ctx, "Failed to get target topology", zap.Error(err))
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get target topology")
		return
	}

	var topology []db.Topology
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

	user := authContext.MustGetUser(ctx)
	id := r.URL.Query().Get("id")

	span.SetAttributes(attribute.Key("id").String(id))

	application, err := router.dbClient.GetApplicationByID(ctx, id)
	if err != nil {
		log.Error(ctx, "Failed to get application", zap.Error(err), zap.String("id", id))
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get application")
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return
	}

	if application == nil {
		log.Error(ctx, "Application was not found", zap.Error(err), zap.String("id", id))
		span.RecordError(fmt.Errorf("application was not found"))
		span.SetStatus(codes.Error, "application was not found")
		errresponse.Render(w, r, http.StatusNotFound, "Application was not found")
		return
	}

	if !user.HasApplicationAccess(application) {
		log.Warn(ctx, "The user is not authorized to view the application", zap.String("id", id))
		span.RecordError(fmt.Errorf("user is not authorized to view the application"))
		span.SetStatus(codes.Error, "user is not authorized to view the application")
		errresponse.Render(w, r, http.StatusForbidden, "You are not allowed to view the application")
		return
	}

	sourceTopology, err := router.dbClient.GetTopologyByIDs(ctx, "sourceID", []string{id})
	if err != nil {
		log.Error(ctx, "Failed to get source topology", zap.Error(err))
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get source topology")
		return
	}

	targetTopology, err := router.dbClient.GetTopologyByIDs(ctx, "targetID", []string{id})
	if err != nil {
		log.Error(ctx, "Failed to get target topology", zap.Error(err))
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		errresponse.Render(w, r, http.StatusInternalServerError, "Failed to get target topology")
		return
	}

	var topology []db.Topology
	for _, t := range sourceTopology {
		topology = appendTopologyIfMissing(topology, t)
	}
	for _, t := range targetTopology {
		topology = appendTopologyIfMissing(topology, t)
	}

	topologyGraph := createTopologyGraph(topology)
	render.JSON(w, r, topologyGraph)
}
