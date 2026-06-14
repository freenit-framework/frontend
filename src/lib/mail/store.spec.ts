import { describe, it, expect } from 'vitest'
import { flattenMailboxOptions } from './store'
import type { MailboxNode } from './types'

describe('flattenMailboxOptions', () => {
  it('flattens a mailbox tree into sorted full paths', () => {
    const tree: MailboxNode[] = [
      {
        id: 'b',
        name: 'Bar',
        parentId: null,
        role: null,
        totalEmails: 0,
        unreadEmails: 0,
        sortOrder: 0,
        children: [
          {
            id: 'b1',
            name: 'Baz',
            parentId: 'b',
            role: null,
            totalEmails: 0,
            unreadEmails: 0,
            sortOrder: 0,
            children: [],
          },
        ],
      },
      {
        id: 'a',
        name: 'Alpha',
        parentId: null,
        role: null,
        totalEmails: 0,
        unreadEmails: 0,
        sortOrder: 0,
        children: [],
      },
    ]

    expect(flattenMailboxOptions(tree)).toEqual([
      { value: 'Alpha', label: 'Alpha' },
      { value: 'Bar', label: 'Bar' },
      { value: 'Bar/Baz', label: 'Bar/Baz' },
    ])
  })
})
