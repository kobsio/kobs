package version

import (
	"fmt"
	"os"

	"github.com/kobsio/kobs/pkg/log"
	"github.com/kobsio/kobs/pkg/version"

	"github.com/spf13/cobra"
	"go.uber.org/zap"
)

// Command returns the cobra command for the "version" command. This command can be used to print the version
// information, like the version, revision and branch for the builded binary.
func Command() *cobra.Command {
	return &cobra.Command{
		Use:   "version",
		Short: "Version information about kobs.",
		Long:  "Version information about kobs.",
		Run: func(cmd *cobra.Command, args []string) {
			// Get our global flags for kobs and use them to setup our logging configuration. After our logging is
			// configured we print the version information and build context of kobs.
			logLevel, _ := cmd.Flags().GetString("log.level")
			logFormat, _ := cmd.Flags().GetString("log.format")
			log.Setup(logLevel, logFormat)

			v, err := version.Print("kobs")
			if err != nil {
				log.Fatal(nil, "Failed to print version information", zap.Error(err))
			}

			fmt.Fprintln(os.Stdout, v)
		},
	}
}
