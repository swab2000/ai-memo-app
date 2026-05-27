'use server'

import { revalidatePath } from 'next/cache'
import { v4 as uuidv4 } from 'uuid'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { Memo, MemoFormData } from '@/types/memo'
import { sampleMemos } from '@/utils/sampleMemos'

type MemoRow = {
  id: string
  title: string
  content: string
  category: string
  tags: string[] | null
  createdAt: string
  updatedAt: string
}

const MEMO_COLUMNS = 'id,title,content,category,tags,createdAt,updatedAt'

function toMemo(row: MemoRow): Memo {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    category: row.category,
    tags: row.tags ?? [],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function toRow(memo: Memo) {
  return memo
}

async function seedMemosIfEmpty() {
  const supabase = createSupabaseServerClient()
  const { count, error: countError } = await supabase
    .from('memos')
    .select('id', { count: 'exact', head: true })

  if (countError) throw countError
  if (count && count > 0) return

  const { error } = await supabase
    .from('memos')
    .upsert(sampleMemos.map(toRow), { onConflict: 'id' })

  if (error) throw error
}

export async function getMemos(): Promise<Memo[]> {
  await seedMemosIfEmpty()

  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('memos')
    .select(MEMO_COLUMNS)
    .order('updatedAt', { ascending: false })

  if (error) throw error
  return (data as MemoRow[]).map(toMemo)
}

export async function createMemo(formData: MemoFormData): Promise<Memo> {
  const now = new Date().toISOString()
  const memo: Memo = {
    id: uuidv4(),
    ...formData,
    createdAt: now,
    updatedAt: now,
  }

  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('memos')
    .insert(toRow(memo))
    .select(MEMO_COLUMNS)
    .single()

  if (error) throw error
  revalidatePath('/')
  return toMemo(data as MemoRow)
}

export async function updateMemo(
  id: string,
  formData: MemoFormData
): Promise<Memo> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('memos')
    .update({
      ...formData,
      updatedAt: new Date().toISOString(),
    })
    .eq('id', id)
    .select(MEMO_COLUMNS)
    .single()

  if (error) throw error
  revalidatePath('/')
  return toMemo(data as MemoRow)
}

export async function deleteMemo(id: string): Promise<void> {
  const supabase = createSupabaseServerClient()
  const { error } = await supabase.from('memos').delete().eq('id', id)

  if (error) throw error
  revalidatePath('/')
}

export async function clearAllMemos(): Promise<void> {
  const supabase = createSupabaseServerClient()
  const { error } = await supabase
    .from('memos')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')

  if (error) throw error
  revalidatePath('/')
}
