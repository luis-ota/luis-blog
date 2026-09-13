---
title: the model isn't the bottleneck - retrieval is
date: 2026-05-19
description: building a RAG chat over PDFs and spreadsheets taught me that answers are only as good as the chunks you feed the model.
img: /images/rag-retrieval-quality/cover.jpg
---

You can find the code at: [github.com/luis-ota/rag-ai-chat](https://github.com/luis-ota/rag-ai-chat).

I built a RAG tool: drop in PDFs, CSVs and Excel files, ask questions, get answers with sources. Streamlit front end, LlamaIndex for the pipeline, Gemini (and Llama 3) behind it. I assumed the hard part would be the model. It wasn't. Ninety percent of the quality was decided before the model saw anything.

![Focus](inline.jpg)

## the pipeline is mostly plumbing

Ingest → extract text → chunk → embed → store vectors → retrieve → assemble prompt → generate. The model is one step. The rest is data engineering, and every step leaks quality:

- PDFs are not text. Tables, columns and headers get scrambled by naive extraction.
- Spreadsheets are not documents. A CSV row means nothing without its header, so chunks need context injected.
- Chunking is a trade-off with no universal answer: too big and the model drowns in irrelevant text; too small and a single idea gets cut in half.

## retrieval has its own debugging

You can't improve what you can't measure. So I built a small set of questions with known answers and checked, for each one, whether the right chunks were even retrieved. That step is uncomfortable and boring and it found most of my bugs:

- embeddings from the wrong model version mixed with old data,
- metadata filters ignored when querying,
- similarity alone when keyword overlap would have been better (hybrid search exists for a reason).

When retrieval fails, the model doesn't fail - it *improvises*. And improvised answers sound great, which is worse.

## teaching it to say "I don't know"

The most important prompt-level feature was a rule: if the retrieved context doesn't contain the answer, say so. A grounded system that survives an empty result is more useful than a confident one that invents.

Related: caching. Embeddings and model clients are expensive to initialize; caching them avoided re-processing the same documents on every Streamlit re-run and made the tool feel instant.

## what I took from this

- RAG quality is retrieval quality. Evaluate retrieval separately from generation.
- Chunking is a product decision: what is "one idea" in your domain?
- Sources shown in the UI are not decoration - they're how users (and you) verify the system.
- "I don't know" is a feature. Design for it early.

The demo is easy. Making it trustworthy is the project.

## image credits

- cover: [Fung Ping Shan Library Book Shelves](https://commons.wikimedia.org/w/index.php?curid=108987604) by Kindrewlck (by-sa 4.0)
- image: [Focus](https://www.flickr.com/photos/42408834@N06/4546017269) by toolstop (by 2.0)
