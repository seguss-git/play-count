# DJFL 4

Sideline app for DJFL fourth grade: play counts, attendance and personnel units, so nobody falls short of the league minimum.

Live at **https://seguss-git.github.io/play-count/** — open it on a phone and Add to Home Screen. Both squads and the defensive depth chart are already built in, so there is nothing to set up.

Single file, no build, no server. Open `index.html` in any phone browser. Everything is saved on the device.

## Tabs

1. **Game.** Pick a date and opponent and start, or open a game already on the schedule. Two ways to count:
   - **Lineup: one button per play.** Tap the kids on the field once, then just press the big **Record Play** button every snap. Tap a kid to sub them in or out. The lineup carries over between plays.
   - **Tap: press each player.** Each press on a player's button adds one play for them. Good when only a few kids need watching.
   Undo takes back the last play or press in either mode. The date and opponent can be edited at the bottom.
   **Field view** swaps the player list for a formation diagram on a green field, with each player at their position. Tap a spot to sub that player out; the bench runs along the bottom. The formation comes from your imported chart: one row per table on the sheet, left to right in the order the columns were pasted. Toggle back with List view.
   If you have built any units, a row of unit buttons appears above the players. One tap puts that whole unit on the field, and you can still tap individuals to sub after. Absent kids are skipped. The row stays hidden until you create your first unit, so manual tapping is unaffected.
2. **Counts.** Sorted fewest plays first, with red and amber flags and a "needs N" label for anyone under the minimum. Share sends the summary as a text, including who was absent; Download CSV gives a spreadsheet.
3. **Attendance.** Add practices and games with a date. **Practices cover the whole program**, White and Blue, listed under a heading for each team with its own here-count. **Games are White only.** A Send to Sheet button appears once a Google Sheet link is saved in Settings. Tap a row on the schedule, then tap players to mark them here or not. Everyone starts as present. Absent players drop off the field grid and the minimum-play check for that game. Season attendance is grouped by team, counting practices for everyone and games for White only.
4. **Roster.** A White and Blue switch sits at the top. White is the play-count team. Blue players exist only for practice attendance and never appear in games, play counts or units. Add jersey numbers in the # box when you have them. Players can be added one at a time or pasted like `12 Jack, 7 Owen, 22 Liam`. **Load team roster** re-adds anyone from your team link who was deleted.
   This tab also holds **Units**, the named groups you send out together such as Hawk, Viper, or Hammer. Build one with New unit and check off players, giving each a position such as `L-CB` or `R-MLB`. Or capture the group already on the field with "Use who is on the field". Units are optional and carry over between games.
   **Import** handles both a unit chart and a plain list of players, switched at the top of the dialog. You can paste, or scan and upload a photo from the camera or the photo library. Photo reading uses Google text recognition through your Apps Script if a Sheet link is saved in Settings, which is far more accurate; otherwise it falls back to a basic in-browser scanner that struggles badly with spreadsheet gridlines. Always read the result before importing.
   In **Player names** mode each line is one player, like `12 Jack Smith`. A White or Blue column places them on that team, otherwise they join the team shown on the Roster tab. Players already on the roster are skipped.
   In **Unit chart** mode it takes a whole depth chart at once. Paste the rows straight from your spreadsheet, or scan a printed sheet with the camera and correct anything the scan misreads. The first row holds the positions and each following row is one unit. A sheet that stacks several tables (line, linebackers, safety) can be pasted in one go and merges into the same units. Names are matched against the roster by last name, and anything it cannot match is listed in red before you commit.
5. **Settings.** **My team** is a White or Blue switch that decides which team the game side belongs to. Games, play counts, units and the Counts tab all follow it, and each game and unit remembers the team that created it, so the two never mix. Practice attendance always covers both teams. That means either coach can use the same app and simply flip the switch. Also holds minimum plays per game and players on field. Season play totals. Backup and Restore move the data between phones.
   **Google Sheet.** Paste the web app link from `apps-script.gs` deployed on your attendance spreadsheet, then use Send a test row to check it. After that, Send to Sheet on the Attendance tab writes that session straight into your grid, finding or creating a column for the date and marking each player. Setup instructions are in the comments at the top of `apps-script.gs`.

## Putting it on a phone

- Open https://seguss-git.github.io/play-count/ in Safari or Chrome, then use **Add to Home Screen** so it launches full-screen with the DJFL 4 icon.
- Data is per device. Use **Backup** on the Settings tab to move it to another phone.
