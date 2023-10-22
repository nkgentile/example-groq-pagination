import type { SanityDocument } from '@sanity/client'

export interface Lesson extends SanityDocument {
  _type: 'lesson'
  title: string
}

export type Cursor = `${string}|${string}`

// TODO: create query param interface

export interface Edge<T> {
  node: T
  cursor: Cursor
}

export interface PageInfo {
  hasPreviousPage: boolean
  hasNextPage: boolean
  startCursor: Cursor
  endCursor: Cursor
}

export interface Connection<T> {
  edges: Array<Edge<T>>
  pageInfo: PageInfo
}
