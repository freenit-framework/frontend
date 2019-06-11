#!/bin/sh


BIN_DIR=`dirname $0`
. "${BIN_DIR}/common.sh"
setup


echo "Frontend"
echo "========"
cd "${PROJECT_ROOT}"
rm -rf build
${PACKAGE_MANAGER} build

cd build/public
BUNDLE=`ls static/js/bundle.*.js`
cd -

sed -e "s;BUNDLE;${BUNDLE};g" templates/index.html >build/public/index.html
