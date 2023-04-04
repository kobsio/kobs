package instance

import (
	"context"
	"fmt"
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

	t.Run("should handle database error", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		querier := NewMockQuerier(ctrl)
		instance := instance{
			querier: querier,
		}

		wantErr := fmt.Errorf("unexpected error in QueryContext")
		querier.EXPECT().QueryContext(gomock.Any(), gomock.Any()).Return(nil, wantErr)
		_, err := instance.getFields(context.Background())

		require.Error(t, err)
		require.ErrorIs(t, wantErr, err)
	})

	t.Run("should handle row scan error", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		querier := NewMockQuerier(ctrl)
		instance := instance{
			querier: querier,
		}

		row := NewMockRows(ctrl)
		row.EXPECT().Close().Return(nil)
		row.EXPECT().Next().Return(true)
		wantErr := fmt.Errorf("unexpected error in Scan")
		row.EXPECT().Scan(gomock.Any()).Return(wantErr)

		querier.EXPECT().QueryContext(gomock.Any(), gomock.Any()).Return(row, nil)
		_, err := instance.getFields(context.Background())

		require.Error(t, err)
		require.Equal(t, wantErr, err)
	})

	t.Run("should handle row.Err() error", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		querier := NewMockQuerier(ctrl)
		instance := instance{
			querier: querier,
		}

		row := NewMockRows(ctrl)
		row.EXPECT().Close().Return(nil)
		row.EXPECT().Next().Return(true)
		row.EXPECT().Scan(gomock.Any()).Return(nil)
		row.EXPECT().Next().Return(false)

		wantErr := fmt.Errorf("unexpected Error in row.Err()")
		row.EXPECT().Err().Return(wantErr)
		querier.EXPECT().QueryContext(gomock.Any(), gomock.Any()).Return(row, nil)
		_, err := instance.getFields(context.Background())

		require.Error(t, err)
		require.Equal(t, wantErr, err)
	})
}

func Test_GetName(t *testing.T) {
	i := &instance{name: "instance_name"}
	require.Equal(t, "instance_name", i.GetName())
}
