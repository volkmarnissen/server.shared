#!/bin/bash
outf=$1
inf="$1.bck"
tmpf="$1.tmp"
cp $outf $inf && cp $outf $tmpf && grep '\@modbus2mqtt.*file:..' <$inf| sed -e 's/.*: \"file://g' -e 's/\",*$//g'|
while read -r line
do
  echo $line
  version=`grep "version" $line/package.json| sed -e 's/.*: \"//g' -e 's/\",*$//g'`
  cat $outf | sed -e  "s/file:..\/[^\"]*/^${version}/g" >$tmpf
  rm $outf
  mv  $tmpf $outf
  ls $1*
 done


