#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

pushd "${DIR}"
rsync -vaz \
    --exclude '**/plugin.js' \
    --exclude '**/theme.js' \
    --exclude '**/*.map' \
    --exclude 'tinymce.full.min.js' \
    --exclude 'plugins/moxiemanager' \
    --exclude 'plugins/compat3x' \
    --exclude 'plugins/visualblocks/img' \
    --exclude 'plugins/codemirror' \
    --exclude 'skins/*/fonts/*.json' \
    --exclude 'skins/*/fonts/readme.md' \
    --exclude 'langs/da.js' \
    --exclude 'tinymce.js' \
     js/tinymce/ /var/www/www.ku.dk/docs/tinymce4/
popd
