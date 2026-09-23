import * as migration_20260923_084953_initial from './20260923_084953_initial';

export const migrations = [
  {
    up: migration_20260923_084953_initial.up,
    down: migration_20260923_084953_initial.down,
    name: '20260923_084953_initial'
  },
];
