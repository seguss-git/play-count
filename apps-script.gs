/**
 * Play Count -> Google Sheets bridge.
 *
 * Writes practice and game attendance from the Play Count app into the attendance
 * grid you already keep: one column per date, one row per player.
 *
 * You should not need to configure anything. The script looks through every tab
 * for a header row containing "Last Name" and uses that one.
 *
 * SETUP
 *  1. Open your attendance spreadsheet.
 *  2. Extensions -> Apps Script. Delete everything in Code.gs and paste this file. Save.
 *  3. Deploy -> New deployment -> type "Web app".
 *       Execute as:      Me
 *       Who has access:  Anyone
 *     Authorise it. Google warns that the app is unverified, which is expected for
 *     your own script: choose Advanced, then Go to (project name).
 *  4. Copy the URL it gives you. It ends in /exec.
 *  5. Open that URL in a browser tab. It will tell you which sheet it found and how
 *     many players it can see. If that looks right, you are done.
 *  6. In the app: Settings -> Google Sheet -> paste the URL -> Send a test row.
 *
 * The URL works like a password: anyone holding it can write to this sheet. Keep it
 * off public pages. Deploy a new version to invalidate it if it ever leaks.
 */

var SHEET_NAME = '';     // leave blank to auto-detect; set a tab name to force one
var DATE_FORMAT = 'M/d'; // label used when a new date column is created, e.g. 9/20
var PRESENT_MARK = 'Y';  // written for a player who was there
var ABSENT_MARK = '';    // written for a player who was not

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    if (!data.rows || !data.rows.length) return json(describe());
    return json(writeAttendance(data));
  } catch (err) {
    return json({ ok: false, error: errText(err) });
  }
}

function doGet() {
  try {
    return json(describe());
  } catch (err) {
    return json({ ok: false, error: errText(err) });
  }
}

function errText(err) {
  return String(err && err.message ? err.message : err);
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Report what the script can see, so setup problems are obvious. */
function describe() {
  var t = findTable();
  var names = [];
  for (var r = t.hdr + 1; r < t.values.length && names.length < 5; r++) {
    var last = String(t.values[r][t.cLast] || '').trim();
    if (last) names.push(last);
  }
  var dateCols = [];
  for (var c = 0; c < t.values[t.hdr].length; c++) {
    if (c === t.cLast || c === t.cFirst) continue;
    var h = headerText(t.values[t.hdr][c], t.tz);
    if (h) dateCols.push(h);
  }
  return {
    ok: true,
    matched: 0,
    missed: [],
    column: 'nothing written',
    sheet: t.sh.getName(),
    headerRow: t.hdr + 1,
    players: t.players,
    firstFew: names,
    existingColumns: dateCols.slice(-8)
  };
}

/** Find the tab and columns holding the roster. */
function findTable() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = SHEET_NAME ? [ss.getSheetByName(SHEET_NAME)] : ss.getSheets();
  if (!sheets[0]) throw new Error('No tab named "' + SHEET_NAME + '"');

  var best = null;
  for (var i = 0; i < sheets.length; i++) {
    var sh = sheets[i];
    var values = sh.getDataRange().getValues();
    if (!values.length) continue;

    var hdr = -1, cFirst = -1, cLast = -1;
    for (var r = 0; r < Math.min(values.length, 25) && hdr < 0; r++) {
      var foundLast = -1, foundFirst = -1;
      for (var c = 0; c < values[r].length; c++) {
        var v = String(values[r][c]).toLowerCase();
        if (v.indexOf('last name') >= 0) foundLast = c;
        else if (v.indexOf('first name') >= 0) foundFirst = c;
      }
      if (foundLast >= 0) { hdr = r; cLast = foundLast; cFirst = foundFirst; }
    }
    if (hdr < 0) continue;

    var players = 0;
    for (var r2 = hdr + 1; r2 < values.length; r2++) {
      if (String(values[r2][cLast] || '').trim()) players++;
    }
    var cand = { sh: sh, values: values, hdr: hdr, cFirst: cFirst, cLast: cLast, players: players };
    // Prefer a tab that looks like the attendance sheet, then the one with most players.
    var looksRight = /attend|roster|player/i.test(sh.getName()) ? 1 : 0;
    cand.score = looksRight * 10000 + players;
    if (!best || cand.score > best.score) best = cand;
  }

  if (!best) throw new Error('No tab has a "Last Name" header in its first 25 rows');
  best.tz = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();
  return best;
}

function writeAttendance(data) {
  var t = findTable();
  var label = Utilities.formatDate(parseIsoDate(data.date), t.tz, DATE_FORMAT);

  // Find the column for this date, or start a new one after the last used column.
  var col = -1;
  for (var c = 0; c < t.values[t.hdr].length; c++) {
    if (headerText(t.values[t.hdr][c], t.tz) === label) { col = c; break; }
  }
  if (col < 0) {
    col = t.values[t.hdr].length;
    while (col > 0 && String(t.values[t.hdr][col - 1]).trim() === '') col--;
    t.sh.getRange(t.hdr + 1, col + 1).setValue(label);
  }

  // Index existing rows by "first last" and by last name alone.
  var index = {};
  for (var r = t.hdr + 1; r < t.values.length; r++) {
    var last = String(t.values[r][t.cLast] || '').trim().toLowerCase();
    if (!last) continue;
    var first = t.cFirst >= 0 ? String(t.values[r][t.cFirst] || '').trim().toLowerCase() : '';
    var full = (first + ' ' + last).trim();
    if (!(full in index)) index[full] = r;
    if (!(last in index)) index[last] = r;
  }

  var matched = 0, missed = [];
  for (var i = 0; i < data.rows.length; i++) {
    var row = data.rows[i];
    var name = String(row.name || '').trim().toLowerCase();
    if (!name) continue;
    var parts = name.split(/\s+/);
    var target = index[name];
    if (target === undefined) target = index[parts[parts.length - 1]];
    if (target === undefined) { missed.push(row.name); continue; }
    t.sh.getRange(target + 1, col + 1).setValue(row.present ? PRESENT_MARK : ABSENT_MARK);
    matched++;
  }

  return {
    ok: true,
    matched: matched,
    missed: missed,
    column: label,
    sheet: t.sh.getName()
  };
}

function parseIsoDate(s) {
  var p = String(s).split('-');
  return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
}

function headerText(v, tz) {
  if (v instanceof Date) return Utilities.formatDate(v, tz, DATE_FORMAT);
  return String(v).trim();
}
