#!/bin/sh
cd ../
pwd
while read p || [ -n "$p" ]
do
sed -i '' "/${p//\//\\/}/d" ./coverage/coverage.out
done < ./exclude-from-code-coverage.txt