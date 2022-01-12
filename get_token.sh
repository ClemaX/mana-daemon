#!/usr/bin/env bash

PROFILE_DIR="$HOME/Library/Application Support/Firefox/Profiles"
PROFILE_NAME="hl8x0ox2.default-release"

ORIGIN=$(rev <<< discord.com)

cp "$PROFILE_DIR/$PROFILE_NAME/webappsstore.sqlite" webappsstore.sqlite

sqlite3 webappsstore.sqlite <<EOF | tr -d '"' > token
.mode ascii
SELECT value FROM webappsstore2 WHERE originKey LIKE "%$ORIGIN%" AND key = "token";
EOF

rm webappsstore.sqlite*
