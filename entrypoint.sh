#!/bin/sh

echo "Running seeder..."
node seeder.js

echo "Starting server..."
exec node booking.js