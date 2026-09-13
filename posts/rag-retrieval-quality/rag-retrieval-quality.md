---
title: the model isn't the bottleneck - retrieval is
date: 2026-05-19
description: building a RAG chat over PDFs and spreadsheets taught me that answers are only as good as the chunks you feed the model.
img: /images/rag-retrieval-quality/cover.jpg
---

You can find the code at: [github.com/luis-ota/rag-ai-chat](https://github.com/luis-ota/rag-ai-chat).

retrieval evaluation report

![University of Michigan Library Card Catalog](inline.jpg)

project: rag chat over personal documents (streamlit + llamaindex + gemini)
subject: why answers were bad even when the model was excellent

---

## methodology

i wrote 24 questions whose answers existed in the corpus, plus 8 whose answers did not exist anywhere in it. for each, i recorded:

- **hit** : were the correct chunks retrieved?
- **rank** : position of the first correct chunk,
- **answer** : did the final response match the source honestly?

24 + 8 is not a benchmark. it is enough to stop guessing.

---

## findings, by failure type

| failure | frequency | root cause | fix |
|---|---|---|---|
| correct chunk never retrieved | 6/24 | chunks split mid-idea | larger chunks with heading context |
| correct chunk at rank 9+ | 4/24 | pure vector search, rare words | hybrid: add keyword overlap |
| answer invented details | 5/32 | model improvising without grounding | explicit "say you don't know" rule |
| right text, wrong file cited | 3/24 | metadata not attached to chunks | carry source metadata in every chunk |
| spreadsheet rows meaningless | 3/24 | csv rows without headers in chunk | inject header line per chunk |
| pdf tables scrambled | 2/24 | naive text extraction | accept as limitation, flag in ui |

the first column is the whole report. **retrieval, not generation, was responsible for 19 of 32 failures.**

---

## observations

**chunking is the product decision.** "what is one idea in this corpus?" has no library answer. for prose, ~500 tokens with overlap worked. for spreadsheets, one row per chunk with the header prepended. for pdfs with tables, nothing worked well and the ui now says so.

**the model was fine.** every time i blamed gemini, i was wrong. the model answered skillfully from bad context, which is precisely what makes bad retrieval dangerous: the output looks authoritative.

**"i don't know" is testable.** the 8 unanswerable questions either returned an honest refusal or an invention. after the prompt rule, inventions went to zero and refusals went to 8/8.

**caching matters for iteration speed.** embeddings and model clients were being rebuilt on every streamlit re-run. caching them turned a 40-second loop into a 4-second loop, which is the difference between testing retrieval properly and not testing it at all.

---

## actions taken

1. rewrote the chunker with structure-aware splitting.
2. added hybrid search (vectors + keyword).
3. attached source metadata to every chunk, surfaced in the ui.
4. prompt rule: answer only from context, otherwise say it cannot be answered.
5. cached embeddings and clients.

post-fix rerun: hit rate 24/24, invented answers 0/32. the model never changed.

---

## appendix: the question i keep asking

when an ai product disappoints, the first question should be "what did we feed it?", not "which model?". in this project the answer was worth two weeks of work and a completely rewritten pipeline. the generation layer was already good enough on day one.

## image credits

- cover: [Fung Ping Shan Library Book Shelves](https://commons.wikimedia.org/w/index.php?curid=108987604) by Kindrewlck (by-sa 4.0)
- image: [Focus](https://www.flickr.com/photos/42408834@N06/4546017269) by toolstop (by 2.0)
