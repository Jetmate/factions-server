#!/bin/bash

babel src --presets=env,stage-0 --out-dir build
sftp anton@104.131.40.228 <<EOF
cd factions
put -r build/.
EOF
