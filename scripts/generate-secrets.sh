#!/bin/bash

mkdir -p secrets

openssl rand -base64 32 | tr -d '\n' > secrets/core_password.txt
openssl rand -base64 32 | tr -d '\n' > secrets/identity_password.txt
openssl rand -base64 32 | tr -d '\n' > secrets/admin_password.txt
openssl rand -base64 32 | tr -d '\n' > secrets/admin_session_secret.txt
openssl rand -base64 32 | tr -d '\n' > secrets/jwt_secret.txt
