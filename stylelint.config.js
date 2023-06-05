module.exports = {
    overrides: [
        {
            files: ['**/*.less'],
            customSyntax: 'postcss-less',
        },
    ],
    extends: ['stylelint-config-standard', 'stylelint-config-prettier', 'stylelint-config-idiomatic-order'],
    plugins: ['stylelint-order'],

    // add your custom config here
    // https://stylelint.io/user-guide/configuration
    rules: {
        'no-descending-specificity': null,

        // 不能注释掉
        'selector-class-pattern': null,
    },
    ignoreFiles: ['**/*.css'],
};
