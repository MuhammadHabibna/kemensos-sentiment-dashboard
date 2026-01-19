# Public Sentiment Viewer (Analisis Sentiment Kemensos)

A modern, interactive web dashboard for visualizing and analyzing public sentiment data (TikTok & YouTube) regarding Kemensos. Built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Key Features

### 1. 📊 Interactive Dashboard
- **KPI Metrics**: Real-time summary of Positive, Neutral, and Negative sentiment distribution.
- **Trend Analysis**: Stacked Area Chart showing comment volume trends over time, broken down by sentiment.
- **Top Insights**: Visual ranking of the most discussed **Topics** and **Aspects** (Issues).
- **Public Sentiment Gauge**: A visual gauge showing the dominant sentiment index.

### 2. ☁️ Advanced WordCloud (Strict Mode)
- **Dual Visualization**: View terms as an interactive Word Cloud or a Top 10 Bar Chart.
- **Strict Data Processing**: Uses offline-preprocessed text (`Text_rf_nostop`) to ensure **zero stopwords** appear in the cloud.
- **Contextual Samples**: Click any word or bar to open a detailed **Modal** showing actual comment samples containing that term.
- **Readability**: While the cloud is generated from cleaned text, the samples display the *original readable text*, with the search term **highlighted**.

### 3. 🔎 Data Exploration
- **Filtering**: Global filters for Date Range, Source (TikTok/YouTube), Sentiment, Topic, and Aspects.
- **Search**: Full-text search capability.
- **Explore Tab**: A paginated, tabular view of the raw dataset with detailed columns.

### 4. 🎨 Modern UI/UX
- **Glassmorphism**: Premium "frosted glass" cards (`backdrop-blur`) on a subtle gradient background.
- **Responsive**: Fully optimized for Desktop and Mobile layouts.
- **Animations**: Smooth transitions using Framer Motion.

---

## 📂 Project Structure

```bash
├── public/
│   ├── data/                 # Dataset files (05_Final Datasets.csv)
│   └── stopwords/            # Stopword lists (id.txt)
├── src/
│   ├── app/                  # Next.js App Router (Layout, Page, Global CSS)
│   ├── components/
│   │   ├── dashboard/        # Sub-components for the Dashboard tab
│   │   ├── ui/               # Reusable UI components (shadcn/ui compatible)
│   │   ├── DashboardTab.tsx  # Main Dashboard logic & layout
│   │   ├── WordCloudTab.tsx  # WordCloud logic, strict text handling, & charts
│   │   ├── ExploreTab.tsx    # Tabular data view
│   │   └── TermSamplesModal.tsx # Modal for displaying term contexts
│   └── lib/
│       ├── aggregations.ts   # Logic for calculating KPIs, trends, and lists
│       ├── dataLoader.ts     # CSV parsing and type safety
│       ├── nlp.ts            # Tokenization and N-gram utilities
│       ├── types.ts          # TypeScript interfaces (RowData, Filters)
│       └── utils.ts          # Styles utility (cn)
├── tailwind.config.ts        # Tailwind CSS configuration
└── package.json              # Project dependencies
```

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + `tailwindcss-animate`
- **Charts**: Recharts
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Parsing**: PapaParse (CSV)

---

## 🏃‍♂️ Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```

2.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser.

3.  **Build for Production**:
    ```bash
    npm run build
    npm start
    ```

## 📝 Recent Updates
- **Visual Clarity**: Implemented a "Stacked Area Chart" for sentiment trends to prevent misleading comparisons.
- **Strict WordCloud**: Removed client-side stopword processing in favor of a strictly pre-processed column to ensure accuracy.
- **UI Polish**: Enhanced global styling with a stronger gradient background and improved visual hierarchy.
