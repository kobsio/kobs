package satellites

import (
	"github.com/kobsio/kobs/pkg/hub/satellites/satellite"
)

type Config []satellite.Config

type Client interface {
	GetSatellites() []satellite.Client
	GetSatellite(name string) satellite.Client
}

type client struct {
	satellites []satellite.Client
}

func (c *client) GetSatellites() []satellite.Client {
	return c.satellites
}

func (c *client) GetSatellite(name string) satellite.Client {
	for _, satellite := range c.satellites {
		if satellite.GetName() == name {
			return satellite
		}
	}

	return nil
}

func NewClient(config Config) (Client, error) {
	var satellites []satellite.Client

	for _, satelliteConfig := range config {
		satelliteClient, err := satellite.NewClient(satelliteConfig)
		if err != nil {
			return nil, err
		}

		satellites = append(satellites, satelliteClient)
	}

	return &client{
		satellites: satellites,
	}, nil
}
