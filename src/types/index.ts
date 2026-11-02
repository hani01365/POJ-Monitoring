export interface TrainerData {
  nama: string;
  staffId: string;
  lokasi: string;
  tanggal: string;
}

export type ScoreStatus = 'Sesuai' | 'Tidak Sesuai' | 'N/A';

export interface CriterionConfig {
  id: string;
  number: number;
  title: string;
  shortLabel: string;
  description: string;
  options: ScoreStatus[];
  naExplanation?: string;
}

export interface Participant {
  id: string;
  name: string;
  staffId: string;
}

export interface ParticipantEvaluation {
  participantId: string;
  name: string;
  staffId: string;
  scores: Record<string, ScoreStatus | undefined>;
  notes: string;
  photoBase64?: string;
  photoTimestamp?: string;
}

export interface POJSubmission {
  id: string;
  timestamp: string;
  role: 'Picker';
  type: 'Packing';
  trainer: TrainerData;
  participants: ParticipantEvaluation[];
  summary: {
    totalParticipants: number;
    allPassedCount: number;
    needImprovementCount: number;
  };
  syncedToWebhook: boolean;
  webhookResponse?: string;
}

export const PACKING_CRITERIA: CriterionConfig[] = [
  {
    id: 'weight_hierarchy',
    number: 1,
    title: 'Urutan Tumpukan Barang (Weight Hierarchy)',
    shortLabel: 'Weight Hierarchy',
    description: 'Posisi paling bawah adalah barang terberat hingga barang tersusul paling ringan di bagian atas.',
    options: ['Sesuai', 'Tidak Sesuai']
  },
  {
    id: 'food_nonfood_separation',
    number: 2,
    title: 'Inner Packaging: Pemisahan Food & Non-Food',
    shortLabel: 'Pemisahan Food & Non-Food',
    description: 'Kelompok barang (food vs non-food) yang jumlahnya lebih sedikit dimasukkan ke dalam plastik emboss.',
    options: ['Sesuai', 'Tidak Sesuai', 'N/A'],
    naExplanation: 'Tidak ada item gabungan food/non-food dalam paket simulasi'
  },
  {
    id: 'ice_pack',
    number: 3,
    title: 'Penggunaan Ice Pack (Frozen Product)',
    shortLabel: 'Ice Pack Frozen',
    description: 'Menyertakan Ice Pack secara tepat pada kemasan produk berkategori Frozen.',
    options: ['Sesuai', 'Tidak Sesuai', 'N/A'],
    naExplanation: 'Tidak ada item frozen dalam paket simulasi'
  },
  {
    id: 'fragile_handling',
    number: 4,
    title: 'Penanganan Barang Pecah Belah (Fragile Handling)',
    shortLabel: 'Barang Pecah Belah',
    description: 'Menggunakan Bubble Wrap untuk membungkus produk pecah belah, seperti telur, botol kaca (saus/sirup), atau jar kaca sebelum dimasukkan ke kantong/kardus.',
    options: ['Sesuai', 'Tidak Sesuai', 'N/A'],
    naExplanation: 'Tidak ada item pecah belah dalam paket simulasi'
  },
  {
    id: 'barcode_resi_bulky',
    number: 5,
    title: 'Penempelan Resi Paket & SKU Bulky',
    shortLabel: 'Resi & SKU Bulky',
    description: 'Menempelkan resi sesuai keterangan kemasan (Paper Bag, Kardus, maupun SKU Bulky seperti Beras 5kg)',
    options: ['Sesuai', 'Tidak Sesuai']
  },
  {
    id: 'sla_packing_time',
    number: 6,
    title: 'Waktu untuk menyelesaikan Packing',
    shortLabel: 'SLA Waktu Packing',
    description: 'Menyelesaikan pengemasan sesuai dengan SLA yang ditentukan',
    options: ['Sesuai', 'Tidak Sesuai']
  }
];

export const ASTRO_HUB_LIST: string[] = [
  'APR - Ampera',
  'ASA - New Alam Sutera',
  'BBK - Bubulak',
  'BDC - BSD City',
  'BGS - Boulevard Gading Serpong',
  'BKJ - Bekasi Jaya',
  'BNH - Bendungan Hilir',
  'BRY - Buncit Raya',
  'BS9 - Bintaro Sektor 9',
  'BSX - New BSD',
  'CAM - Caman',
  'CGS - Cimanggis',
  'CLN - Cilandak',
  'CNR - Cinere',
  'CPT - Cipete',
  'CSA - Cisauk',
  'CT2 - Citra 2',
  'CWG - Cawang',
  'DNS - Danau Sunter',
  'DST - Duren Sawit',
  'FTW - Fatmawati',
  'GDC - Grand Depok City',
  'GMD - New Gajah Mada',
  'GNS - Gunung Sahari',
  'GPL - Gudang Peluru',
  'GWB - Grand Wisata Bekasi',
  'HBD - Kelapa Hybrida',
  'JBG - Jombang',
  'JLB - Jelambar',
  'JTG - Jatirangon',
  'JTI - Jatibening New',
  'JTN - Jatinegara',
  'KGS - Kemanggisan',
  'KJT - Kramat Jati',
  'KLD - Kelapa Dua',
  'KLN - Klender',
  'KPM - Kapuk Muara',
  'LBB - Lebak Bulus',
  'LIM - Limo',
  'MDL - Menteng Dalam',
  'MGR - Manggarai',
  'MMP - Mampang Perapatan',
  'MRG - Margonda',
  'MRY - Meruya',
  'MSB - Medan Satria Bekasi',
  'MTG - Menteng',
  'PAM - Pamulang',
  'PBT - Pondok Betung',
  'PGD - Pulo Gadung',
  'PHW - Pahlawan',
  'PIN - New Pondok Indah',
  'PKC - Pondok Kacang',
  'PLB - Pluit Barat',
  'PPL - Panglima Polim',
  'PPN - Pos Pengumben',
  'PSG - Pisangan',
  'RDS - Raden Saleh',
  'RWB - Rawa Bambu',
  'SAL - Salemba',
  'SKR - Sukaraja',
  'SLP - Slipi',
  'SMN - Semanan',
  'SRP - Serpong Utara',
  'SWG - Sawangan',
  'SWL - Sawah Lama',
  'TAP - New Taman Palem',
  'TDN - Tendean',
  'TGX - New TGC',
  'TSY - Transyogi'
];

