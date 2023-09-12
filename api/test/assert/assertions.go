package assert

import (
	"fmt"
	"slices"
	"testing"
)

func Equals[T comparable](t *testing.T, expected T, actual T, testingFor string) {
	if expected != actual {
		t.Errorf("%s failed: expected %v, actual %v", testingFor, expected, actual)
	}
}

func SliceEquals[T comparable](t *testing.T, expected []T, actual []T, testingFor string) {
	if !slices.Equal(expected, actual) {
		t.Errorf("%s failed: expected %v, actual %v", testingFor, expected, actual)
	}
}

func Error(t *testing.T, err error, testingFor string) {
	if err == nil {
		t.Errorf("%s: Expected error but did not get one", testingFor)
	}
}

func NoError(t *testing.T, err error, testingFor string) {
	if err != nil {
		fmt.Println(err)
		t.Errorf("%s: expected no error", testingFor)
	}
}

func Size[T any](t *testing.T, expected int, actual []T, testingFor string) {
	if len(actual) != expected {
		t.Errorf("%s failed: expected size %v, actual size %v", testingFor, expected, len(actual))
	}
}
