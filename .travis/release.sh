#!/bin/sh

setup_git() {
  git config --global user.email "lenny.glk@gmail.com"
  git config --global user.name "motorlatitude"
}

build_release() {
    npm run release
}

setup_git
build_release