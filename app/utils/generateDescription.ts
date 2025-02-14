import { pipeline } from '@huggingface/transformers';

const summarizer = await pipeline(
    'summarization', 
    'Falconsai/text_summarization',
  // { device: "webgpu" },
);

/**
 * Generates a summary of the provided text.
 *
 * @param {string} content - The text to summarize.
 * @returns {Promise<string>} - A promise that resolves to the summarized text.
 */
export const generateDescription = async (content: string) => {
  // Adjust these parameters as needed for the desired summary length.
  const result = await summarizer(content);
  // The summarizer returns an array; the summary is in the "summary_text" property.
  // console.log('res: ', result);
  return result[0].summary_text ;
};
