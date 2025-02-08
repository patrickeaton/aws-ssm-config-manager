import rollupConfig from './rollup.config';
import analyze from 'rollup-plugin-analyzer';


export default {
  ...rollupConfig,
  plugins: [
    analyze({
      summaryOnly: true,
      limit: 10,
    }),
    ...rollupConfig.plugins,
  ],
};
