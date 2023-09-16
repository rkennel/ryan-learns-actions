package main

func main() {

	resolver, err := InitializeDBAndCreateResolver()

	if err != nil {
		panic(err)
	}

	err = StartServer(resolver)

	if err != nil {
		panic(err)
	}
}
