import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { tool } from '@server/registry/tool-builder';

export const sharedStateBoardTools: Tool[] = [
  tool('state_board', (t) =>
    t
      .desc('Manage shared state board entries.')
      .enum('action', ['set', 'get', 'delete', 'list', 'history', 'clear'], 'Operation to perform')
      .string('key', 'Key name (required for set/get/delete/history)')
      .prop('value', {
        type: 'object',
        description: 'Value to store',
      })
      .string('namespace', 'Namespace for key isolation')
      .number('ttlSeconds', 'TTL in seconds')
      .boolean('includeValues', 'Include current values in list results', {
        default: false,
      })
      .number('limit', 'Maximum history entries to return', { default: 50 })
      .string('keyPattern', 'Key pattern filter')
      .required('action'),
  ),
  tool('state_board_watch', (t) =>
    t
      .desc('Start, poll, or stop shared state board watches.')
      .enum(
        'action',
        ['start', 'poll', 'stop'],
        'Watch operation: start watching, poll for changes, or stop watching',
      )
      .string('key', 'Key or pattern to watch')
      .string('namespace', 'Namespace')
      .number('pollIntervalMs', 'Polling interval in milliseconds')
      .string('watchId', 'Watch ID')
      .required('action'),
  ),
  tool('state_board_io', (t) =>
    t
      .desc('Export or import state board entries.')
      .enum('action', ['export', 'import'], 'IO operation')
      .string('namespace', 'Namespace filter or target namespace')
      .string('keyPattern', 'Key pattern filter')
      .prop('data', {
        type: 'object',
        description: 'Entries to import',
      })
      .boolean('overwrite', 'Overwrite existing keys on import')
      .required('action'),
  ),
];
