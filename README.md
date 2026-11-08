# AttendEase — Organized Source Code

This version is based on your supplied AttendEase HTML source. The website design, names, student IDs, features, demo login, and localStorage key are unchanged. The source was reorganized for readability.

## Files

- `index.html` — website structure and screens
- `style.css` — original red-and-white styling, now separated and formatted
- `script.js` — original application logic, now separated and formatted

## Open in VS Code

1. Extract the folder and open it in VS Code (File > Open Folder).
2. Right-click `index.html` and select **Open with Live Server** (or open `index.html` directly in a browser).
3. Keep all three files in the same folder.

## Demo accounts

Choose Administrator, Instructor, or Student on the login page. The password is `demo123`.

## Notes

This is still a browser-only PT101 prototype, not a real secure login system. It uses localStorage and preserves existing stored data if opened from the same web origin. When changing from a `file://` address to a Live Server address, browser storage may be separate.
