// Write tests that use the Sanity client to paginate through the dataset

import { faker } from '@faker-js/faker/locale/en'
import type { QueryParams } from '@sanity/client'
import { describe, expect, test } from 'vitest'

import { createMockClient } from './client'
import type { Connection, Lesson } from './types'

function getFirstPage (first = 10): readonly [string, QueryParams] {
  return [
  /* groq */`
  {
    "nodes": *[_type == $type] | order($sort.field asc),
  }
  {
    nodes,
    "page": nodes[0...$first+1]
  }
  {
    nodes,
    "edges": page[0...$first]{
      "node": @,
      "cursor": $sort.field + "|" + _id  
    }
  }
  {
    edges,
    "pageInfo": {
      "total": count(nodes),

      "hasPreviousPage": false,
      "hasNextPage": defined(nodes[$first]),
      "startCursor": edges[0].cursor,
      "endCursor": edges[-1].cursor
    }
  }
`,
    {
      type: 'lesson',
      sort: {
        field: 'title'
      },
      first
    }
  ]
}

function createFakeLesson (): Lesson {
  return {
    _id: faker.string.uuid(),
    _type: 'lesson',

    title: faker.lorem.text(),

    _rev: faker.string.uuid(),
    _createdAt: faker.date.past().toISOString(),
    _updatedAt: faker.date.recent().toISOString()
  }
}

describe('GROQ pagination', () => {
  describe('the first page of results', async () => {
    const first = 10
    const dataset = Array.from({ length: first }, createFakeLesson)
    const client = createMockClient(dataset)
    const firstPage = await client.fetch<Connection<Lesson>>(...getFirstPage(first))

    test('should return a connection', () => {
      expect(firstPage).toEqual({
        edges: expect.any(Array),

        pageInfo: {
          total: expect.any(Number),
          hasPreviousPage: expect.any(Boolean),
          hasNextPage: expect.any(Boolean),
          startCursor: expect.stringContaining('|'),
          endCursor: expect.stringContaining('|')
        }
      })
    })

    test('shouldn\'t have a previous page of results', () => {
      expect(firstPage.pageInfo.hasPreviousPage).toBe(false)
    })

    test('should return the edges', () => {
      expect(firstPage).toEqual({
        edges: expect.any(Array),

        pageInfo: {
          total: expect.any(Number),
          hasPreviousPage: false,
          hasNextPage: expect.any(Boolean),
          startCursor: expect.stringContaining('|'),
          endCursor: expect.stringContaining('|')
        }
      })
    })

    test('should return the edges', () => {
      expect(firstPage.edges.length).toBe(first)

      expect(firstPage.edges).toContainEqual(expect.objectContaining({
        node: expect.any(Object),
        cursor: expect.stringContaining('|')
      }))
    })
  })
})
