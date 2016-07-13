#!/usr/bin/env bash

run_build=true

while getopts ":w" opt; do
  case $opt in
    w)
      echo "Running as watch instead of build" >&2
      run_build=false
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      ;;
  esac
done

for dir in glint-lib glint-server # glint-dashboard
do
  echo "Building ${dir}..."

  cd ${dir}

  if [ "${dir}" == "glint-server" ]
  then
    echo "Running \`npm ln\` for ${dir}..."
    npm ln ../glint-lib
  fi


  echo "Running \`npm install\` for ${dir}..."
  npm install

  echo "Running \`gulp dist\` for ${dir}..."
  gulp dist

  cd ..
done

if ${run_build}
then
#  echo "Running \`gulp dist\` for all projects..."
#  gulp dist
  echo "Doing nothing."
else
  echo "Running \`gulp watch\` for all projects..."
  gulp watch
fi
