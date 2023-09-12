package main

import (
	"github.com/ford-sandbox/bigwig/api/server"
)

func main() {

	resolver, err := server.InitializeDBAndCreateResolver()

	if err != nil {
		panic(err)
	}

	err = server.StartServer(resolver)

	if err != nil {
		panic(err)
	}
}
