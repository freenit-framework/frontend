#!/bin/sh


BIN_DIR=`dirname $0`
PROJECT_ROOT="${BIN_DIR}/.."
. "${BIN_DIR}/common.sh"
setup

cd "${PROJECT_ROOT}"
"${PACKAGE_MANAGER}" publish
