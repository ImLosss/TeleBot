# 🚀 Setup Guide For Linux

## Development Environment Setup

Follow these steps to set up and run the Telegram Bot project locally:

### Requirements
- NodeJs latest (v22.16.0 recommended)
- yt-dlp installed on linux | [Download yt-dlp](https://github.com/yt-dlp/yt-dlp)
- ffmpeg installed on linux | [Download FFmpeg](https://ffmpeg.org/download.html)
- firefox installed on linux

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

---

## Bot Commands

| Command                        | Description                                                                                                   |
|---------------------------------|---------------------------------------------------------------------------------------------------------------|
| **Admin Commands**              |                                                                                                               |
| `/send <caption>`               | Send content with a caption to the channel. Make sure to reply to the video message. Returns message info as JSON, used later for `/updatebs`. |
| `/updatebs <link_bstation>`     | Update a message with a button. *Reply to the bot's message to select which message to update.*               |
| `/changechannel <@username>`    | Change the discussion channel username.                                                                       |
| `/iq <link>`                    | Download content from iQIYI. Requires VIP access and login via installed Firefox.                             |
| `/bw <add/rm/list>`             | Add, remove, or list banned words for the discussion channel. Messages containing these words will be automatically deleted by the bot. |
| **Group Commands**              |                                                                                                               |
| `/dl <link>`                    | Download video from any supported link (YouTube, Dailymotion, Instagram, etc.).                               |
| `/dlvs <link>`                  | Download video along with subtitles if available (softsub).                                                   |
| `/dla <link>`                   | Download high-quality audio from YouTube.                                                                     |