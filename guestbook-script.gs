/**
 * Guest book for Mazen & Manar's wedding page.
 * Every wish is saved as a row in the "Wishes" tab.
 * Wishes are PRIVATE: the page can only send new wishes, it can never read them.
 */
const SHEET_NAME = 'Wishes';

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(['Time', 'Name', 'Wish']);
    sh.setFrozenRows(1);
  }
  return sh;
}

// Nothing is ever returned to the public
function doGet() {
  return json_({ ok: true });
}

// The page sends a new wish
function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents || '{}');
    if (d.website) return json_({ ok: true });            // spam bot trap
    const name = String(d.name || '').trim().slice(0, 60);
    const message = String(d.message || '').trim().slice(0, 600);
    if (!name || !message) return json_({ ok: false, error: 'empty' });

    const lock = LockService.getScriptLock();
    lock.waitLock(5000);
    sheet_().appendRow([new Date(), safe_(name), safe_(message)]);
    lock.releaseLock();
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false });
  }
}

// Stops text that starts with = + - @ from running as a spreadsheet formula
function safe_(s) { return /^[=+\-@]/.test(s) ? "'" + s : s; }

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
