#!/bin/sh


BIN_DIR=`dirname $0`
. "${BIN_DIR}/common.sh"
setup


echo "Svelte Base"
echo "==========="
cd "${PROJECT_ROOT}"
npm run build
