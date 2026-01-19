export interface RawCsvRow {
  Topik: string;
  Sumber: string;
  sentiment: string;
  Text_rf: string;
  Aspect_1: string;
  Aspect_2: string;
  aspect_score: string | number;
  Aspect_1_matched_keywords: string;
  Aspect_2_matched_keywords: string;
  Date_std: string;
  Text_rf_nostop?: string; // Preprocessed text (no stopwords)
}

export interface RowData {
  id: number;
  topic: string; // Topik
  source: string; // Sumber
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  text: string; // Text_rf
  textNoStop: string; // Text_rf_nostop (fallback to text if missing)
  aspect1: string; // Aspect_1
  aspect2: string | null; // Aspect_2
  aspectScore: number;
  aspect1Keywords: string[];
  aspect2Keywords: string[];
  date: Date;
  dateStr: string; // YYYY-MM-DD
}

export interface GlobalFilterState {
  source: string; // "All", "TikTok", "YouTube"
  dateRange: { from?: Date; to?: Date };
  topic: string; // "All" or specific
  sentiment: string; // "All", "Positive", "Neutral", "Negative"
  aspect: string; // "All" or specific
  hideUmum: boolean;
  minAspectScore: number;
  searchQuery: string;
}
