'use client'

import { useState, useCallback } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Memo, MEMO_CATEGORIES } from '@/types/memo'

interface MemoItemProps {
  memo: Memo
  onEdit: (memo: Memo) => void
  onDelete: (id: string) => void
}

export default function MemoItem({ memo, onEdit, onDelete }: MemoItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [summaryError, setSummaryError] = useState<string | null>(null)

  const handleToggle = useCallback(() => {
    setIsExpanded(prev => {
      if (prev) {
        setSummary(null)
        setSummaryError(null)
      }
      return !prev
    })
  }, [])

  const handleSummarize = useCallback(async () => {
    if (isSummarizing) return
    setSummary(null)
    setSummaryError(null)
    setIsSummarizing(true)
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: memo.title, content: memo.content }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? '요약 실패')
      setSummary(data.summary)
    } catch (err) {
      setSummaryError(err instanceof Error ? err.message : '요약 중 오류가 발생했습니다.')
    } finally {
      setIsSummarizing(false)
    }
  }, [memo.title, memo.content, isSummarizing])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      personal: 'bg-blue-100 text-blue-800',
      work: 'bg-green-100 text-green-800',
      study: 'bg-purple-100 text-purple-800',
      idea: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800',
    }
    return colors[category] ?? colors.other
  }

  return (
    <div
      className={`bg-white rounded-lg shadow-md border border-gray-200 p-6 transition-all duration-200 cursor-pointer select-none ${
        isExpanded ? 'shadow-lg ring-2 ring-blue-300' : 'hover:shadow-lg'
      }`}
      onClick={() => handleToggle()}
    >
      {/* 헤더 */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {memo.title}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(memo.category)}`}
            >
              {MEMO_CATEGORIES[memo.category as keyof typeof MEMO_CATEGORIES] ??
                memo.category}
            </span>
            <span className="text-xs text-gray-500" suppressHydrationWarning>
              {formatDate(memo.updatedAt)}
            </span>
          </div>
        </div>

        {/* 펼침 표시 아이콘 */}
        <div className="ml-3 flex-shrink-0 text-gray-400">
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* 내용 — 접힘/펼침 */}
      {isExpanded ? (
        <div className="mb-4">
          {/* 작성/수정일 */}
          <div className="flex flex-col gap-1 text-xs text-gray-400 mb-3">
            <span suppressHydrationWarning>작성일: {formatDate(memo.createdAt)}</span>
            {memo.createdAt !== memo.updatedAt && (
              <span suppressHydrationWarning>수정일: {formatDate(memo.updatedAt)}</span>
            )}
          </div>

          {/* 마크다운 프리뷰 — 최대 높이 제한 후 스크롤 */}
          <div
            className="max-h-72 overflow-y-auto pr-1"
            onClick={e => e.stopPropagation()}
          >
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
                  <strong className="font-semibold text-gray-900">
                    {children}
                  </strong>
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
                    onClick={e => e.stopPropagation()}
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
                // 인라인 코드
                code({ className, children, ...rest }) {
                  const match = /language-(\w+)/.exec(className ?? '')
                  const isBlock = Boolean(match)
                  return isBlock ? (
                    <SyntaxHighlighter
                      style={oneLight}
                      language={match![1]}
                      PreTag="div"
                      className="rounded text-xs my-2"
                      customStyle={{ margin: '0.5rem 0', borderRadius: '0.375rem' }}
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
              {memo.content}
            </Markdown>
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
            {memo.content}
          </p>
        </div>
      )}

      {/* 태그 */}
      {memo.tags.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-4">
          {memo.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* 확장 시 편집/삭제/요약 */}
      {isExpanded && (
        <div
          className="space-y-3 pt-3 border-t border-gray-100"
          onClick={e => e.stopPropagation()}
        >
          {/* 요약 버튼 */}
          <button
            onClick={handleSummarize}
            disabled={isSummarizing}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg transition-colors text-xs font-medium"
          >
            {isSummarizing ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                요약 중...
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                AI 요약
              </>
            )}
          </button>

          {/* 요약 결과 */}
          {summary && (
            <div className="rounded-lg bg-purple-50 border border-purple-200 px-3 py-2.5">
              <p className="text-xs font-semibold text-purple-700 mb-1.5 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                AI 요약 결과
              </p>
              <p className="text-xs text-purple-900 leading-relaxed">{summary}</p>
            </div>
          )}

          {/* 요약 에러 */}
          {summaryError && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
              {summaryError}
            </div>
          )}

          {/* 편집 / 삭제 */}
          <div className="flex gap-2">
            <button
              onClick={() => onDelete(memo.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-xs font-medium"
              title="삭제"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              삭제
            </button>
            <button
              onClick={() => onEdit(memo)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors text-xs font-medium"
              title="편집"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              편집
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
