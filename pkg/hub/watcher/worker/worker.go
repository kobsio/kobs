package worker

import (
	"fmt"
	"sync/atomic"
)

// Task is the interface which must be implemented by each task which should be added to the worker pool.
type Task interface {
	Do()
}

// Pool is the interface which must be implemented by our worker pool.
type Pool interface {
	RunTask(task Task)
	Stop() error
}

// pool represents the structure of our worker pool.
type pool struct {
	kill     chan bool
	stop     chan bool
	tasks    chan Task
	routines int64
}

// NewPool returns a new worker pool with the given number of goroutines. The returned pool can then be used to add task
// which are then processed by the worker pool.
func NewPool(minRoutines int64) (Pool, error) {
	if minRoutines <= 0 {
		return nil, fmt.Errorf("invalid minimum number of routines")
	}

	wp := pool{
		kill:  make(chan bool),
		stop:  make(chan bool),
		tasks: make(chan Task),
	}

	wp.waitStop()
	wp.add(minRoutines)

	return &wp, nil
}

// RunTask adds a new task to the worker pool.
func (wp *pool) RunTask(task Task) {
	wp.tasks <- task
}

// Stop stops the worker pool.
func (wp *pool) Stop() error {
	if atomic.LoadInt64(&wp.routines) != 0 {
		close(wp.stop)

		for {
			if atomic.LoadInt64(&wp.routines) == 0 {
				return nil
			}
		}
	}

	return fmt.Errorf("the worker pool has been already closed")
}

func (wp *pool) work() {
done:
	for {
		select {
		case t := <-wp.tasks:
			t.Do()
		case <-wp.kill:
			break done
		}
	}

	atomic.AddInt64(&wp.routines, -1)
}

// add adds a new go routine to the worker pool.
func (wp *pool) add(nums int64) {
	var i int64 = 1
	for ; i <= nums; i++ {
		wp.routines++
		go wp.work()
	}
}

func (wp *pool) waitStop() {
	go func() {
		for {
			<-wp.stop
			routines := int(atomic.LoadInt64(&wp.routines))
			for i := 0; i < routines; i++ {
				wp.kill <- true
			}
		}
	}()
}
