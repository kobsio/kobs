package main

import (
	"github.com/kobsio/kobs/cmd/kobs/client"
	"github.com/kobsio/kobs/cmd/kobs/hub"
	"github.com/kobsio/kobs/cmd/kobs/version"
	"github.com/kobsio/kobs/cmd/kobs/watcher"
	"github.com/kobsio/kobs/pkg/plugins"

	"github.com/alecthomas/kong"
	"github.com/joho/godotenv"
)

var cli struct {
	Hub     hub.Cmd     `cmd:"hub" help:"Start the hub."`
	Watcher watcher.Cmd `cmd:"watcher" help:"Start the watcher."`
	Client  client.Cmd  `cmd:"client" help:"Start the client."`
	Version version.Cmd `cmd:"version" help:"Show version information."`
}

func main() {
	godotenv.Load()
	ctx := kong.Parse(&cli)

	registeredPlugins := []plugins.Plugin{}

	err := ctx.Run(registeredPlugins)
	ctx.FatalIfErrorf(err)
}
