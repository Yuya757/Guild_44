const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the project and node_modules directories
const projectRoot = __dirname;
const nodeModulesPaths = [path.resolve(projectRoot, 'node_modules')];

const config = getDefaultConfig(__dirname);

// 1. Watch all files within the monorepo
config.watchFolders = [projectRoot, ...nodeModulesPaths];

// 2. Ensure modules correctly resolve to dependencies from node_modules
config.resolver.nodeModulesPaths = nodeModulesPaths;

// 3. Force Metro to resolve (sub)dependencies only from the node_modules
config.resolver.disableHierarchicalLookup = true;

module.exports = config; 