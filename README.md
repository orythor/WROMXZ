# WROMXZ
This is an uncensored AI source wrapped into a single-file website source. This source is safe to use. Disclaimer: 'Use it wisely. Misuse is not my responsibility.' I made this for educational purposes only. 
Next Generation AI Chat Platform - dark-themed chat interface with real-time aurora effects and multi-tab support.

Features

- Chat with AI - uses worm-gpt API
- Multi-tab Chat - open multiple chat sessions simultaneously
- Splash Screen Animation - real-time 3D aurora background with Three.js
- Full Dark Mode - deep red dark theme
- Responsive and Mobile Friendly - supports mobile keyboard, auto viewport adjustment
- Local Storage - chat history saved to localStorage
- Copy Message and Code - copy AI responses or code blocks with one click
- History Sidebar - view and manage all chat sessions
- Auto-clean Disclaimer - automatically removes disclaimer messages from AI responses

Usage

1. Open index.html in a modern browser (Chrome, Edge, Firefox, Safari).
2. Click Get Started to enter the chat.
3. Type a message in the input area, press Enter to send.
4. Use the New Chat button or Ctrl + N to create a new tab.
5. Click the menu icon or Ctrl + B to open/close the history sidebar.

Technologies Used

- HTML5, CSS3, JavaScript - native ES modules
- Tailwind CSS - quick styling via CDN
- Three.js - aurora shader effect on splash screen
- LocalStorage API - chat history storage
- Fetch API - communication with AI backend

Code Structure

- Single HTML file - all code (style, script, markup) in one document
- No build step - run directly in browser
- CSS Variables - easy theme color customization
- Modular event handling - centralized state with auto re-render

API Configuration

Change the API endpoint in the code:

const API_URL = 'sensored';

Make sure the API returns this format:

{
  "result": {
    "response": "AI response text"
  }
}

Disclaimer

"Use it wisely. Misuse is not my responsibility."

This source code is made for educational purposes only. Use beyond that is the user's responsibility.

Important Notes

- All messages are automatically cleaned from emojis, disclaimers, and excessive formatting.
- Input auto-adjusts height (max 130px).
- Sidebar automatically closes on mobile after selecting a chat.
- Supports fullscreen mode (click the three-dot button on top right).

License

MIT - free to use, modify, and distribute for learning purposes.

Created by: WROMXZ
Version: 1.00
