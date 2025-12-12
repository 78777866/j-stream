#!/usr/bin/env bash
export NODE_OPTIONS="--require /tmp/next-eslint-compat.cjs"
exec "$@"
