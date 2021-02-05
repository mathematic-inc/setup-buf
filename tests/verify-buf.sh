#!/bin/sh

if [ -z "$1" ]; then
  echo "Must supply buf version argument"
  exit 1
fi

buf_version=$(buf --version)
echo "Found buf version $buf_version"
if [ -z "$(echo $buf_version | grep $1)" ]; then
  echo "Unexpected version"
  exit 1
fi