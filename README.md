# Sheen Pro QR Studio

A professional, multi-mode QR code generator built with HTML, CSS, and JavaScript.

## Repository

- GitHub: `https://github.com/Sohailqureshi9/QRCode-Generator`

## Overview

Sheen Pro QR Studio helps you generate real QR codes for:
- Text and URLs
- Banking app deep links
- Wallet payment details (Easypaisa, JazzCash, etc.)
- Bank transfer details (IBAN/account number)

It also includes direct-app and redirect-based QR flows for payment journeys.

## Features

- Multiple QR modes in one UI
- Real QR generation via API (`api.qrserver.com`)
- Redirect behavior options:
  - Direct open
  - Via redirect endpoint (`{target}` placeholder supported)
- Wallet and bank scan behavior options:
  - Encode details
  - Open app directly
  - Open app via redirect URL
- QR quality controls:
  - Size selector
  - Error correction level (L/M/Q/H)
- Download generated QR as PNG
- Copy payload and QR image link
- Dark/Light mode toggle
- Saved templates (localStorage)
- Recent history (localStorage)
- Shareable config link support
- Responsive modern UI with header/footer branding

## Project Structure

- `index.html` - App structure and form sections
- `style.css` - Complete styling, themes, responsive layout
- `app.js` - All logic (modes, validation, generation, history/templates)

## How To Run

1. Clone repository:
  - `git clone https://github.com/Sohailqureshi9/QRCode-Generator.git`
2. Open the project folder in VS Code.
3. Open `index.html` in your browser.
4. Start generating QR codes.

or

1. Open the project folder in VS Code.
2. Open `index.html` in your browser.
3. Start generating QR codes.

No build step and no package installation required.

## Usage

1. Select `QR type`.
2. Fill relevant fields.
3. Choose QR size and error correction.
4. Click `Generate QR Code`.
5. Download or copy generated output.

## Redirect Mode Notes

For redirect mode, provide a redirect endpoint like:
- `https://yourdomain.com/r?to={target}`

If `{target}` is not present, app automatically appends `?to=` (or `&to=`).

## Important Note About Banking/Wallet Apps

QR scanning behavior depends on what the target app supports.
- If the app supports deep links, direct open works.
- If not, use a web redirect flow or encoded details mode.

## Author

Sohail Qureshi

## License

This project is open for personal learning and portfolio use.
