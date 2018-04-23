#!/bin/sh

BIN_DIR=`dirname $0`
PROJECT_ROOT=`readlink -f "${BIN_DIR}/.."`
HOSTNAME=`hostname`
PORT=':5000'
SCHEME='http'


case $1 in
  start)
    ;;
  build)
    HOSTNAME='pyser.org'
    PORT=''
    SCHEME='https'
    ;;
  *)
    echo "Unknow directive $1" >&2
    echo "Usage: $0 <start|build>" >&2
    exit 1
    ;;
esac


cd ${PROJECT_ROOT}
echo "const BACKEND_URL = '${SCHEME}://${HOSTNAME}${PORT}'" >src/env.js
