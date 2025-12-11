const z = require('zod/v4');

const textLengthToolInstructions = [
  'Use estimate-text-length-difference to compare original vs translated text lengths and flag large deltas.',
  'Configure tolerancePercent to set the allowed absolute percentage difference (default 30%).',
  'The tool reports both lengths, percent change, and whether the change exceeds tolerance.'
].join('\n');

const lengthDiffInputSchema = z.object({
  sourceText: z.string().min(1).describe('Original text before translation'),
  translatedText: z.string().min(1).describe('Translated text to compare against the original'),
  tolerancePercent: z
    .number()
    .min(1)
    .max(500)
    .default(30)
    .describe('Allowed absolute percent difference between lengths before flagging risk')
});

function measureLength(text) {
  return Array.from(text).length;
}

function registerTextLengthTool(server) {
  server.registerTool(
    'estimate-text-length-difference',
    {
      title: 'Estimate text length difference',
      description:
        'Compare original and translated text lengths to detect layout risk; configurable tolerancePercent (default 30%).',
      inputSchema: lengthDiffInputSchema
    },
    async params => {
      const sourceLength = measureLength(params.sourceText);
      const translatedLength = measureLength(params.translatedText);
      const delta = translatedLength - sourceLength;
      const percentChange = sourceLength === 0 ? null : (delta / sourceLength) * 100;
      const exceeds =
        percentChange === null ? translatedLength > 0 : Math.abs(percentChange) > params.tolerancePercent;
      const direction = delta === 0 ? 'no change' : delta > 0 ? 'longer' : 'shorter';

      const verdict =
        percentChange === null && translatedLength === 0
          ? '✅ Both texts are empty; no length risk.'
          : percentChange === null
            ? '⚠️ Source length is 0; percent change undefined and translated text is present.'
            : exceeds
              ? '⚠️ Length difference exceeds tolerance (layout risk likely).'
              : '✅ Length difference within tolerance.';

      const summary = [
        verdict,
        `Source length: ${sourceLength}`,
        `Translated length: ${translatedLength}`,
        percentChange === null
          ? `Change: N/A (source length is 0; direction: ${direction})`
          : `Change: ${percentChange.toFixed(2)}% (${direction})`,
        `Tolerance: ±${params.tolerancePercent}%`
      ].join('\n');

      return { content: [{ type: 'text', text: summary }] };
    }
  );
}

module.exports = {
  registerTextLengthTool,
  textLengthToolInstructions
};
