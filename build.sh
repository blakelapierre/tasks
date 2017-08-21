#!/bin/sh

preact build && \

echo "tasks.accountant" >> build/CNAME && \

cd build && git init && git remote add origin git@github.com:blakelapierre/tasks && git checkout -b gh-pages && git add . && git commit -m "build"


