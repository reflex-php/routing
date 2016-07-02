import babel from 'rollup-plugin-babel';
import rollupIncludePaths from 'rollup-plugin-includepaths';

const includePathOptions = {
    paths: ['src']
};

export default {
    entry: 'src/index.js',
    dest: 'dist/router.js',
    format: 'iife',
    moduleName: 'Router',
    plugins: [
        babel({
            exclude: 'node_modules/**'
        }),
        rollupIncludePaths(includePathOptions)
    ]
};