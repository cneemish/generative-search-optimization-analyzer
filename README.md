# GEO & SEO Analyzer

A Next.js application that performs Generative Engine Optimization (GEO) and Search Engine Optimization (SEO) analysis by calling the Gemini and OpenAI (ChatGPT) APIs to provide a two-model comparison and recommendations.

## Features

- **Dual AI Analysis**: Get insights from both Google Gemini and OpenAI (ChatGPT) models
- **GEO & SEO Recommendations**: Receive actionable recommendations for optimizing your website for AI-powered search and traditional search engines
- **On-Page SEO Audit**: Comprehensive analysis of on-page SEO elements
- **Modern UI**: Built with Next.js, React, and Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Google Gemini API key
- OpenAI API key

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd generative-search-optimization-analyzer
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Enter a user query/question
2. Provide target keywords for SEO optimization
3. Enter the website URL you want to analyze
4. Click "Analyze GEO & SEO" to get recommendations from both AI models

## Tech Stack

- **Framework**: Next.js 16.0.1
- **UI Library**: React 19.2.0
- **Styling**: Tailwind CSS 4.1.16
- **AI APIs**:
  - Google Gemini API (@google/genai)
  - OpenAI API
- **Markdown**: react-markdown with remark-gfm

## Project Structure

```
generative-search-optimization-analyzer/
├── components/          # React components
│   ├── searchInput.tsx  # Form component
│   ├── searchResult.tsx # Results display
│   ├── errorMessage.tsx # Error component
│   └── loadingSpinner.tsx
├── pages/
│   ├── api/
│   │   └── analyze.ts   # API route handler
│   ├── index.tsx        # Home page
│   └── _app.tsx         # App wrapper
├── styles/
│   └── globals.css      # Global styles
└── types/
    └── types.ts         # TypeScript types
```

## Building for Production

```bash
npm run build
npm start
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Google Gemini](https://ai.google.dev/) - AI model
- [OpenAI](https://openai.com/) - AI model
