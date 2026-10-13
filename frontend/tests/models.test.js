import assert from 'node:assert/strict'
import test from 'node:test'
import { parseUUID } from '../src/models.ts'

test('parseUUID accepts valid UUIDs and preserves their value', () => {
  const id = '9840a8c8-8d73-56c9-90b7-65669d38161a'

  assert.equal(parseUUID(id), id)
})

test('parseUUID rejects malformed UUIDs', () => {
  assert.throws(() => parseUUID('not-a-uuid'), {
    message: 'Invalid UUID',
  })
})
