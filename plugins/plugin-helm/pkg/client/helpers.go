package client

import (
	"bytes"
	"compress/gzip"
	"encoding/base64"
	"encoding/json"
	"io"
)

// secretDataToRelease converts the secret data from the "release" key to an actual Helm release. For this we have to
// decode the base64 encoded secret data and the uncrompress it using the "decompress" function.
func secretDataToRelease(clusterName string, secretData []byte) (*Release, error) {
	releaseData, err := base64.StdEncoding.DecodeString(string(secretData))
	if err != nil {
		return nil, err
	}

	releaseDataUnzipped, err := decompress(releaseData)
	if err != nil {
		return nil, err
	}

	var release Release
	err = json.Unmarshal(releaseDataUnzipped, &release)
	if err != nil {
		return nil, err
	}

	release.Cluster = clusterName
	return &release, nil
}

// decompress is used to unzip the gzipped release data for a Helm release.
func decompress(data []byte) ([]byte, error) {
	b := bytes.NewBuffer(data)

	var r io.Reader
	r, err := gzip.NewReader(b)
	if err != nil {
		return nil, err
	}

	var res bytes.Buffer
	_, err = res.ReadFrom(r)
	if err != nil {
		return nil, err
	}

	return res.Bytes(), nil
}
