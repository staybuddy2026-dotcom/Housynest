// Free Google Translate API Helper with Line-by-Line Chunking (Fixes HTTP 414 Request Too Large)
export const translateWithGoogleFreeApi = async (text, targetLang = 'gu', sourceLang = 'en') => {
  if (!text || !text.trim()) return '';

  // Protect placeholder tags like [tenant_full_name]
  const tagMap = [];
  let protectedText = text.replace(/(\[[a-z_]+\])/gi, (match) => {
    const key = `__TAG_${tagMap.length}__`;
    tagMap.push({ key, val: match });
    return key;
  });

  // Chunk translation helper (< 1000 chars per GET request)
  const translateChunk = async (chunk) => {
    if (!chunk || !chunk.trim()) return chunk;
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(chunk)}`;
      const response = await fetch(url);
      if (!response.ok) return chunk;
      const data = await response.json();
      if (data && data[0]) {
        return data[0].map(item => item[0]).join('');
      }
    } catch (err) {
      console.warn('Chunk translation error:', err);
    }
    return chunk;
  };

  // Split text by lines to ensure each request URL is short & bulletproof
  const lines = protectedText.split('\n');
  const translatedLines = await Promise.all(
    lines.map(line => translateChunk(line))
  );

  let translated = translatedLines.join('\n');

  // Restore protected placeholder tags
  tagMap.forEach(item => {
    translated = translated.replace(new RegExp(item.key, 'g'), item.val);
  });

  return translated;
};
