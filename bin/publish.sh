#!/bin/sh


BIN_DIR=`dirname $0`
. "${BIN_DIR}/common.sh"
setup


echo "Frontend"
echo "========"
cd "${PROJECT_ROOT}"
npm publish
