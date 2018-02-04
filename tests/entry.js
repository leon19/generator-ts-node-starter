process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.TS_NODE_PROJECT = process.env.TS_NODE_PROJECT || 'tests/tsconfig.json';

require('ts-node/register');

// require chai plugins or mocha specific files here...
