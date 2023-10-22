// overloaded function that accepts union of pagination options and returns a tuple of GROQ query and params
import type { QueryParams } from '@sanity/client'

type Query = string

export function getPage (args: { first: number }): readonly [Query, QueryParams]
export function getPage (args: { first: number, after: string }): readonly [Query, QueryParams]
export function getPage (args: { first: number } | { first: number, after: string }): readonly [Query, QueryParams] {
  if ('after' in args) {
    return getAfterPage(args.first, args.after)
  }

  return getFirstPage(args.first)
}

function getFirstPage (first = 10): readonly [string, QueryParams] {
  const params = {
    type: 'lesson',
    sort: {
      field: 'title'
    },
    first
  }

  const query = /* groq */`
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
    `

  return [
    query,
    params
  ]
}

function getAfterPage (first: number = 10, after: string): readonly [string, QueryParams] {
  const params = {
    type: 'lesson',
    sort: {
      field: 'title'
    },
    first,
    after
  }

  const query = /* groq */`
      {
        "nodes": *[_type == $type] | order($sort.field asc),
        "after": {
            "value": string::split($after, "|")[0],
            "id": string::split($after, "|")[-1]
        }
      }
      {
        nodes,
        after,
        "page": nodes[title >= ^.after.value || (title >= ^.after.value && _id >= ^.after.id)][0...$first+2]
      }
      {
        nodes,
        "edges": page[1...$first+1]{
          "node": @,
          "cursor": $sort.field + "|" + _id  
        }
      }
      {
        edges,
        "pageInfo": {
          "total": count(nodes),
    
          "hasPreviousPage": defined(nodes[0]),
          "hasNextPage": defined(nodes[$first+1]),
          "startCursor": edges[0].cursor,
          "endCursor": edges[-1].cursor
        }
      }  
  `

  return [
    query,
    params
  ]
}
