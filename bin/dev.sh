#!/bin/bash

export PROJECT_ROOT=$(readlink -f "$(dirname $0)/..")
export NODE_ENV="dev"

cd ${PROJECT_ROOT}
npm install
npm start
