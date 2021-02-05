#!/bin/sh

if [ -z "$1" ]; then
  echo "Must supply buf version argument"
  exit 1
fi

buf_version=$(buf --version 2>&1)

echo "Found Buf version '$buf_version'"
if [ -z "$(echo $buf_version | grep $1)" ]; then
  echo "Unexpected version"
  exit 1
fi