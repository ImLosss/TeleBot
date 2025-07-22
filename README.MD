# 🚀 Setup Guide For Linux

## Development Environment Setup

Follow these steps to set up and run the Telegram Bot project locally:

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

---

## Bot Commands

| Command                        | Description                                                                                                   | Usage Example                       |
|---------------------------------|---------------------------------------------------------------------------------------------------------------|-------------------------------------|
| **Admin Commands**              |                                                                                                               |                                     |
| `/send <caption>`               | Send content with a caption to the channel. Returns message info as JSON, used later for `/updatebs`.         | `/send New episode released!`       |
| `/updatebs <link_bstation>`     | Update a message with a button. *Reply to the bot's message to select which message to update.*               | `/updatebs https://bstation.link`   |
| `/changechannel <@username>`    | Change the discussion channel username.                                                                       | `/changechannel @mychannel`         |
| `/iq <link>`                    | Download content from iQIYI. *Requires VIP access and login via Firefox.*                                     | `/iq https://iqiyi.com/video`       |
| **Group Commands**              |                                                                                                               |                                     |
| `/dl <link>`                    | Download video from any supported link (YouTube, Dailymotion, Instagram, etc.).                               | `/dl https://youtube.com/...`       |
| `/dlvs <link>`                  | Download video along with subtitles if available (softsub).                                                   | `/dlvs https://youtube.com/...`     |
| `/dla <link>`                   | Download high-quality audio from YouTube.                                                                     | `/dla