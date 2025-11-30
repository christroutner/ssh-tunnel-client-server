#!/bin/bash

# Remove all untagged docker images (dangling images).
# Using Docker's built-in filter for dangling images
dangling_images=$(docker images --filter "dangling=true" -q)

if [ -z "$dangling_images" ]; then
    echo "No dangling images found."
    exit 0
fi

docker rmi $dangling_images

