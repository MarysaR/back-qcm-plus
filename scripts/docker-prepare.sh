#!/bin/bash
set -e

echo "Préparation des sources pour Docker..."

rm -rf vendor/logic-qcm-plus
mkdir -p vendor
cp -R ../logic-qcm-plus vendor/logic-qcm-plus

cp package.docker.json package.json
npm install --package-lock-only

echo "Sources prêtes pour Docker build."
