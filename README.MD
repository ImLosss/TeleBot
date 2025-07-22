# 🚀 Setup Guide For Linux

## Development Environment Setup

Follow these steps to set up and run the project locally:

### Requirements
- NodeJs latest (v22.16.0 recommended)
- yt-dlp installed on linux | [Download yt-dlp](https://github.com/yt-dlp/yt-dlp)
- ffmpeg installed on linux | [Download FFmpeg](https://ffmpeg.org/download.html)

### Installation Steps

1. **Copy config file**:
   ```bash
   cp config.json.example config.json
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the bot**:
   ```bash
   node index.js
   ```

Your Telegram bot is now running.  
Edit `config.json` to set your API key and other settings.
