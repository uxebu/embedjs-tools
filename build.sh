DIR=`dirname $0`
CUR_DIR=`pwd`

#java -jar $DIR/js.jar $DIR/js/build.js $DIR/js $CUR_DIR/build-config.json $@

java -classpath $DIR/js.jar:$DIR/shrinksafe.jar org.mozilla.javascript.tools.shell.Main $DIR/js/build.js $DIR/js $CUR_DIR/build-config.json "$@"

