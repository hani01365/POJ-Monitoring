/**
 * Template kode Google Apps Script untuk menerima data dari POJ Monitoring
 * dan menyimpannya langsung ke Google Spreadsheet.
 */

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * POJ MONITORING - GOOGLE APPS SCRIPT WEBHOOK & DRIVE INTEGRATION
 * 
 * ============================================================================
 * SOLUSI: "Error Drive: Anda tidak memiliki izin untuk memanggil DriveApp"
 * ============================================================================
 * Karena script ini menggunakan Google Drive untuk menyimpan foto, Google
 * mewajibkan Anda menyetujui izin (Authorize) SEKALI lewat tombol "Run":
 * 
 * 1. Simpan kode ini di Apps Script (ikon Disket atau Ctrl+S).
 * 2. Di toolbar atas editor Apps Script (sebelah tombol "Debug"), ubah pilihan fungsi menjadi:
 *    "beriIzinAksesDrive"
 * 3. Klik tombol "Run" (atau "Jalankan" ▶️).
 * 4. Akan muncul popup "Authorization Required" (Otorisasi Diperlukan):
 *    - Klik "Review Permissions" / "Tinjau Izin"
 *    - Pilih akun Google Anda (hanifah.ramadini@astronauts.id)
 *    - Jika muncul peringatan keamanan, klik "Advanced" (Lanjutan) > klik "Go to ... (unsafe)"
 *    - Klik "Allow" / "Izinkan".
 * 5. Setelah selesai diizinkan, perbarui deployment Web App:
 *    - Klik "Deploy" > "Manage deployments"
 *    - Klik ikon pensil ✏️ (Edit)
 *    - Pada opsi Version, pilih "New version"
 *    - Klik "Deploy". Selesai!
 */

// Jalankan fungsi ini di editor Apps Script dengan klik Run ▶️ untuk menyetujui izin TULIS Google Drive
function beriIzinAksesDrive() {
  var folderId = "1SZQPwZLTQM1yszL1giQFZnkG4hUKt6go";
  var folder = DriveApp.getFolderById(folderId);
  
  // Wajib panggil createFile di sini agar Google meminta izin TULIS (https://www.googleapis.com/auth/drive)
  var testFile = folder.createFile("tes_izin_akses.txt", "Izin berhasil aktif!", MimeType.PLAIN_TEXT);
  testFile.setTrashed(true); // Langsung hapus file tes ke sampah agar folder tetap bersih
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  Logger.log("✅ SUKSES TOTAL! Izin Tulis/Simpan Google Drive & Spreadsheet BERHASIL aktif.");
}

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

    // Persiapkan folder Google Drive untuk foto (Folder ID spesifik)
    var TARGET_FOLDER_ID = "1SZQPwZLTQM1yszL1giQFZnkG4hUKt6go";
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
            try {
              photoFolder = DriveApp.getFolderById(TARGET_FOLDER_ID);
            } catch (folderErr) {
              var folders = DriveApp.getFoldersByName("POJ_Dokumentasi_Foto");
              photoFolder = folders.hasNext() ? folders.next() : DriveApp.createFolder("POJ_Dokumentasi_Foto");
            }
          }

          var base64Content = p.photoBase64.indexOf("base64,") !== -1 
            ? p.photoBase64.split("base64,")[1] 
            : p.photoBase64;

          var decodedBlob = Utilities.newBlob(
            Utilities.base64Decode(base64Content),
            "image/jpeg",
            "POJ_" + (p.staffId || "peserta") + "_" + (new Date().getTime()) + ".jpg"
          );

          var driveFile = photoFolder.createFile(decodedBlob);
          
          // Coba set sharing link (abaikan error jika domain Google Workspace membatasi sharing luar)
          try {
            driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
          } catch (shareErr) {
            try {
              driveFile.setSharing(DriveApp.Access.DOMAIN_WITH_LINK, DriveApp.Permission.VIEW);
            } catch (domainErr) {
              // Tetap lanjut, file tetap tersimpan di Drive pemilik
            }
          }

          var fileUrl = driveFile.getUrl();
          // Simpan link Google Drive langsung tanpa diubah formatnya
          fotoCell = fileUrl;
        } catch (driveErr) {
          fotoCell = "Error Drive: " + (driveErr.message || driveErr.toString());
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
