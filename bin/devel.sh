#!/bin/sh

BIN_DIR=`dirname $0`
PROJECT_ROOT=`readlink -f "${BIN_DIR}/.."`

cd ${PROJECT_ROOT}
npm install
echo "Frontend"
echo "========"
npm start
