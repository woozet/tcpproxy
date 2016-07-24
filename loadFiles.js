'use strict';

let fs = require('fs'),
    path = require('path'),
    yaml = require('js-yaml');

module.exports = function loadFiles(dir) {
    return fs.readdirSync(dir)
        .filter(file => {
            const filePath = path.resolve(dir, file);
            const stats = fs.lstatSync(filePath);
            return stats.isFile() && /\.ya?ml$/.test(filePath);
        })
        .map(file => {
            const filePath = path.resolve(dir, file);
            try {
                return { name: file, json: yaml.load(fs.readFileSync(filePath, 'utf-8')) };
            } catch (e) {
                throw Error(`ERROR, while loading ${file}` + e);
            }
        });
};
