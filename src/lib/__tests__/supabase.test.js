import { describe, it, expect } from 'vitest'
import { supabase } from '../supabase'

describe('supabase client', () => {
  it('is initialized and ready to query', () => {
    expect(supabase).toBeDefined()
    expect(typeof supabase.from).toBe('function')
  })

  it('targets the correct Supabase project', () => {
    expect(supabase.supabaseUrl).toBe(import.meta.env.VITE_SUPABASE_URL)
  })
})
