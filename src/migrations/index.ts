import * as migration_20260923_070942_initial from './20260923_070942_initial';

export const migrations = [
  {
    up: migration_20260923_070942_initial.up,
    down: migration_20260923_070942_initial.down,
    name: '20260923_070942_initial'
  },
];
