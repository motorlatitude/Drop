const Sentry = require("@sentry/electron");
Sentry.init({ dsn: process.env.DSN });
