# Audio Player Instructions

## Adding the Severance Theme Audio

To complete the music player setup, you need to add the Severance theme audio file:

1. Download the audio from the YouTube video: https://www.youtube.com/watch?v=JRnDYB28bL8
   - You can use a YouTube to MP3 converter service
   - Or extract the audio using a tool like youtube-dl

2. Save the audio file as `severance-theme.mp3` in this directory

3. For copyright reasons, we cannot include the audio file directly in the repository

## Alternative Method

If you have youtube-dl installed, you can use the following command to download just the audio:

```
youtube-dl -x --audio-format mp3 --audio-quality 0 -o "severance-theme.%(ext)s" https://www.youtube.com/watch?v=JRnDYB28bL8
```

Then move the resulting MP3 file to this directory.

## Legal Note

Please ensure you have the right to use the audio for your purposes. The Severance theme music is copyrighted material owned by Apple TV and its creators. 