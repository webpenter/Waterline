import * as migration_20260923_070942_initial from './20260923_070942_initial';
import * as migration_20260923_090000_fix_status_enum from './20260923_090000_fix_status_enum';

export const migrations = [
  {
    up: migration_20260923_070942_initial.up,
    down: migration_20260923_070942_initial.down,
    name: '20260923_070942_initial'
  },
  {
    up: migration_20260923_090000_fix_status_enum.up,
    down: migration_20260923_090000_fix_status_enum.down,
    name: '20260923_090000_fix_status_enum'
  },
];
