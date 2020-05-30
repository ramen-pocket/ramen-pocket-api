# Create a root directory for layers
mkdir -p ./dist/layers

cd ./src/layers/common
# Package the common layer
if [ ! -d "./nodejs/node_modules" ]; then
  npm install
fi
zip -FS -r ../../../dist/layers/common.zip ./nodejs
cd -

cd ./src/layers/oauth
# Package the oauth layer
if [ ! -d "./nodejs/node_modules" ]; then
  npm install
fi
zip -FS -r ../../../dist/layers/oauth.zip ./nodejs
cd -
