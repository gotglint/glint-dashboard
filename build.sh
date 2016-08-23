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

for dir in glint-dashboard-server glint-dashboard-ui
do
  echo "Building ${dir}..."

  cd ${dir}

  echo "Running \`npm prune\` for ${dir}..."
  npm prune

  echo "Running \`npm install\` for ${dir}..."
  npm install

  echo "Running \`gulp dist\` for ${dir}..."
  gulp dist

  cd -
done

if [ "$run_build" = false ]
then
  for dir in glint-dashboard-server glint-dashboard-ui
  do
    cd ${dir}
    ( gulp watch & )
    cd -
  done
fi
