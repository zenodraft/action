#!/bin/bash

echo "INPUT_COLLECTION = $INPUT_COLLECTION"
echo "INPUT_SANDBOX = $INPUT_SANDBOX"

if [ "$INPUT_SANDBOX" = "false" ]
then
    SANDBOX=""
else
    SANDBOX="--sandbox"
fi


if [ -z "$INPUT_COLLECTION" ]
then
    LATEST_ID=$(zenodraft $SANDBOX deposition create in-new-collection)
else
    zenodraft $SANDBOX deposition create in-existing-collection "$INPUT_COLLECTION"
    LATEST_ID=$(zenodraft $SANDBOX deposition latest "$INPUT_COLLECTION")
fi

echo "$LATEST_ID"

# zenodraft $SANDBOX file add $LATEST_ID 2021-test.pdf
# zenodraft $SANDBOX metadata update $LATEST_ID .zenodo.json
