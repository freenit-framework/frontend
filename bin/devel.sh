#!/bin/sh


BIN_DIR=`dirname $0`
. "${BIN_DIR}/common.sh"
setup
export FRONTEND_URL="http://$(hostname):3001/"

echo "Frontend"
echo "========"
echo "URL = http://$(hostname):3000"
"${PACKAGE_MANAGER}" start
