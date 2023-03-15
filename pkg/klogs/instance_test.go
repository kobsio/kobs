package klogs

import (
	"context"
	"testing"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/require"
)

func TestGetFields(t *testing.T) {
	t.Run("should be able to fetch cached fields", func(t *testing.T) {
		instance := instance{
			cachedFields: Fields{
				Number: []string{"cached_number_field", "searchable_field"},
				String: []string{"cached_string_field", "searchable_field"},
			},
		}

		require.Equal(t, []string{"cached_string_field", "searchable_field"}, instance.GetFields("", "string"))
		require.Equal(t, []string{"cached_number_field", "searchable_field"}, instance.GetFields("", "number"))
		require.Equal(t, []string{"searchable_field"}, instance.GetFields("search", "string"))
		require.Equal(t, []string{"searchable_field"}, instance.GetFields("search", "number"))
	})
}

func Test_getFields(t *testing.T) {
	t.Run("should be able to refresh cached fields", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		querier := NewMockQuerier(ctrl)
		instance := instance{
			querier: querier,
		}

		rowsString := NewMockRows(ctrl)
		rowsString.EXPECT().Close().Return(nil)
		rowsString.EXPECT().Next().Return(true)
		rowsString.EXPECT().Scan(gomock.Any()).DoAndReturn(func(values ...any) error {
			field := values[0].(*string)
			*field = "string"
			return nil
		})
		rowsString.EXPECT().Next().Return(false)
		rowsString.EXPECT().Err().Return(nil)

		rowsNumber := NewMockRows(ctrl)
		rowsNumber.EXPECT().Close().Return(nil)
		rowsNumber.EXPECT().Next().Return(true)
		rowsNumber.EXPECT().Scan(gomock.Any()).DoAndReturn(func(values ...any) error {
			field := values[0].(*string)
			*field = "number"
			return nil
		})
		rowsNumber.EXPECT().Next().Return(false)
		rowsNumber.EXPECT().Err().Return(nil)

		querier.EXPECT().QueryContext(gomock.Any(), gomock.Any()).Return(rowsString, nil)
		querier.EXPECT().QueryContext(gomock.Any(), gomock.Any()).Return(rowsNumber, nil)

		fields, err := instance.getFields(context.Background())
		require.NoError(t, err)
		require.Equal(t, Fields{
			Number: []string{"number"},
			String: []string{"string"},
		}, fields)

	})
}
