'use client'

import { useState, useEffect, useCallback } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import {
  Memo,
  MemoFormData,
  MEMO_CATEGORIES,
  DEFAULT_CATEGORIES,
} from '@/types/memo'

type EditorMode = 'edit' | 'split' | 'preview'

interface MemoFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: MemoFormData) => void
  editingMemo?: Memo | null
}

export default function MemoForm({
  isOpen,
  onClose,
  onSubmit,
  editingMemo,
}: MemoFormProps) {
  const [formData, setFormData] = useState<MemoFormData>({
    title: '',
    content: '',
    category: 'personal',
    tags: [],
  })
  const [tagInput, setTagInput] = useState('')
  const [editorMode, setEditorMode] = useState<EditorMode>('split')

  useEffect(() => {
    if (editingMemo) {
      setFormData({
        title: editingMemo.title,
        content: editingMemo.content,
        category: editingMemo.category,
        tags: editingMemo.tags,
      })
    } else {
      setFormData({
        title: '',
        content: '',
        category: 'personal',
        tags: [],
      })
    }
    setTagInput('')
  }, [editingMemo, isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.')
      return
    }
    onSubmit(formData)
    onClose()
  }

  const handleAddTag = useCallback(() => {
    const tag = tagInput.trim()
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }))
      setTagInput('')
    }
  }, [tagInput, formData.tags])

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }))
  }, [])

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  if (!isOpen) return null

  const isSplit = editorMode === 'split'
  const modalMaxWidth = isSplit ? 'max-w-5xl' : 'max-w-2xl'

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-xl shadow-2xl ${modalMaxWidth} w-full max-h-[92vh] flex flex-col transition-all duration-200`}
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingMemo ? '메모 편집' : '새 메모 작성'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 폼 */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {/* 제목 */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                제목 *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={e =>
                  setFormData(prev => ({ ...prev, title: e.target.value }))
                }
                className="placeholder-gray-400 text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="메모 제목을 입력하세요"
                required
              />
            </div>

            {/* 카테고리 */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                카테고리
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={e =>
                  setFormData(prev => ({ ...prev, category: e.target.value }))
                }
                className="text-gray-700 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                {DEFAULT_CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {MEMO_CATEGORIES[category]}
                  </option>
                ))}
              </select>
            </div>

            {/* 내용 — 에디터/분할/미리보기 */}
            <div>
              {/* 레이블 + 모드 전환 탭 */}
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-700">
                  내용 *
                </label>
                <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
                  {(
                    [
                      { key: 'edit', label: '편집' },
                      { key: 'split', label: '분할' },
                      { key: 'preview', label: '미리보기' },
                    ] as { key: EditorMode; label: string }[]
                  ).map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setEditorMode(key)}
                      className={`px-3 py-1.5 font-medium transition-colors ${
                        editorMode === key
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 에디터 영역 */}
              <div
                className={`flex gap-0 border border-gray-300 rounded-lg overflow-hidden ${isSplit ? 'divide-x divide-gray-200' : ''}`}
              >
                {/* 텍스트 에디터 패널 */}
                {(editorMode === 'edit' || editorMode === 'split') && (
                  <div className={isSplit ? 'w-1/2' : 'w-full'}>
                    {isSplit && (
                      <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-200 text-xs text-gray-500 font-medium">
                        편집
                      </div>
                    )}
                    <textarea
                      id="content"
                      value={formData.content}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          content: e.target.value,
                        }))
                      }
                      className="placeholder-gray-400 text-gray-900 w-full px-3 py-3 focus:outline-none resize-none font-mono text-sm leading-relaxed"
                      placeholder={`마크다운을 입력하세요\n\n# 제목\n**굵게**, *기울임*\n- 목록 항목\n\`\`\`js\nconsole.log('코드')\n\`\`\``}
                      rows={12}
                      required
                    />
                  </div>
                )}

                {/* 마크다운 미리보기 패널 */}
                {(editorMode === 'preview' || editorMode === 'split') && (
                  <div className={isSplit ? 'w-1/2' : 'w-full'}>
                    {(isSplit || editorMode === 'preview') && (
                      <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-200 text-xs text-gray-500 font-medium">
                        미리보기
                      </div>
                    )}
                    <div className="px-3 py-3 overflow-y-auto h-[calc(12*1.625rem+1.5rem)] text-sm">
                      {formData.content.trim() ? (
                        <MarkdownPreview content={formData.content} />
                      ) : (
                        <p className="text-gray-400 text-sm">
                          왼쪽에 내용을 입력하면 미리보기가 표시됩니다.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 태그 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                태그
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  className="placeholder-gray-400 text-gray-900 flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="태그를 입력하고 Enter를 누르세요"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  추가
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="flex gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
            >
              {editingMemo ? '수정하기' : '저장하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function MarkdownPreview({ content }: { content: string }) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="text-xl font-bold text-gray-900 mt-4 mb-2 first:mt-0">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-lg font-semibold text-gray-900 mt-3 mb-2 first:mt-0">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-base font-semibold text-gray-800 mt-2 mb-1 first:mt-0">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="text-gray-700 text-sm leading-relaxed mb-2 last:mb-0">
            {children}
          </p>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-gray-900">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic text-gray-700">{children}</em>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-inside text-sm text-gray-700 mb-2 space-y-0.5 pl-2">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside text-sm text-gray-700 mb-2 space-y-0.5 pl-2">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="leading-relaxed">{children}</li>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-blue-300 bg-blue-50 pl-3 py-1 my-2 text-sm text-gray-600 italic rounded-r">
            {children}
          </blockquote>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {children}
          </a>
        ),
        hr: () => <hr className="border-gray-200 my-3" />,
        table: ({ children }) => (
          <div className="overflow-x-auto my-2">
            <table className="min-w-full text-xs border border-gray-200 rounded">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-gray-50">{children}</thead>
        ),
        th: ({ children }) => (
          <th className="px-3 py-1.5 text-left font-medium text-gray-700 border-b border-gray-200">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-3 py-1.5 text-gray-600 border-b border-gray-100">
            {children}
          </td>
        ),
        code({ className, children, ...rest }) {
          const match = /language-(\w+)/.exec(className ?? '')
          const isBlock = Boolean(match)
          return isBlock ? (
            <SyntaxHighlighter
              style={oneLight}
              language={match![1]}
              PreTag="div"
              customStyle={{ margin: '0.5rem 0', borderRadius: '0.375rem', fontSize: '0.75rem' }}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code
              {...rest}
              className="px-1.5 py-0.5 bg-gray-100 text-pink-600 text-xs rounded font-mono"
            >
              {children}
            </code>
          )
        },
      }}
    >
      {content}
    </Markdown>
  )
}
