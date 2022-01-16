#!/usr/bin/env bash

PARENT_DIR=$(dirname "$0")

PROFILE=$($PARENT_DIR/select_profile.sh)
ORIGIN=$(rev <<< discord.com)

cp "$PROFILE/webappsstore.sqlite" webappsstore.sqlite

# Token should be accessible only to the current user.
umask 177

sqlite3 webappsstore.sqlite <<EOF | tr -d $'"\x1e' > token
.mode ascii
SELECT value FROM webappsstore2 WHERE originKey LIKE "%$ORIGIN%" AND key = "token";
EOF

rm webappsstore.sqlite*
