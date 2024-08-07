#!/bin/sh


parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$parent_path"

# Load only specific variables from the .env file
# export $(grep -E '^(PROJECT_NAME|ANOTHER_VARIABLE)=' .env | xargs)
export $(grep -E '^(PROJECT_NAME)=' ../.env | xargs)

# Replace variables in starship config file
envsubst '${PROJECT_NAME}' <../templates/starship.toml.template >../config/starship.toml
#envsubst '${PROJECT_NAME}' <../../.container/rust/starship/starship.toml.template >../../.container/rust/starship/starship.toml

# Replace variables in devcontainer config file
envsubst '${PROJECT_NAME}' <../templates/devcontainer.json.template >../devcontainer.json

# Replace variables in docker-compose file
envsubst '${PROJECT_NAME}' <../templates/docker-compose.yaml.template >../docker-compose.yaml
#envsubst '${PROJECT_NAME}' <../../.container/docker-compose.yaml.template >../../.container/docker-compose.yaml
