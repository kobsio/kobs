package parser

import (
	"fmt"
	"testing"

	"github.com/alecthomas/participle/v2/lexer"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestLexer(t *testing.T) {
	type token struct {
		sym  string
		name string
	}

	getTokens := func(t *testing.T, query string) []token {
		consumer, err := lex.LexString("", query)
		require.NoError(t, err)

		tokens := make([]token, 0)
		for {
			n, err := consumer.Next()
			require.NoError(t, err)

			item := struct {
				sym  string
				name string
			}{
				name: n.String(),
			}
			for k, v := range lex.Symbols() {
				if n.Type == v {
					item.sym = k
				}
			}
			tokens = append(tokens, item)
			if n.Type == lexer.EOF {
				break
			}
		}

		return tokens
	}

	t.Run("basic query", func(t *testing.T) {
		tokens := getTokens(t, "namespace='bookinfo' _AND_ foo=1")
		assert.ElementsMatch(t, []token{
			{
				"Ident", "namespace",
			},
			{
				"Operators", "=",
			},
			{
				"String", "'bookinfo'",
			},
			{
				"Keyword", "_AND_",
			},
			{
				"Ident", "foo",
			},
			{
				"Operators", "=",
			},
			{
				"Number", "1",
			},
			{
				"EOF", "<EOF>",
			},
		}, tokens)
	})

	t.Run("exotic tokens", func(t *testing.T) {
		tokens := getTokens(t, "kubernetes_label_foo_bar = '\\%hellow\\%world\\%'")

		assert.ElementsMatch(t, []token{
			{
				"Ident", "kubernetes_label_foo_bar",
			},
			{
				"Operators", "=",
			},
			{
				"String", "'\\%hellow\\%world\\%'",
			},
			{
				"EOF", "<EOF>",
			},
		}, tokens)
	})
}

func TestParser(t *testing.T) {
	defaultParser := SQLParser{
		defaultFields: []string{"namespace", "content", "a"},
	}
	t.Run("AND", func(t *testing.T) {
		result, err := defaultParser.Parse("namespace='bookinfo' _AND_ content='1'")
		require.NoError(t, err)
		require.Equal(t, "namespace = 'bookinfo' AND content = '1'", result)
	})

	t.Run("OR", func(t *testing.T) {
		result, err := defaultParser.Parse("namespace='bookinfo' _or_ content='3'")
		require.NoError(t, err)
		require.Equal(t, "namespace = 'bookinfo' OR content = '3'", result)
	})

	t.Run("NOT", func(t *testing.T) {
		result, err := defaultParser.Parse("_NOT_ namespace='bookinfo'")
		require.NoError(t, err)
		require.Equal(t, "NOT ( namespace = 'bookinfo' )", result)
	})

	t.Run("NOT after AND", func(t *testing.T) {
		result, err := defaultParser.Parse("namespace ~ 'foo' _AND_ _NOT_ namespace='bookinfo'")
		require.NoError(t, err)
		require.Equal(t, "match(namespace, 'foo') AND NOT ( namespace = 'bookinfo' )", result)
	})

	t.Run("EXISTS", func(t *testing.T) {
		result, err := defaultParser.Parse("_EXISTS_ namespace")
		require.NoError(t, err)
		require.Equal(t, "namespace IS NOT NULL", result)
	})

	t.Run("EXISTS (with map-like column)", func(t *testing.T) {
		parser := SQLParser{}
		result, err := parser.Parse("_EXISTS_ foo")
		require.NoError(t, err)
		require.Equal(t, "(mapContains(fields_string, 'foo') = 1 OR mapContains(fields_number, 'foo') = 1)", result)
	})

	// OPs
	for _, tt := range []struct {
		name  string
		query string
		want  string
	}{
		{
			name:  "EQUAL",
			query: "a='b'",
			want:  "a = 'b'",
		},
		{
			name:  "NOTEQUAL",
			query: "a!='b'",
			want:  "a != 'b'",
		},
		{
			name:  "GREATER",
			query: "a>'b'",
			want:  "a > 'b'",
		},
		{
			name:  "GREATER_OR_EQUAL",
			query: "a>='b'",
			want:  "a >= 'b'",
		},
		{
			name:  "SMALLER",
			query: "a<'b'",
			want:  "a < 'b'",
		},
		{
			name:  "SMALLER_OR_EQUAL",
			query: "a<='b'",
			want:  "a <= 'b'",
		},
		{
			name:  "ILIKE",
			query: "a=~'b'",
			want:  "a ILIKE 'b'",
		},
		{
			name:  "NOT_ILIKE",
			query: "a!~'b'",
			want:  "a NOT ILIKE 'b'",
		},
		{
			name:  "REQEXP",
			query: "a~'b'",
			want:  "match(a, 'b')",
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			result, err := defaultParser.Parse(tt.query)
			require.NoError(t, err)
			require.Equalf(t, tt.want, result, "OP [%s] failed, got \"%s\", but wanted \"%s\"", tt.name, result, tt.want)
		})
	}

	t.Run("with defaultFields", func(t *testing.T) {
		sqlParser := SQLParser{
			defaultFields: []string{"namespace"},
		}
		result, err := sqlParser.Parse("namespace='bookinfo'")
		require.NoError(t, err)
		require.Equal(t, "namespace = 'bookinfo'", result)
	})

	t.Run("with materializedColumns", func(t *testing.T) {
		sqlParser := SQLParser{
			materializedColumns: []string{"namespace"},
		}
		result, err := sqlParser.Parse("namespace='bookinfo'")
		require.NoError(t, err)
		require.Equal(t, "namespace = 'bookinfo'", result)
	})

	t.Run("with string field", func(t *testing.T) {
		parser := SQLParser{}
		result, err := parser.Parse("namespace='bookinfo'")
		require.NoError(t, err)
		require.Equal(t, "fields_string['namespace'] = 'bookinfo'", result)
	})

	t.Run("with number (int)", func(t *testing.T) {
		parser := SQLParser{}
		result, err := parser.Parse("mynum=123")
		require.NoError(t, err)
		require.Equal(t, "fields_number['mynum'] = 123", result)
	})

	t.Run("with number (float)", func(t *testing.T) {
		parser := SQLParser{}
		result, err := parser.Parse("mynum=1.23")
		require.NoError(t, err)
		require.Equal(t, "fields_number['mynum'] = 1.23", result)
	})

	t.Run("with parsing errors", func(t *testing.T) {
		_, err := defaultParser.Parse("namespace = 'hello' _ant_ content_level='ERROR'")
		require.Error(t, err)
		require.Contains(t, err.Error(), "Failed to parse query:")
	})

	t.Run("comparing columns with each other isn't supported", func(t *testing.T) {
		parser := SQLParser{
			defaultFields: []string{"namespace", "container_name"},
		}
		_, err := parser.Parse("namespace = container_name")
		require.Error(t, err)
		require.Len(t, parser.errors, 1)
		require.Equal(t, "unsupported query, comparing two symbols isn't supported: namespace = container_name", parser.errors[0].Error())
	})

	t.Run("handles lowercase _not_", func(t *testing.T) {
		_, err := defaultParser.Parse("namespace='brain' _and_ app='brain' _and_ container_name='brain' _and_ _NOT_ content_level='debug' _and_ _not_ content_level='info' _and_ _not_ content_level='warn'")
		require.NoError(t, err)
	})

	t.Run("should handle brackets", func(t *testing.T) {
		sqlParser := SQLParser{
			defaultFields: []string{"namespace"},
		}
		result, err := sqlParser.Parse("namespace='foo' _OR_ (namespace=~'a' _AND_ namespace=~'b')")
		require.NoError(t, err)
		require.Equal(t, "namespace = 'foo' OR ( namespace ILIKE 'a' AND namespace ILIKE 'b' )", result)
	})
}

func TestParserMoreExamples(t *testing.T) {
	for _, tt := range []struct {
		query     string
		where     string
		isInvalid bool
	}{
		{
			query:     "cluster = 'foo' _and_ namespace = 'bar'",
			where:     "cluster = 'foo' AND namespace = 'bar'",
			isInvalid: false,
		},
		{
			query:     "cluster = 'foo' _and_ (namespace='hello' _or_ namespace='world')",
			where:     "cluster = 'foo' AND ( namespace = 'hello' OR namespace = 'world' )",
			isInvalid: false,
		},
		{
			query:     "kubernetes_label_foo = 'bar'",
			where:     "fields_string['kubernetes_label_foo'] = 'bar'",
			isInvalid: false,
		},
		{
			query:     "kubernetes_label_foo_bar =~ '\\%hellow\\%world\\%'",
			where:     "fields_string['kubernetes_label_foo_bar'] ILIKE '\\%hellow\\%world\\%'",
			isInvalid: false,
		},
		{
			query:     "kubernetes_label_foo_bar ~ 'hello.*'",
			where:     "match(fields_string['kubernetes_label_foo_bar'], 'hello.*')",
			isInvalid: false,
		},
		{
			query:     "kubernetes_label_foo_bar / 'hello.*'",
			isInvalid: true,
		},
	} {
		t.Run(tt.query, func(t *testing.T) {
			parser := NewSQLParser([]string{"namespace", "cluster"}, nil)
			result, err := parser.Parse(tt.query)
			if tt.isInvalid {
				require.Error(t, err)
			} else {
				require.NoError(t, err)
				require.Equal(t, tt.where, result)
			}
		})
	}
}

func TestHandleConditionParts(t *testing.T) {
	parser := SQLParser{
		defaultFields: []string{"namespace", "cluster"},
	}

	for _, tt := range []struct {
		key      string
		value    string
		operator string
		want     string
	}{
		{
			key:      "cluster",
			value:    "'foobar'",
			operator: "=~",
			want:     "cluster ILIKE 'foobar'",
		},
		{
			key:      "cluster",
			value:    "'foobar'",
			operator: "!~",
			want:     "cluster NOT ILIKE 'foobar'",
		},
		{
			key:      "cluster",
			value:    "'foobar'",
			operator: "~",
			want:     "match(cluster, 'foobar')",
		},
		{
			key:      "cluster",
			value:    "'foobar'",
			operator: "=",
			want:     "cluster = 'foobar'",
		},
		{
			key:      "helloworld",
			value:    "'foobar'",
			operator: "=~",
			want:     "fields_string['helloworld'] ILIKE 'foobar'",
		},
		{
			key:      "helloworld",
			value:    "'foobar'",
			operator: "!~",
			want:     "fields_string['helloworld'] NOT ILIKE 'foobar'",
		},
		{
			key:      "helloworld",
			value:    "'foobar'",
			operator: "~",
			want:     "match(fields_string['helloworld'], 'foobar')",
		},
		{
			key:      "helloworld",
			value:    "'foobar'",
			operator: "=",
			want:     "fields_string['helloworld'] = 'foobar'",
		},
		{
			key:      "helloworld",
			value:    "42",
			operator: "=~",
			want:     "fields_number['helloworld'] ILIKE 42",
		},
		{
			key:      "helloworld",
			value:    "42",
			operator: "!~",
			want:     "fields_number['helloworld'] NOT ILIKE 42",
		},
		{
			key:      "helloworld",
			value:    "42",
			operator: "~",
			want:     "match(fields_number['helloworld'], 42)",
		},
		{
			key:      "helloworld",
			value:    "42",
			operator: "=",
			want:     "fields_number['helloworld'] = 42",
		},
	} {
		t.Run(tt.key, func(t *testing.T) {
			query := fmt.Sprintf("%s %s %s", tt.key, tt.operator, tt.value)
			actualCondition, _ := parser.Parse(query)
			require.Equal(t, tt.want, actualCondition)
		})
	}
}
