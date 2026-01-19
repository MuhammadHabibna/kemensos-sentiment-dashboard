"use client";

import * as React from "react";
import dynamic from "next/dynamic";

export type WordCloudWord = { text: string; value: number };

// SSR must be false for react-wordcloud-like libraries to avoid hydration mismatch
const ReactWordcloud = dynamic(() => import("@cp949/react-wordcloud"), {
    ssr: false,
});

type Props = {
    words: WordCloudWord[];
    options?: any;
    onWordClick?: (w: WordCloudWord) => void;
};

export default function WordCloudClient({ words, options, onWordClick }: Props) {
    // Sanitize words: unsafe words (NaN, empty text) can crash the library
    const safeWords = React.useMemo(() => {
        if (!Array.isArray(words)) return [];
        return words
            .filter((w) => w && typeof w.text === "string" && w.text.trim().length > 0)
            .map((w) => ({ text: w.text.trim(), value: Number(w.value) }))
            .filter((w) => Number.isFinite(w.value) && w.value > 0);
    }, [words]);

    // Prevent rendering if no valid words (library might throw or render empty box)
    if (safeWords.length === 0) return null;

    return (
        <ReactWordcloud
            words={safeWords}
            options={options}
            callbacks={
                onWordClick
                    ? { onWordClick: (w: any) => onWordClick(w as WordCloudWord) }
                    : undefined
            }
        />
    );
}
