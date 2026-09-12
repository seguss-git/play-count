# White Team Play Count

Sideline app for tracking plays per kid and attendance for a youth football team, so nobody falls short of the league minimum.

Single file, no build, no server. Open `index.html` in any phone browser. Everything is saved on the device.

## Tabs

1. **Game.** Pick a date and opponent and start, or open a game already on the schedule. Two ways to count:
   - **Lineup: one button per play.** Tap the kids on the field once, then just press the big **Record Play** button every snap. Tap a kid to sub them in or out. The lineup carries over between plays.
   - **Tap: press each player.** Each press on a player's button adds one play for them. Good when only a few kids need watching.
   Undo takes back the last play or press in either mode. The date and opponent can be edited at the bottom.
2. **Counts.** Sorted fewest plays first, with red and amber flags and a "needs N" label for anyone under the minimum. Share sends the summary as a text, including who was absent; Download CSV gives a spreadsheet.
3. **Attendance.** Add practices and games with a date. Tap a row on the schedule, then tap players to mark them here or not. Everyone starts as present. Absent players drop off the field grid and the minimum-play check for that game. Season attendance shows games and practices attended per player.
4. **Roster.** The 25 White players from the league sheet are preloaded. Add jersey numbers in the # box when you have them. New players can be added one at a time or pasted like `12 Jack, 7 Owen, 22 Liam`. **Load White roster** re-adds anyone who was deleted.
5. **Settings.** Team name, minimum plays per game, and players on field. Season play totals. Backup and Restore move the data between phones.

## Putting it on a phone

- Open the file from iCloud, Google Drive, email, or a GitHub Pages link, then use **Add to Home Screen** so it launches full-screen like an app.
- Data is per device. Use **Backup** on the Settings tab to move it to another phone.
