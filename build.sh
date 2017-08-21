#!/bin/sh

preact build --no-prerender && \

echo "tasks.accountant" >> build/CNAME && \

cd build && \
git init && \
git checkout -b gh-pages \
&& git add . \
&& git commit -m "build" \
&& git remote add origin git@github.com:blakelapierre/tasks

# cd build && \
# git init && \
# git checkout -b build \
# && git add . \
# && git commit -m "build" \
# && git remote add origin git@github.com:blakelapierre/tasks \
# && git fetch origin gh-pages \
# && git checkout gh-pages \
# && git merge -X theirs build


