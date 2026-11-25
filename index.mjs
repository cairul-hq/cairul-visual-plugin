import { check, count, error, readProjectFile, text, verdict, z } from '@cairul/plugin-kit';

const reportSchema = z.object({ comparisons: z.array(z.object({ differentPixels: count })).min(1) });

export default function visual() {
  return {
    checkKinds: {
      'visual.pixel-diff': check(
        z.strictObject({ report: text, maximum: count.default(0) }),
        async ({ report, maximum }, { projectDir, signal }) => {
          try {
            const { comparisons } = reportSchema.parse(JSON.parse(await readProjectFile(projectDir, report, signal)));
            const failed = comparisons.filter(({ differentPixels }) => differentPixels > maximum).length;
            return verdict(
              failed === 0,
              `${failed} of ${comparisons.length} images exceeded ${maximum} changed pixels.`
            );
          } catch (cause) {
            return cause?.code === 'ENOENT'
              ? verdict(false, 'Waiting for visual comparison report.')
              : error('Visual comparison report is unreadable or invalid.');
          }
        }
      ),
    },
  };
}
