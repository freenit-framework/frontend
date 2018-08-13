#!/bin/sh

BIN_DIR=`dirname $0`
PROJECT_ROOT=`readlink -f "${BIN_DIR}/.."`
if [ -e "${PROJECT_ROOT}/project.conf" ]; then
	. "${PROJECT_ROOT}/project.conf"
else
	echo -n "Please create ${PROJECT_ROOT}/project.conf" >&2
	echo " containing API_ROOT" >&2
	echo "Example: API_ROOT='http://localhost:5000/api/v0'" >&2
	sleep 15
	exit 1
fi

cd ${PROJECT_ROOT}
echo "export const API_ROOT='${API_ROOT}'" >src/local-conf.js
yarn install
echo "Frontend"
echo "========"
yarn start
