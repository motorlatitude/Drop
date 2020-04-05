gpg --quiet --batch --yes --decrypt --passphrase="$ENV_SECRET" --output ./electron-builder.env ./electron-builder.env.gpg
