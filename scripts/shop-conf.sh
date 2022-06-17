#!/bin/bash
# Manually creating config to avoid Shopify's tty when running CLI for the first time
mkdir -p $HOME/.config/shopify
touch $HOME/.config/shopify/config
echo "[analytics]" > $HOME/.config/shopify/config
echo "enabled = true" >> $HOME/.config/shopify/config