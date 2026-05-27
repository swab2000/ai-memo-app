import { GoogleGenAI } from '@google/genai'
import { NextRequest, NextResponse } from 'next/server'

const MODEL = 'gemini-2.5-flash-lite'

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.' },
      { status: 500 }
    )
  }

  let title: string
  let content: string

  try {
    const body = await req.json()
    title = body.title
    content = body.content
  } catch {
    return NextResponse.json(
      { error: '잘못된 요청 형식입니다.' },
      { status: 400 }
    )
  }

  if (!content?.trim()) {
    return NextResponse.json(
      { error: '요약할 내용이 없습니다.' },
      { status: 400 }
    )
  }

  try {
    const ai = new GoogleGenAI({ apiKey })

    const prompt = `다음 메모를 한국어로 3~5문장으로 간결하게 요약해줘. 핵심 내용만 담아서 불필요한 설명 없이 요약문만 출력해.

제목: ${title}

내용:
${content}`

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
    })

    return NextResponse.json({ summary: response.text })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
