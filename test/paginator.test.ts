// Write tests that use the Sanity client to paginate through the dataset

import { faker } from '@faker-js/faker/locale/en'
import { describe, expect, test } from 'vitest'

import { createMockClient } from './client'
import type { Connection, Lesson } from './types'
import { getPage } from '../src'
import assert from 'node:assert/strict'

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
  describe('a page of results', async () => {
    const first = 10
    const dataset = Array.from({ length: first }, createFakeLesson)
    const client = createMockClient(dataset)
    const [query, params] = getPage({ first })
    const page = await client.fetch<Connection<Lesson>>(query, params)

    test('should return a connection', () => {
      expect(page).toEqual({
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

    test('should return the total number of results', () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      expect(page.pageInfo.total).toBe(dataset.length)
    })

    test('shouldn\'t have a previous page of results', () => {
      expect(params.after).toBeUndefined()
      expect(page.pageInfo.hasPreviousPage).toBe(false)
    })

    test('shouldn\'t have a next page of results if the total number of results is less than or equal to the page size', () => {
      expect(dataset.length).toBeLessThanOrEqual(first)
      expect(page.pageInfo.hasNextPage).toBe(false)
    })

    test('should return the correct number of edges', () => {
      expect(page.edges.length).toBeLessThanOrEqual(first)
      expect(page.edges).toContainEqual(expect.objectContaining({
        node: expect.any(Object),
        cursor: expect.stringContaining('|')
      }))
    })

    test('should return the correct start and end cursors', () => {
      expect(page.pageInfo.startCursor).toBe(page.edges[0].cursor)
      expect(page.pageInfo.endCursor).toBe(page.edges[page.edges.length - 1].cursor)
    })
  })

  describe('a page of results with a cursor', async () => {
    const dataset = Array.from({ length: 100 }, createFakeLesson)
    const client = createMockClient(dataset)
    const first = 10
    const offset = first
    let after: any = dataset.at(offset)
    assert(after)
    after = `${after.title}|${after._id}`

    const [query, params] = getPage({ first, after })
    const page = await client.fetch<Connection<Lesson>>(query, params)

    test('should return a connection', () => {
      expect(page).toEqual({
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

    test('should return the total number of results', () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      expect(page.pageInfo.total).toBe(dataset.length)
    })

    test('should have a previous page of results', () => {
      expect(params.after).toBeDefined()
      expect(page.pageInfo.hasPreviousPage).toBe(true)
    })

    test('should have a next page of results if the total number of results is greater than the page size', () => {
      expect(dataset.length).toBeGreaterThan(first + offset)
      expect(page.pageInfo.hasNextPage).toBe(true)
    })

    test('should return the correct number of edges', () => {
      expect(page.edges.length).toBeLessThanOrEqual(first)
      expect(page.edges).toContainEqual(expect.objectContaining({
        node: expect.any(Object),
        cursor: expect.stringContaining('|')
      }))
    })

    test('should return the correct start and end cursors', () => {
      expect(page.pageInfo.startCursor).toBe(page.edges[0].cursor)
      expect(page.pageInfo.endCursor).toBe(page.edges[page.edges.length - 1].cursor)
    })
  })
})
