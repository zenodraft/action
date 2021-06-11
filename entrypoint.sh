#!/bin/bash -x

echo "INPUT_IN_COLLECTION = $INPUT_IN_COLLECTION"
echo "INPUT_SANDBOX = $INPUT_SANDBOX"

if [ "$INPUT_SANDBOX" == "false"]
then
    SANDBOX=""
else
    SANDBOX="--sandbox"
fi


if [ -z "$INPUT_IN_COLLECTION" ]
then
    LATEST_ID=$(zenodraft $SANDBOX deposition create in-new-collection)
else
    zenodraft $SANDBOX deposition create in-existing-collection $INPUT_IN_COLLECTION
    LATEST_ID=$(zenodraft $SANDBOX deposition latest $INPUT_IN_COLLECTION)
fi


# zenodraft $SANDBOX file add $LATEST_ID 2021-test.pdf
# zenodraft $SANDBOX metadata update $LATEST_ID .zenodo.json
