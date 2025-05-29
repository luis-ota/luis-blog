"use client";

import { useEffect, useState } from "react";

type Language = { code: string; label: string };

const languages: Language[] = [
  { code: "pt", label: "ptbr" },
  { code: "de", label: "deutsch" },
  { code: "zh-CN", label: "中文" },
  { code: "ja", label: "日本語" },
  { code: "ru", label: "russian" },
  { code: "th", label: "thai" },
];

type Props = {
  encodedUrl: string;
};

export default function LanguageSwitcher({ encodedUrl }: Props) {
  const [hide, setHide] = useState(false);

  useEffect(() => {
    const inIframe = window.location !== window.parent.location;
    const referrerIsGoogleTranslate = document.referrer.includes(
      "translate.google.com",
    );
    const urlHasTranslate = window.location.href.includes("translate.goog");

    if (inIframe || referrerIsGoogleTranslate || urlHasTranslate) {
      setHide(true);
    }
  }, []);

  if (hide) return null;

  return (
    <div className="flex justify-between flex-row gap-2 items-center flex-wrap">
      {languages.map((lang) => (
        <a
          key={lang.code}
          href={`https://translate.google.com/website?sl=en&tl=${lang.code}&u=${encodedUrl}`}
          rel="noopener noreferrer"
          className="flex items-center markdown-body gap-2 px-4 py-2 rounded transition"
        >
          {lang.label}
        </a>
      ))}
    </div>
  );
}
