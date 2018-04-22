#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

sudo cp ./dit /usr/local/bin/
sudo chmod +x /usr/local/bin/dit
echo "Ditto Installed"