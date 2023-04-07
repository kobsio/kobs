package shared

import (
	"fmt"
	"regexp"
	"strings"

	"sigs.k8s.io/yaml"
)

var (
	slugifyRe = regexp.MustCompile("[^a-z0-9]+")
)

// Index is the structure of the index file required in the root directory for each TechDoc.
type Index struct {
	Key         string           `json:"key"`
	Name        string           `json:"name"`
	Description string           `json:"description"`
	Home        string           `json:"home"`
	TOC         []map[string]any `json:"toc"`
}

// Markdown is the structure for returning a markdown file.
type Markdown struct {
	Markdown string `json:"markdown"`
	TOC      string `json:"toc"`
}

// ParseIndex parses the given content into the index structure.
func ParseIndex(content []byte) (Index, error) {
	index := Index{}
	if err := yaml.Unmarshal(content, &index); err != nil {
		return index, err
	}

	return index, nil
}

// GenerateTOC generates a simple markdown list, which can be used as TOC for the given markdown file.
func GenerateTOC(markdown string) string {
	var toc string
	var isCodeBlock bool

	for _, line := range strings.Split(markdown, "\n") {
		line = strings.TrimSpace(line)

		// We check if the line starts with ``` for a comment block. If this is the case we are setting the isCodeBlock
		// variable to true and when the code block ends to false. This is required so that we do not add a comment from
		// a code block to the table of contents.
		if strings.HasPrefix(line, "```") {
			isCodeBlock = !isCodeBlock
		}

		if !isCodeBlock {
			if len(line) > 7 && line[0:7] == "###### " {
				toc += fmt.Sprintf("        - [%s](#%s)\n", strings.Trim(line, "###### "), slugifyRe.ReplaceAllString(strings.ToLower(strings.Trim(line, "###### ")), "-"))
			} else if len(line) > 6 && line[0:6] == "##### " {
				toc += fmt.Sprintf("      - [%s](#%s)\n", strings.Trim(line, "##### "), slugifyRe.ReplaceAllString(strings.ToLower(strings.Trim(line, "##### ")), "-"))
			} else if len(line) > 5 && line[0:5] == "#### " {
				toc += fmt.Sprintf("    - [%s](#%s)\n", strings.Trim(line, "#### "), slugifyRe.ReplaceAllString(strings.ToLower(strings.Trim(line, "#### ")), "-"))
			} else if len(line) > 4 && line[0:4] == "### " {
				toc += fmt.Sprintf("  - [%s](#%s)\n", strings.Trim(line, "### "), slugifyRe.ReplaceAllString(strings.ToLower(strings.Trim(line, "### ")), "-"))
			} else if len(line) > 3 && line[0:3] == "## " {
				toc += fmt.Sprintf("- [%s](#%s)\n", strings.Trim(line, "## "), slugifyRe.ReplaceAllString(strings.ToLower(strings.Trim(line, "## ")), "-"))
			}
		}
	}

	return toc
}
