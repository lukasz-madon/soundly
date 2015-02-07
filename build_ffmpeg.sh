#!/bin/sh
git clone --depth 1 git://source.ffmpeg.org/ffmpeg
cd ffmpeg
./configure
make
make install
tar xvf ffmpeg.tgz
