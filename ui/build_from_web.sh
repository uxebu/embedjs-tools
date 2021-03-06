echo "Running web based builder..."

# save params
CONFIGPATH=$1
BUILDNAME=$2
FEATURES=$3
PLATFORMS=$4
KEEPLINES=$5
STRIPCONSOLE=$6
UNCOMPRESSED=$7
VERBOSE=$8
CUSTOMPROFILENAME=$9

# go to tools directory
cd ..

# save path to build tool
TOOLS_DIR=`pwd`

# go to profiles dir
cd ui
echo "Going to $CONFIGPATH..."
cd $CONFIGPATH

echo "Invoking builder."
echo ""
# start the builder
$TOOLS_DIR/build.sh profile=$BUILDNAME features=$FEATURES platforms=$PLATFORMS keepLines=$KEEPLINES stripConsole=$STRIPCONSOLE uncompressed=$UNCOMPRESSED isVerbose=$VERBOSE customProfileName=$CUSTOMPROFILENAME