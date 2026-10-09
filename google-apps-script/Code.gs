/**
 * AERVION DRONETECH SOLUTIONS PVT. LTD. - Contact Form -> Google Sheet
 *
 * Paste this into the Google Sheet's Extensions > Apps Script editor and deploy it as a Web app.
 * The website (js/contact.js) POSTs the form fields here and each submission becomes a new row.
 */

const SHEET_NAME = 'Enquiries';

// Optional: put your email here to get a notification for every new enquiry. Leave '' to disable.
const NOTIFY_EMAIL = '';

// Form field name -> column header. Order here is the column order in the sheet.
const COLUMNS = [
  ['timestamp', 'Timestamp'],
  ['fullName', 'Full Name / Organization'],
  ['email', 'Email'],
  ['phone', 'Phone'],
  ['serviceType', 'Service Required'],
  ['message', 'Project Overview & Location'],
  ['page', 'Submitted From'],
];

function doPost(e) {
  const params = (e && e.parameter) || {};

  // Honeypot filled in -> a bot. Pretend success so it doesn't retry.
  if (params.website) return jsonResponse({ result: 'success' });

  const required = ['fullName', 'email', 'phone', 'serviceType', 'message'];
  const missing = required.filter((field) => !String(params[field] || '').trim());
  if (missing.length) {
    return jsonResponse({ result: 'error', error: 'Missing fields: ' + missing.join(', ') });
  }

  // Lock so two submissions at the same moment don't overwrite the same row
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);

    const sheet = getSheet();
    const row = COLUMNS.map(([field]) =>
      field === 'timestamp' ? new Date() : clean(params[field])
    );
    sheet.appendRow(row);

    if (NOTIFY_EMAIL) sendNotification(params);

    return jsonResponse({ result: 'success' });
  } catch (err) {
    return jsonResponse({ result: 'error', error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Lets you open the Web app URL in a browser to check that the deployment is live
function doGet() {
  return jsonResponse({ result: 'ok', message: 'Aervion contact form endpoint is running.' });
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS.map(([, header]) => header));
    sheet.getRange(1, 1, 1, COLUMNS.length)
      .setFontWeight('bold')
      .setBackground('#0066ff')
      .setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Trim, cap length, and stop values like "+91..." or "=HYPERLINK(...)" being treated as formulas
function clean(value) {
  let text = String(value || '').trim().slice(0, 5000);
  if (/^[=+\-@]/.test(text)) text = "'" + text;
  return text;
}

function sendNotification(params) {
  const lines = COLUMNS
    .filter(([field]) => field !== 'timestamp')
    .map(([field, header]) => header + ': ' + String(params[field] || '').trim());

  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    replyTo: String(params.email || '').trim(),
    subject: 'New Quote Request - ' + String(params.serviceType || '').trim(),
    body: 'New enquiry from the Aervion website:\n\n' + lines.join('\n') +
      '\n\nOpen the sheet: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl(),
  });
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
