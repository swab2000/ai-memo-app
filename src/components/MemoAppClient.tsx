'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import {
  createMemo,
  deleteMemo,
  updateMemo,
} from '@/app/actions/memos'
import { Memo, MemoFormData } from '@/types/memo'
import MemoForm from '@/components/MemoForm'
import MemoList from '@/components/MemoList'

interface MemoAppClientProps {
  initialMemos: Memo[]
}

export default function MemoAppClient({ initialMemos }: MemoAppClientProps) {
  const [mounted, setMounted] = useState(false)
  const [memos, setMemos] = useState<Memo[]>(initialMemos)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingMemo, setEditingMemo] = useState<Memo | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setMounted(true)
  }, [])

  const filteredMemos = useMemo(() => {
    let filtered = memos

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(memo => memo.category === selectedCategory)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        memo =>
          memo.title.toLowerCase().includes(query) ||
          memo.content.toLowerCase().includes(query) ||
          memo.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    return filtered
  }, [memos, selectedCategory, searchQuery])

  const stats = useMemo(() => {
    const byCategory = memos.reduce(
      (acc, memo) => {
        acc[memo.category] = (acc[memo.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return {
      total: memos.length,
      filtered: filteredMemos.length,
      byCategory,
    }
  }, [memos, filteredMemos.length])

  const handleCreateMemo = (formData: MemoFormData) => {
    startTransition(async () => {
      try {
        setErrorMessage(null)
        const createdMemo = await createMemo(formData)
        setMemos(prev => [createdMemo, ...prev])
        setIsFormOpen(false)
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : '메모 생성에 실패했습니다.'
        )
      }
    })
  }

  const handleUpdateMemo = (formData: MemoFormData) => {
    if (!editingMemo) return

    startTransition(async () => {
      try {
        setErrorMessage(null)
        const updatedMemo = await updateMemo(editingMemo.id, formData)
        setMemos(prev =>
          prev.map(memo => (memo.id === updatedMemo.id ? updatedMemo : memo))
        )
        setEditingMemo(null)
        setIsFormOpen(false)
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : '메모 수정에 실패했습니다.'
        )
      }
    })
  }

  const handleDeleteMemo = (id: string) => {
    if (!window.confirm('정말로 이 메모를 삭제하시겠습니까?')) return

    startTransition(async () => {
      try {
        setErrorMessage(null)
        await deleteMemo(id)
        setMemos(prev => prev.filter(memo => memo.id !== id))
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : '메모 삭제에 실패했습니다.'
        )
      }
    })
  }

  const handleEditMemo = (memo: Memo) => {
    setEditingMemo(memo)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingMemo(null)
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1
                className="text-2xl font-bold text-gray-900"
                suppressHydrationWarning
              >
                📝 메모 앱
              </h1>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">메모를 불러오는 중...</span>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">📝 메모 앱</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsFormOpen(true)}
                disabled={isPending}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                새 메모
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {errorMessage && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <MemoList
          memos={filteredMemos}
          loading={isPending && memos.length === 0}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          onSearchChange={setSearchQuery}
          onCategoryChange={setSelectedCategory}
          onEditMemo={handleEditMemo}
          onDeleteMemo={handleDeleteMemo}
          stats={stats}
        />
      </main>

      <MemoForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={editingMemo ? handleUpdateMemo : handleCreateMemo}
        editingMemo={editingMemo}
      />
    </div>
  )
}
