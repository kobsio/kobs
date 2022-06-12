package worker

import (
	"testing"
	"time"

	"github.com/stretchr/testify/require"
)

type testTask func()

func (r testTask) Do() {
	r()
}

func TestNewPool(t *testing.T) {
	_, err := NewPool(0)
	require.Error(t, err)

	wp, err := NewPool(1)
	require.NoError(t, err)
	require.NotEmpty(t, wp)
}

func TestRunTask(t *testing.T) {
	wp, _ := NewPool(1)
	testRunTask := func() {
		wp.RunTask(testTask(func() {
			return
		}))
	}

	require.NotPanics(t, testRunTask)
}

func TestStop(t *testing.T) {
	wp, _ := NewPool(5)
	go wp.RunTask(testTask(func() {
		time.Sleep(3 * time.Second)
		t.Log("task 1")
	}))
	go wp.RunTask(testTask(func() {
		time.Sleep(3 * time.Second)
		t.Log("task 2")
	}))
	go wp.RunTask(testTask(func() {
		time.Sleep(3 * time.Second)
		t.Log("task 3")
	}))

	time.Sleep(1 * time.Second)

	err := wp.Stop()
	require.NoError(t, err)

	err = wp.Stop()
	require.Error(t, err)
}
