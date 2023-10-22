import type { FilteredResponseQueryOptions, QueryParams, SanityClient, UnfilteredResponseQueryOptions } from '@sanity/client'
import { evaluate, parse } from 'groq-js'

export function createMockClient (dataset: any[] = []): Pick<SanityClient, 'fetch'> {
  return {
    async fetch<R, Q extends QueryParams>(
      query: string,
      params?: Q,
      _options: FilteredResponseQueryOptions | UnfilteredResponseQueryOptions = {}
    ) {
      const tree = parse(query, { params })
      const value = await evaluate(tree, { dataset })

      return await value.get() as R
    }
  }
}
