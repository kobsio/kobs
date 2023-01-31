package version

import (
	"fmt"
	"os"

	"github.com/kobsio/kobs/pkg/instrument/log"
	"github.com/kobsio/kobs/pkg/version"

	"go.uber.org/zap"
)

type Cmd struct{}

func (r *Cmd) Run() error {
	v, err := version.Print("kobs")
	if err != nil {
		log.Error(nil, "Failed to print version information", zap.Error(err))
		return err
	}

	fmt.Fprintln(os.Stdout, v)
	return nil
}
