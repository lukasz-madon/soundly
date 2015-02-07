#!/bin/sh
git clone --depth 1 git://source.ffmpeg.org/ffmpeg
cd ffmpeg
# disable-asm cause possible slow down (not sure if affects current usage)
# TODO investigate if needed. Include yasm as dll?
./configure --enable-shared --disable-asm --prefix=/app/vendor/ffmpeg
make
make install
tar xvf ffmpeg.tgz
