#!/bin/sh

BIN_DIR=`dirname $0`
PROJECT_ROOT=`readlink -f "${BIN_DIR}/.."`
NPM=`which npm`
YARN=`which yarn`

if [ ! -z "${NPM}" ]; then
  PACKAGE_MANAGER="${NPM}"
else
  PACKAGE_MANAGER="${YARN}"
fi

if [ -e "${PROJECT_ROOT}/project.conf" ]; then
	. "${PROJECT_ROOT}/project.conf"
else
	echo -n "Please create ${PROJECT_ROOT}/project.conf" >&2
	echo " containing API_ROOT" >&2
	echo "Example: API_ROOT='http://localhost:5000/api/v0'" >&2
	read novar || sleep 15
	exit 1
fi

if [ -z "${PACKAGE_MANAGER}" ]; then
  echo "Install npm or yarn" >&2
  exit 1
fi

cd ${PROJECT_ROOT}
echo "export const API_ROOT='${API_ROOT}'" >src/local-conf.js
${PACKAGE_MANAGER} install
echo "Frontend"
echo "========"
${PACKAGE_MANAGER} start
