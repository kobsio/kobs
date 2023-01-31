package copy

import (
	"io"
	"mime/multipart"
	"net/http"
	"net/url"
	"os"

	"github.com/kobsio/kobs/pkg/instrument/log"

	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/remotecommand"
)

// FileFromPod let a user download a file from a container.
func FileFromPod(w http.ResponseWriter, config *rest.Config, reqURL *url.URL) error {
	reader, outStream := io.Pipe()

	exec, err := remotecommand.NewSPDYExecutor(config, "POST", reqURL)
	if err != nil {
		return err
	}

	go func() {
		defer outStream.Close()
		err = exec.Stream(remotecommand.StreamOptions{
			Stdin:  os.Stdin,
			Stdout: outStream,
			Stderr: os.Stderr,
			Tty:    false,
		})
		if err != nil {
			log.Error(nil, "Could not copy file from pod")
		}
	}()

	if _, err := io.Copy(w, reader); err != nil {
		return err
	}

	return nil
}

// FileToPod let a user upload a file to a container.
func FileToPod(config *rest.Config, reqURL *url.URL, srcFile multipart.File, destPath string) error {
	reader, writer := io.Pipe()

	go func() {
		defer writer.Close()
		io.Copy(writer, srcFile)
	}()

	exec, err := remotecommand.NewSPDYExecutor(config, "POST", reqURL)
	if err != nil {
		return err
	}

	err = exec.Stream(remotecommand.StreamOptions{
		Stdin:  reader,
		Stdout: os.Stdout,
		Stderr: os.Stderr,
		Tty:    false,
	})
	if err != nil {
		return err
	}

	return nil
}
