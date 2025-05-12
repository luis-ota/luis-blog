"use client"; 
import React, { useEffect, useRef } from 'react';

type UtterancesProps = {
  repo: string;
  issueTerm?: string; 
  theme?: string;    
  label?: string;    
};

const UtterancesComments: React.FC<UtterancesProps> = ({
  repo,
  issueTerm = "pathname", 
  theme = "preferred-color-scheme",
  label
}) => {
  const commentsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scriptEl = document.createElement('script');
    scriptEl.src = "https://utteranc.es/client.js";
    scriptEl.async = true;
    scriptEl.setAttribute('repo', repo);
    scriptEl.setAttribute('issue-term', issueTerm);
    scriptEl.setAttribute('theme', theme);
    if (label) {
      scriptEl.setAttribute('label', label);
    }
    scriptEl.setAttribute('crossorigin', 'anonymous');

    const container = commentsContainerRef.current;
    if (container) {
      container.appendChild(scriptEl);
    }

    return () => {
      if (container) {
        const iframe = container.querySelector('iframe.utterances-frame');
        if (iframe) {
          container.removeChild(iframe);
        }
        if (scriptEl.parentNode === container) {
          container.removeChild(scriptEl);
        }
      }
    };
  }, [repo, issueTerm, theme, label]); 

  return <div ref={commentsContainerRef} id="utterances-comments-container" />;
};

export default UtterancesComments;