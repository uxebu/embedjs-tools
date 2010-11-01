echo "Creating widgets containing the tests contained in this directory."
echo ""
# TODO implement this using JavaScript, like the build and the others.
# TODO this is still VERY embedJS specific, not really portable imho ...

TMPDIR=tmp/__wgt__
# Empty the widget stuff
rm -Rf $TMPDIR
# Create the temp dir where we are going to build the widget in
# Create a "embedJS" directory so we can remove all but nokia later for the Nokia WRT, to reduce the size.
mkdir -p $TMPDIR/embedJS

cd $TMPDIR
cp -R ../../tests/* .
cp ../../src/config.xml .
cp ../../build/embed-* ./embedJS

# Remove all *.uncompressed.js files, they are just bloat in a widget
find . -type f -name "*.uncompressed.js" | xargs rm

rm ../embedJStests.wgt
zip -r ../embedJStests.wgt *



 Create the Nokia WRT widget.
echo
echo "*** Create Nokia WRT widget ***"
echo 
rm config.xml
cp ../../src/Info.plist .
cd ..
mv __wgt__ src # A nokia WRT widget has to be in the directory "src" for packaging it ... for whatever reason, but it wont install otherwise ... grrrr
find src/embedJS -type f ! -name "*nokia*" -delete
zip -r embedJStests.wgz src/*


# Move the final widgets to "tests" directory.
mv embedJStests.wgt ../tests
mv embedJStests.wgz ../tests

# Clean up
rm -Rf src