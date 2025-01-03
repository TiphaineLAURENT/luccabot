# luccabot

## How to

### Console

Simply copy-paste the content of the `console.js` file in your console while on either the select screen (with the training and play button), or on the Go screen.

### Violent Monkey

ViolentMonkey is a browser extension which allows scripts to be executed on specific pages.

You can install this script by copy-pasting the `user.js` in the "New script" editor or by using the "Install by URL" with the raw content url.

Because the game page is a single-page application, the url change are not detected by ViolentMonkey. To fix this, just reload the select page.

## What it does

![select_page](https://github.com/user-attachments/assets/d312ac3a-9669-457f-ab64-21c27ff9d4b8)

This script will first try to add a "Bot" button for convenience in the select screen or click the "Go" button and directly play the game.

It saves each error in the localStorage of your browser so you can delete it if need but it stays in the long time by default.

It will target a score of 1549 (because 1550+ will get your ban for cheating but feel free to disable the score check if you aime to get the biggest score possible).
