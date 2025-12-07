#!/bin/bash

# --- CONFIGURATION ---
PG_DATA="/var/lib/postgresql/data"
INIT_SQL="/mnt/database/init.sql"
QUERIES_DIR="/mnt/database/queries"

# Color codes
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
RESET='\033[0m'

echo -e "${CYAN}--- Setting up Postgres Environment ---${RESET}"

# 1. CLEAN & PREPARE DATA DIR
# We want a fresh DB every time. Ensure the dir is empty so initdb doesn't complain.
echo "Cleaning data directory..."
rm -rf "${PG_DATA:?}"/*

# Fix permissions so the 'postgres' user can write to it
chown -R postgres:postgres "$PG_DATA"
chmod 700 "$PG_DATA"

# 2. INITIALIZE DATABASE
echo "Initializing database cluster..."
# -A trust: Allow local connections without password (simplifies local dev)
# -U postgres: Set superuser name
if ! gosu postgres initdb -D "$PG_DATA" -A trust -U postgres > /dev/null; then
    echo -e "${RED}Error: initdb failed.${RESET}"
    exit 1
fi

# 3. START POSTGRES
echo "Starting Postgres engine..."
# -w: Wait for startup to complete
gosu postgres pg_ctl -D "$PG_DATA" -w start

# Double check it is running
if ! gosu postgres pg_isready -q; then
    echo -e "${RED}Error: Postgres failed to start.${RESET}"
    exit 1
fi
echo -e " ${GREEN}Ready!${RESET}"

# 4. Run Init SQL
if [ -f "$INIT_SQL" ]; then
    echo -e "${YELLOW}Running init.sql...${RESET}"
    gosu postgres psql -U postgres -d postgres -f "$INIT_SQL"
else
    echo "Warning: init.sql not found at $INIT_SQL"
fi

# --- THE INTERACTIVE LOOP ---

while true; do
    echo -e "\n${CYAN}========================================${RESET}"
    echo -e "${CYAN}       AVAILABLE QUERIES                ${RESET}"
    echo -e "${CYAN}========================================${RESET}"

    # Get list of SQL files
    # We use mapping to create an array of files
    files=("$QUERIES_DIR"/*.sql)
    
    # Check if files exist
    if [ ! -e "${files[0]}" ]; then
        echo "No .sql files found in $QUERIES_DIR"
        echo "Type 'exit' to quit."
    else
        # Print files with numbers
        i=1
        for file in "${files[@]}"; do
            filename=$(basename "$file")
            echo -e "${GREEN}[$i]${RESET} $filename"
            ((i++))
        done
    fi

    echo -e "${GREEN}[q]${RESET} Quit / Exit"
    echo -e "${CYAN}----------------------------------------${RESET}"
    read -p "Select a query to run: " choice

    if [[ "$choice" == "q" || "$choice" == "exit" ]]; then
        echo "Stopping database..."
        gosu postgres pg_ctl -D "$PG_DATA" stop > /dev/null
        echo "Bye!"
        exit 0
    fi

    # Validate numeric input
    if [[ "$choice" =~ ^[0-9]+$ ]] && [ "$choice" -ge 1 ] && [ "$choice" -le "${#files[@]}" ]; then
        selected_file="${files[$((choice-1))]}"
        echo -e "\n${YELLOW}>>> Executing: $(basename "$selected_file") <<<${RESET}"
        echo "---------------------------------------------------"
        
        # Execute the query
        gosu postgres psql -U postgres -d postgres -f "$selected_file"
        
        echo "---------------------------------------------------"
        read -p "Press Enter to continue..."
    else
        echo -e "\n${YELLOW}Invalid selection.${RESET}"
        sleep 1
    fi
done
