/**
 * Template kode Google Apps Script untuk menerima data dari POJ Monitoring
 * dan menyimpannya langsung ke Google Spreadsheet.
 */

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * POJ MONITORING - GOOGLE APPS SCRIPT WEBHOOK
 * 
 * Petunjuk Pemasangan:
 * 1. Buka Google Sheets baru atau yang sudah ada (misal bernama "Data Evaluasi POJ").
 * 2. Klik menu "Extensions" > "Apps Script".
 * 3. Hapus semua kode yang ada di editor, lalu PASTE kode di bawah ini.
 * 4. Klik ikon "Save" (Disket) atau tekan Ctrl+S.
 * 5. Klik tombol "Deploy" di kanan atas > pilih "New deployment".
 * 6. Klik ikon gerigi (Select type) > pilih "Web app".
 * 7. Isi konfigurasi:
 *    - Description: POJ Monitoring Webhook
 *    - Execute as: "Me" (email akun Anda)
 *    - Who has access: "Anyone" (PENTING: Harus Anyone agar webapp bisa mengirim data tanpa login)
 * 8. Klik "Deploy", lalu berikan izin akses (Authorize access).
 * 9. Salin "Web app URL" (format: https://script.google.com/macros/s/.../exec).
 * 10. Tempelkan URL tersebut ke kolom Webhook Settings di aplikasi POJ Monitoring.
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  // Lock untuk mencegah race-condition saat ada pengiriman bersamaan
  lock.tryLock(10000);

  try {
    var rawData = e.postData ? e.postData.contents : "{}";
    var data = JSON.parse(rawData);

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName = "POJ_Packing_Evaluations";
    var sheet = ss.getSheetByName(sheetName);

    var headers = [
      "Timestamp Submission",
      "Nama Trainer",
      "Staff ID Trainer",
      "Lokasi POJ",
      "Tanggal POJ",
      "Nama Peserta",
      "Staff ID Peserta",
      "1. Urutan Tumpukan",
      "2. Food & Non-Food",
      "3. Ice Pack Frozen",
      "4. Fragile Handling",
      "5. Resi & SKU Bulky",
      "6. SLA Waktu",
      "Hasil Akhir",
      "Catatan Trainer",
      "Foto Dokumentasi"
    ];

    // Buat sheet baru jika belum ada
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(headers);
      
      // Format Header
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#0F172A");
      headerRange.setFontColor("#FFFFFF");
      headerRange.setFontWeight("bold");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    } else {
      // Jika sheet sudah ada sebelumnya tapi belum ada Kolom 16 (Foto Dokumentasi),
      // otomatis tambahkan header ke Kolom 16 (Kolom P)
      if (sheet.getRange(1, 16).getValue() === "") {
        var header16 = sheet.getRange(1, 16);
        header16.setValue("Foto Dokumentasi");
        header16.setBackground("#0F172A");
        header16.setFontColor("#FFFFFF");
        header16.setFontWeight("bold");
        header16.setHorizontalAlignment("center");
      }
    }

    var trainer = data.trainer || {};
    var participants = data.participants || [];
    var submissionTimestamp = data.timestamp || new Date().toISOString();
    var rowsAppended = 0;

    // Persiapkan folder Google Drive untuk foto jika ada data gambar
    var photoFolder = null;

    participants.forEach(function(p) {
      var scores = p.scores || {};
      
      // Hitung apakah Lulus atau Perlu Bimbingan
      var hasNotCompliant = Object.keys(scores).some(function(k) {
        return scores[k] === "Tidak Sesuai";
      });
      var statusAkhir = hasNotCompliant ? "Perlu Bimbingan" : "Lulus / Sesuai SOP";

      // Proses foto jika dikirimkan (Base64)
      var fotoCell = "-";
      if (p.photoBase64 && typeof p.photoBase64 === "string" && p.photoBase64.indexOf("base64,") !== -1) {
        try {
          if (!photoFolder) {
            var folders = DriveApp.getFoldersByName("POJ_Dokumentasi_Foto");
            if (folders.hasNext()) {
              photoFolder = folders.next();
            } else {
              photoFolder = DriveApp.createFolder("POJ_Dokumentasi_Foto");
            }
          }

          var base64Content = p.photoBase64.split("base64,")[1];
          var decodedBlob = Utilities.newBlob(
            Utilities.base64Decode(base64Content),
            "image/jpeg",
            "POJ_" + (p.staffId || "peserta") + "_" + (new Date().getTime()) + ".jpg"
          );

          var driveFile = photoFolder.createFile(decodedBlob);
          driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
          var fileUrl = driveFile.getUrl();
          fotoCell = '=HYPERLINK("' + fileUrl + '", "Lihat Foto")';
        } catch (driveErr) {
          fotoCell = "Foto Tersimpan (" + (p.photoBase64.length > 500 ? "Base64 OK" : "Tersedia") + ")";
        }
      }

      var rowData = [
        submissionTimestamp,
        trainer.nama || "-",
        "'" + (trainer.staffId || "-"),
        trainer.lokasi || "-",
        trainer.tanggal || "-",
        p.name || "-",
        "'" + (p.staffId || "-"),
        scores.weight_hierarchy || "N/A",
        scores.food_nonfood_separation || "N/A",
        scores.ice_pack || "N/A",
        scores.fragile_handling || "N/A",
        scores.barcode_resi_bulky || "N/A",
        scores.sla_packing_time || "N/A",
        statusAkhir,
        p.notes || "-",
        fotoCell
      ];

      sheet.appendRow(rowData);
      rowsAppended++;
    });

    // Auto-resize kolom agar rapi
    for (var col = 1; col <= 16; col++) {
      sheet.autoResizeColumn(col);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Berhasil mencatat " + rowsAppended + " data evaluasi POJ",
      rowsAdded: rowsAppended,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "ok",
    service: "POJ Monitoring Webhook Service",
    message: "Endpoint aktif dan siap menerima data POST dari webapp POJ Monitoring."
  })).setMimeType(ContentService.MimeType.JSON);
}
`;
