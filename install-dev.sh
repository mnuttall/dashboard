#!/bin/bash

echo "dep ensuring"
dep ensure -v

echo "npm installing"
npm install

echo "running build_ko"
npm run build_ko

kustomize build overlays/dev | ko apply -f -
