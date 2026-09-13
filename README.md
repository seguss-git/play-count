# DJFL 4

Sideline app for DJFL fourth grade: play counts, attendance and personnel units, so nobody falls short of the league minimum.

Live at **https://seguss-git.github.io/play-count/** — open it on a phone and Add to Home Screen. Both squads and the defensive depth chart are already built in, so there is nothing to set up.

Single file, no build, no server. Open `index.html` in any phone browser. Everything is saved on the device.

## Tabs

1. **Game.** Pick a date and opponent and start, or open a game already on the schedule. Two ways to count:
   - **Lineup: one button per play.** Tap the kids on the field once, then just press the big **Record Play** button every snap. Tap a kid to sub them in or out. The lineup carries over between plays.
   - **Tap: press each player.** Each press on a player's button adds one play for them. Good when only a few kids need watching.
   **All on** puts every present player on the field so you only tap the ones who are sitting, the reverse of building a lineup. Undo takes back the last play or press in either mode. The counting mode locks once a game has plays, so the two never mix inside one game. **Focus** hides everything except the players and the Record button. Under the on-field count, **Next in** names the three present players with the fewest plays who are not on the field, and how many are still under the 14-play minimum. The date and opponent can be edited at the bottom, and **Halftime** drops a marker into the play log so the Counts tab can show each player's plays per half. **Leave** steps out of a game you will come back to. **Game Final** locks it with every play and count kept; it shows a FINAL tag in the lists and needs a confirmed Reopen before it will take more plays.
   In **Field view**, tapping a player opens a substitution sheet for his spot: who plays there on another unit, who plays the mirror side, who fits athletically, and how many plays each has had. Sort by chart, by fit, or by who needs plays, then tap a name to swap him in.
   **Field view** swaps the player list for a formation diagram on a green field, with each player at their position. Tap a spot to sub that player out; the bench runs along the bottom. The formation comes from your imported chart: one row per table on the sheet, left to right in the order the columns were pasted. Toggle back with List view.
   If you have built any units, a row of unit buttons appears above the players. One tap puts that whole unit on the field, and you can still tap individuals to sub after. Absent kids are skipped. The row stays hidden until you create your first unit, so manual tapping is unaffected.
2. **Counts.** Sort buttons for fewest, most, jersey number or name; fewest first is the default, with red and amber flags and a "needs N" label for anyone under the 14-play minimum. Share sends the summary as a text, including who was absent; Download CSV gives a spreadsheet.
3. **Attendance.** Add practices and games with a date. **Practices cover the whole program**, White and Blue, listed under a heading for each team with its own here-count. **Games are White only.** A Send to Sheet button appears once a Google Sheet link is saved in Settings. Tap a row on the schedule, then tap players to mark them here or not. Everyone starts as present. Absent players drop off the field grid and the minimum-play check for that game. A switch at the top of the tab flips between taking attendance and the **Season** view, which lists every player by team with games and practices attended and a percentage. Sort by lowest, most missed, or name; tap a player to see the exact dates missed; Copy summary puts the whole thing on the clipboard for a text. Practices count for everyone and games count for the team that played them.
4. **Roster.** A White and Blue switch sits at the top. White is the play-count team. Blue players exist only for practice attendance and never appear in games, play counts or units. Add jersey numbers in the # box when you have them. Players can be added one at a time or pasted like `12 Jack, 7 Owen, 22 Liam`. **Load team roster** re-adds anyone from your team link who was deleted.
   **Best fit by position** ranks the squad for any spot on the chart using combine testing: 40 time, 5-10-5, 3-cone, broad jump and weight, weighted differently per position. A star marks players already on the chart there, so gaps stand out. Scores come from percentile ranks computed from the team combine sheet; raw weights and times are deliberately not stored in this app.

   This tab also holds **Units**, the named groups you send out together such as Hawk, Viper, or Hammer. Build one with New unit and check off players, giving each a position such as `L-CB` or `R-MLB`. Or capture the group already on the field with "Use who is on the field". Units are optional and carry over between games.
   **Import** handles both a unit chart and a plain list of players, switched at the top of the dialog. You can paste, or scan and upload a photo from the camera or the photo library. Photo reading uses Google text recognition through your Apps Script if a Sheet link is saved in Settings, which is far more accurate; otherwise it falls back to a basic in-browser scanner that struggles badly with spreadsheet gridlines. Always read the result before importing.
   In **Player names** mode each line is one player, like `12 Jack Smith`. A White or Blue column places them on that team, otherwise they join the team shown on the Roster tab. Players already on the roster are skipped.
   In **Unit chart** mode it takes a whole depth chart at once. Paste the rows straight from your spreadsheet, or scan a printed sheet with the camera and correct anything the scan misreads. The first row holds the positions and each following row is one unit. A sheet that stacks several tables (line, linebackers, safety) can be pasted in one go and merges into the same units. Names are matched against the roster by last name, and anything it cannot match is listed in red before you commit.
5. **Settings.** **My team** is a White or Blue switch that decides which team the game side belongs to. Games, play counts, units and the Counts tab all follow it, and each game and unit remembers the team that created it, so the two never mix. Practice attendance always covers both teams. That means either coach can use the same app and simply flip the switch. Also holds minimum plays per game and players on field. Season play totals. Backup and Restore move the data between phones.
   **Google Sheet.** Paste the web app link from `apps-script.gs` deployed on your attendance spreadsheet, then use Send a test row to check it. After that, Send to Sheet on the Attendance tab writes that session straight into your grid, finding or creating a column for the date and marking each player. Setup instructions are in the comments at the top of `apps-script.gs`.

## League rules built in (FCFL 2026, 4th grade)

- **14 qualifying plays** in the regular season, **12 in playoffs**. The Playoff button in the game card switches a game to 12 and every count, colour and warning follows it.
- **Punts, PATs and kneel-downs do not count.** Tap "Next play is a punt or PAT" before recording and that snap is logged but not counted. The header shows how many no-count snaps there were.
- **Limited players** (over 105 lb at weigh-in) may only play DG, DT, OG, OT or C. Mark them with the LTD button on the Roster tab. The substitution sheet and the Best-fit board never offer a limited player anywhere else. Bongiorno, Olsen and Strand start marked from the combine weights; the official weigh-in decides.
- **Minimum play sheet (rule 7.2).** Each White player can be given a role on the Roster tab: two-way starter, offense-only, defense-only, substitute, or place kicker only. Copy min play sheet on the Counts tab produces the sheet to hand to the opposing coach, with limited players marked.
- The end-of-second- and third-quarter reviews use the Counts tab, which always shows who is under the minimum.

## Team sync: one shared game for every coach

Without sync, each phone is its own island. With it, every coach sees the same counts, attendance, roster and units, live. It runs on a free Supabase project that you own.

**One-time setup, about ten minutes:**

1. Go to supabase.com, sign in, and create a new project. Any name, any region, set a database password and keep it somewhere.
2. In the project, open the SQL editor, paste the contents of `supabase.sql` from this repository, and click Run. It creates four small tables and the permissions the app needs.
3. Open Project Settings, then API. Copy the **Project URL** and the **anon public** key.
4. Send those two values to whoever maintains this app so they can be built in, or paste them into Settings, Team sync, on each phone.

**How it behaves.** Every change a phone makes goes into a local queue and is sent the moment there is signal. Every five seconds during a game, and every thirty otherwise, each phone pulls what the others sent. Plays are individual rows with an id and the phone that recorded them, so nothing is lost or double-counted by the sync itself. If two phones both record plays for the same game within ninety seconds, the Game tab shows a red warning, because that would double the counts. The rule is one counter per game; everyone else watches.

The anon key is designed to be public. The database holds player names, attendance and play counts and nothing else.

## Offline and updates

The app installs a service worker on first visit, so it opens with no signal and keeps working. The page itself is always fetched network-first with a four second timeout, so anyone with a connection gets the newest version on their next open, and anyone without one gets the copy from last time. While open, it checks for a new version every five minutes and whenever the network comes back. If nothing is in progress it reloads on its own; during a game it shows a bar at the top to tap when you are ready. The version number is at the bottom of Settings.

When shipping a change, bump `APP_VERSION` in index.html, `VERSION` in sw.js, and the value in version.json. The app compares its own version against version.json (a few bytes, fetched past the CDN cache) whenever it comes to the foreground. The current version shows in the header when no game is open, and Settings has a Check for update now button that reports what the phone can reach.

## Putting it on a phone

- Open https://seguss-git.github.io/play-count/ in Safari or Chrome, then use **Add to Home Screen** so it launches full-screen with the DJFL 4 icon.
- Data is per device. Use **Backup** on the Settings tab to move it to another phone.
