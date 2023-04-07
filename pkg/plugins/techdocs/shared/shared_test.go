package shared

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestParseIndex(t *testing.T) {
	t.Run("should return index", func(t *testing.T) {
		index, err := ParseIndex([]byte(`key: test`))
		require.NoError(t, err)
		require.Equal(t, Index{Key: "test", Name: "", Description: "", Home: "", TOC: nil}, index)
	})

	t.Run("should return error for invalid index", func(t *testing.T) {
		_, err := ParseIndex([]byte(`key: [test]`))
		require.Error(t, err)
	})
}

func TestGenerateTOC(t *testing.T) {
	t.Run("should return toc", func(t *testing.T) {
		toc := GenerateTOC(`
# H1
## H2
### H3
#### H4
##### H5
###### H6

` + "```" + `
# Code Comment
` + "```" + `
		`)
		require.Equal(t, "- [H2](#h2)\n  - [H3](#h3)\n    - [H4](#h4)\n      - [H5](#h5)\n        - [H6](#h6)\n", toc)
	})
}
