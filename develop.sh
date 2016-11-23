#!/bin/bash
echo "Build flow-proxy image"
docker build -t flow-proxy .
echo "Run flow-proxy server"
docker run -it -v $(pwd):/usr/src/app --entrypoint ./entrypoint-dev.sh -p 8080:8080  flow-proxy
