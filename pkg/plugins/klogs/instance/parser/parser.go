package parser

import (
	"fmt"
	"strings"

	"github.com/kobsio/kobs/pkg/utils"

	"github.com/alecthomas/participle/v2"
	"github.com/alecthomas/participle/v2/lexer"
)

// Grammar
type Expression struct {
	Lhs     *Predicate  `parser:"@@"`
	Keyword string      `parser:"@Keyword?"`
	Rhs     *Expression `parser:"@@?"`
}

type Predicate struct {
	Lhs           Value       `parser:"@@"`
	Op            string      `parser:"@Operators"`
	Rhs           Value       `parser:"@@"`
	Not           *Predicate  `parser:"| \"_NOT_\" @@"`
	Exists        *string     `parser:"| (\"_EXISTS_\"|\"_exists_\") @Ident"`
	Subexpression *Expression `parser:"| \"(\" @@ \")\""`
}

type Value struct {
	Symbol *string `parser:"	 @Ident"`
	Number *string `parser:"| @Number"`
	String *string `parser:"| @String"`
}

// Parser
var (
	lex = lexer.MustSimple([]lexer.SimpleRule{
		{Name: `Keyword`, Pattern: `_and_|_AND_|_or_|_OR_`},
		{Name: `Ident`, Pattern: `[a-zA-Z_][a-zA-Z0-9_\/]*`},
		{Name: `Number`, Pattern: `[-+]?\d*\.?\d+([eE][-+]?\d+)?`},
		{Name: `String`, Pattern: `\'(?:[^\']|\\.)*\'`},
		{Name: `Operators`, Pattern: `!=|<=|>=|=~|!~|[()=<>~]`},
		{Name: `whitespace`, Pattern: `\s+`},
	})
	P = participle.MustBuild[Expression](
		participle.Lexer(lex),
	)
)

type valueType int

const (
	valueTypeString valueType = iota
	valueTypeNumber
)

func quoted(v string) string {
	return fmt.Sprintf("'%s'", v)
}

func (s *SQLParser) parsePair(a, b Value) (string, string) {
	if a.Symbol != nil && b.Symbol != nil {
		s.errors = append(s.errors, fmt.Errorf("called parsePairs with two symbols, this should never happen"))
		return "", ""
	}

	// derive the valuetype from b, when a is a symbol
	if a.Symbol != nil {
		sym := *a.Symbol
		if b.Number != nil {
			return s.parseIdentifier(sym, valueTypeNumber), *b.Number
		}

		if b.String != nil {
			return s.parseIdentifier(sym, valueTypeString), *b.String
		}
	}

	// derive the valuetype from a, when b is a symbol
	if b.Symbol != nil {
		sym := *b.Symbol
		if a.Number != nil {
			return *a.Number, s.parseIdentifier(sym, valueTypeNumber)
		}

		if a.String != nil {
			return quoted(*a.String), s.parseIdentifier(sym, valueTypeString)
		}
	}

	s.errors = append(s.errors, fmt.Errorf("comparing constants with each other, skipping"))
	return "", ""
}

func (s *SQLParser) parseIdentifier(value string, vt valueType) string {
	if utils.Contains(s.defaultFields, value) || utils.Contains(s.materializedColumns, value) {
		return value
	}

	if vt == valueTypeString {
		return fmt.Sprintf("fields_string['%s']", value)
	}

	if vt == valueTypeNumber {
		return fmt.Sprintf("fields_number['%s']", value)
	}

	s.errors = append(s.errors, fmt.Errorf("unknown key %s", value))
	return ""
}

func parseOp(op string) func(lhs, rhs string) string {
	switch op {
	case "~":
		return func(lhs, rhs string) string { return fmt.Sprintf("match(%s, %s)", lhs, rhs) }
	case "=~":
		return func(lhs, rhs string) string { return fmt.Sprintf("%s ILIKE %s", lhs, rhs) }
	case "!~":
		return func(lhs, rhs string) string { return fmt.Sprintf("%s NOT ILIKE %s", lhs, rhs) }
	default:
		return func(lhs, rhs string) string { return fmt.Sprintf("%s %s %s", lhs, op, rhs) }
	}
}

func (s *SQLParser) parsePredicate(p *Predicate) string {
	if p.Subexpression != nil {
		return fmt.Sprintf("( %s )", s.parseExpr(p.Subexpression))
	}

	if p.Not != nil {
		return fmt.Sprintf("NOT ( %s )", s.parsePredicate(p.Not))
	}

	if p.Exists != nil {
		if utils.Contains(s.defaultFields, *p.Exists) || utils.Contains(s.materializedColumns, *p.Exists) {
			return fmt.Sprintf("%s IS NOT NULL", *p.Exists)
		}

		return fmt.Sprintf("(mapContains(fields_string, %s) = 1 OR mapContains(fields_number, %s) = 1)", quoted(*p.Exists), quoted(*p.Exists))
	}

	if p.Lhs.Symbol != nil && p.Rhs.Symbol != nil {
		s.errors = append(s.errors, fmt.Errorf("unsupported query, comparing two symbols isn't supported: %s %s %s", *p.Lhs.Symbol, p.Op, *p.Rhs.Symbol))
		return ""
	}
	lhs, rhs := s.parsePair(p.Lhs, p.Rhs)
	return parseOp(p.Op)(lhs, rhs)
}

func (s *SQLParser) parseExpr(expr *Expression) string {
	if expr == nil {
		return ""
	}

	parts := strings.Builder{}
	parts.WriteString(s.parsePredicate(expr.Lhs))

	switch keyword := strings.ToLower(expr.Keyword); keyword {
	case "_and_":
		parts.WriteString(" AND ")
	case "_or_":
		parts.WriteString(" OR ")
	}

	parts.WriteString(s.parseExpr(expr.Rhs))
	return parts.String()
}

type SQLParser struct {
	defaultFields       []string
	materializedColumns []string

	errors []error
}

func NewSQLParser(defaultFields, materializedColumns []string) SQLParser {
	return SQLParser{
		defaultFields:       defaultFields,
		materializedColumns: materializedColumns,
	}
}

func (s *SQLParser) Parse(query string) (string, error) {
	s.errors = nil
	expr, err := P.ParseString("", query)
	if err != nil {
		// This error is directly returned to the user, so that it should start with an uppercase letter.
		//nolint:staticcheck
		return "", fmt.Errorf("Failed to parse query: %w", err)
	}

	r := s.parseExpr(expr)
	if s.errors != nil {
		return r, fmt.Errorf("failed to convert query to SQL")
	}
	return r, nil
}
