import { getMemos } from '@/app/actions/memos'
import MemoAppClient from '@/components/MemoAppClient'

export const dynamic = 'force-dynamic'

export default async function Home() {
  try {
    const memos = await getMemos()

    return <MemoAppClient initialMemos={memos} />
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Supabase 메모 데이터를 불러오지 못했습니다.'

    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-white border border-red-200 rounded-xl shadow-sm p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-3">
            Supabase 설정이 필요합니다
          </h1>
          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            메모 CRUD가 Supabase 서버 액션 기반으로 변경되었습니다.
            `.env.local`에 Supabase 환경 변수를 설정하고 DB migration을
            적용해주세요.
          </p>
          <pre className="bg-gray-900 text-gray-100 text-xs rounded-lg p-4 overflow-x-auto mb-4">
            NEXT_PUBLIC_SUPABASE_URL=...{'\n'}
            NEXT_PUBLIC_SUPABASE_ANON_KEY=...{'\n'}
            SUPABASE_SERVICE_ROLE_KEY=...
          </pre>
          <p className="text-xs text-red-600 break-words">{message}</p>
        </div>
      </main>
    )
  }
}
