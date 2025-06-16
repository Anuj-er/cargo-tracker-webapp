#!/bin/bash

echo "Deploying Shipment Tracker Web Application with Docker..."

# Check if .env file exists
if [ ! -f .env ]; then
  echo "Error: .env file is missing. Please create it with your environment variables."
  echo "It should contain REACT_APP_API_URL and REACT_APP_MAPBOX_TOKEN."
  exit 1
fi

# Build and start containers
docker-compose up -d --build

echo "Shipment Tracker Web Application is now running."
echo "Visit http://localhost to access the application." 