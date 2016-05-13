import babel from 'rollup-plugin-babel';
import rollupIncludePaths from 'rollup-plugin-includepaths';

const includePathOptions = {
    paths: ['src']
};

export default {
    entry: 'src/index.js',
    dest: 'lib/main.js',
    format: 'cjs',
    // moduleName: 'Router',
    plugins: [
        babel({
            exclude: 'node_modules/**'
        }),
        rollupIncludePaths(includePathOptions)
    ]
};