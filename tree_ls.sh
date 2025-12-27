#!/bin/bash

# ===============================
# Script: tree_ls.sh
# Scopo: listare file e cartelle ricorsivamente
# con indentazione tipo albero
# e possibilità di escludere alcune cartelle
# ===============================

# Array dei nomi di cartelle da escludere (modifica qui)
EXCLUDE_DIRS=("node_modules" ".git" "vendor")

# Funzione per controllare se un elemento è in array
contains() {
    local e
    for e in "${@:2}"; do
        if [[ "$e" == "$1" ]]; then
            return 0
        fi
    done
    return 1
}

# Funzione ricorsiva
list_dir() {
    local current_path="$1"
    local indent="$2"

    echo "${indent}$(basename "$current_path")/"
    
    # Lista file e directory nella cartella corrente
    for item in "$current_path"/*; do
        [ -e "$item" ] || continue
        if [ -d "$item" ]; then
            dir_name=$(basename "$item")
            contains "$dir_name" "${EXCLUDE_DIRS[@]}"
            if [ $? -ne 0 ]; then
                list_dir "$item" "  $indent"
            fi
        else
            echo "  $indent$(basename "$item")"
        fi
    done
}

# Path di partenza: directory dello script
START_PATH=$(pwd)
list_dir "$START_PATH" ""

