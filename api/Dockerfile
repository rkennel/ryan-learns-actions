# Use the official Golang base image for the build stage
FROM golang:1.21.1-alpine3.18 as BUILD

# Copy API code from the current context into the "api" directory in the container
RUN mkdir -p /api
WORKDIR /api
COPY . .

# Download and install any required third-party dependencies into the container
RUN go mod download

# Build the Go application
RUN go build -o ./bigwig-api

# Set executable permission
RUN chmod +x ./bigwig-api

# Switch to a minimal alpine-based image for the final stage
FROM alpine:3.18.3

# Set the working directory in the alpine container
WORKDIR /api

# Copy the built Go application from the BUILD stage into the alpine container
COPY --from=BUILD /api/bigwig-api .

# Expose a port (if your Go app listens on a specific port)
EXPOSE 8080

# Define the command to run your application
CMD ["/api/bigwig-api"]