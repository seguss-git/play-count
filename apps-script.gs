/**
 * Play Count -> Google Sheets bridge.
 *
 * Writes practice and game attendance from the Play Count app straight into the
 * attendance grid you already keep, one column per date and one row per player.
 *
 * SETUP
 *  1. Open your attendance spreadsheet.
 *  2. Extensions -> Apps Script. Delete whatever is in Code.gs and paste this file.
 *  3. Set SHEET_NAME below if your attendance tab is not the first one.
 *  4. Deploy -> New deployment -> type "Web app".
 *       Execute as:      Me
 *       Who has access:  Anyone
 *     Authorise it when Google asks. Google will warn that the app is unverified,
 *     which is expected for your own script.
 *  5. Copy the /exec URL it gives you.
 *  6. In the Play Count app: Settings -> Google Sheet -> paste the URL -> Send a test row.
 *
 * The URL works like a password. Anyone who has it can write to this sheet, so do
 * not post it publicly. Redeploy to get a fresh one if it ever leaks.
 */

var SHEET_NAME = '';     // '' means the first tab in the spreadsheet
var DATE_FORMAT = 'M/d'; // how a new date column is labelled, e.g. 9/20
var PRESENT_MARK = 'Y';  // what to write for a player who was there
var ABSENT_MARK = '';    // what to write for a player who was not

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    if (!data.rows || !data.rows.length) {
      return json({ ok: true, matched: 0, missed: [], column: 'test only, nothing written' });
    }
    var res = writeAttendance(data);
    return json({ ok: true, matched: res.matched, missed: res.missed, column: res.column });
  } catch (err) {
    return json({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function doGet() {
  return json({ ok: true, note: 'Play Count bridge is deployed. Post attendance to this URL.' });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function writeAttendance(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = SHEET_NAME ? ss.getSheetByName(SHEET_NAME) : ss.getSheets()[0];
  if (!sh) throw new Error('No sheet named "' + SHEET_NAME + '"');

  var values = sh.getDataRange().getValues();
  if (!values.length) throw new Error('That sheet is empty');

  // Find the header row and the name columns.
  var hdr = -1, cFirst = -1, cLast = -1;
  for (var r = 0; r < Math.min(values.length, 25) && hdr < 0; r++) {
    for (var c = 0; c < values[r].length; c++) {
      var v = String(values[r][c]).toLowerCase();
      if (v.indexOf('last name') >= 0) { hdr = r; cLast = c; }
      if (v.indexOf('first name') >= 0) { cFirst = c; }
    }
  }
  if (hdr < 0) throw new Error('Could not find a "Last Name" header in the first 25 rows');

  // Find the column for this date, or add one on the end.
  var tz = ss.getSpreadsheetTimeZone();
  var label = Utilities.formatDate(parseIsoDate(data.date), tz, DATE_FORMAT);
  var col = -1;
  for (var c2 = 0; c2 < values[hdr].length; c2++) {
    if (headerText(values[hdr][c2], tz) === label) { col = c2; break; }
  }
  if (col < 0) {
    col = values[hdr].length;
    while (col > 0 && String(values[hdr][col - 1]).trim() === '') col--;
    sh.getRange(hdr + 1, col + 1).setValue(label);
  }

  // Index the existing player rows by "first last" and by last name alone.
  var index = {};
  for (var r2 = hdr + 1; r2 < values.length; r2++) {
    var last = String(values[r2][cLast] || '').trim().toLowerCase();
    if (!last) continue;
    var first = cFirst >= 0 ? String(values[r2][cFirst] || '').trim().toLowerCase() : '';
    var full = (first + ' ' + last).trim();
    if (!(full in index)) index[full] = r2;
    if (!(last in index)) index[last] = r2;
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
    sh.getRange(target + 1, col + 1).setValue(row.present ? PRESENT_MARK : ABSENT_MARK);
    matched++;
  }

  return { matched: matched, missed: missed, column: label };
}

function parseIsoDate(s) {
  var p = String(s).split('-');
  return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
}

function headerText(v, tz) {
  if (v instanceof Date) return Utilities.formatDate(v, tz, DATE_FORMAT);
  return String(v).trim();
}
