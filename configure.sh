#!/usr/bin/env bash

mkdir -p ~/.npm-local
echo "prefix = ~/.npm-local" | tee ~/.npmrc
chmod 0600 ~/.npmrc
