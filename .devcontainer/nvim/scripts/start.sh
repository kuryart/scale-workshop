#!/bin/sh

parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )

cd "$parent_path"
docker-compose -f $(pwd)/../docker-compose.yaml up -d --build --force-recreate
kitty --detach --session $(pwd)/../sessions/kitty-session.kitty
exit
