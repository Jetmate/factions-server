#!/bin/bash

ssh anton@104.131.40.228 <<EOF
pm2 restart factions.io
EOF
