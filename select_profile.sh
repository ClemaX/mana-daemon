#!/usr/bin/env bash

UNAME=$(uname -s)

PROFILE_DIR_LINUX="$HOME/.mozilla/firefox"
PROFILE_DIR_DARWIN="$HOME/Library/Application Support/Firefox/Profiles"

case "$UNAME" in
	Linux*)		PROFILE_DIR="$PROFILE_DIR_LINUX";;
	Darwin*)	PROFILE_DIR="$PROFILE_DIR_DARWIN";;
	*)			echo "Unknown system: '$UNAME'!" >&2 && exit;;
esac

PROFILE_INDEX="$PROFILE_DIR/profiles.ini"

PROFILES=$(grep '^Path=.*$' "$PROFILE_INDEX" | cut -d'=' -f2)

PS3='Select profile, or 0 to exit: '
select PROFILE in $PROFILES
do
	if [[ $REPLY == "0" ]]
	then
		exit 1
	elif [[ -z $PROFILE ]]
	then
		echo 'Invalid choice!' >&2
	elif ! [ -d "$PROFILE_DIR/$PROFILE" ]
	then
		echo 'Profile directory does not exist!' >&2
	else
		break
	fi
done

echo "$PROFILE_DIR/$PROFILE"
