#!/bin/bash

# Kill any existing Metro bundler processes
pkill -f "expo start"

# Start the Expo development server
npx expo start --dev-client 