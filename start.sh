#!/bin/sh

export BOT_SLACK_API_KEY="${SLACK_KEY}"
export BOT_FB_APP_ID="${FB_APP}"
export BOT_FB_APP_SECRET="${FB_SECRET}"
export BOT_SLACK_NAME="lunch"

node bot.js

