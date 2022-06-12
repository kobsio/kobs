package instance

type NodeData struct {
	ID      string            `json:"id"`
	Metrics map[string]string `json:"metrics"`
}

type Node struct {
	Data NodeData `json:"data"`
}

type Edge struct {
	Data EdgeData `json:"data"`
}

type EdgeData struct {
	ID     string `json:"id"`
	Source string `json:"source"`
	Target string `json:"target"`
}
