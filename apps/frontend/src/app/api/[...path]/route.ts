import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = 'http://localhost:3001'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'GET')
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'POST')
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'PUT')
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'DELETE')
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'PATCH')
}

async function proxyRequest(
  request: NextRequest,
  path: string[],
  method: string
) {
  const url = `${BACKEND_URL}/${path.join('/')}`
  
  console.log(`🔄 Proxy ${method} ${url}`)

  try {
    const headers: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase()
      // Не копируем host и content-length, они будут установлены автоматически
      if (!lowerKey.startsWith('host') && lowerKey !== 'content-length') {
        headers[key] = value
      }
    })

    const options: RequestInit = {
      method,
      headers,
    }

    // Для multipart/form-data передаем FormData напрямую
    const requestContentType = request.headers.get('content-type') || ''
    
    if (requestContentType.includes('multipart/form-data')) {
      console.log('📦 Проксирую multipart/form-data')
      // Получаем FormData из запроса
      const formData = await request.formData()
      options.body = formData as any
      // Удаляем Content-Type, чтобы fetch сам установил правильный boundary
      delete headers['content-type']
    } else if (method !== 'GET' && method !== 'HEAD') {
      const body = await request.text()
      if (body) {
        options.body = body
      }
    }

    const response = await fetch(url, options)
    
    console.log(`✅ Proxy response ${response.status}`)
    console.log(`📦 Content-Type: ${response.headers.get('Content-Type')}`)

    // Для видео и других бинарных файлов возвращаем поток напрямую
    const responseContentType = response.headers.get('Content-Type') || ''
    
    if (responseContentType.includes('video/') || responseContentType.includes('image/') || responseContentType.includes('octet-stream')) {
      console.log('🎬 Проксирую медиа-файл')
      const blob = await response.blob()
      return new NextResponse(blob, {
        status: response.status,
        headers: {
          'Content-Type': responseContentType,
          'Content-Length': response.headers.get('Content-Length') || '',
          'Accept-Ranges': 'bytes',
        },
      })
    }

    // Для обычных ответов (JSON, текст)
    const data = await response.text()
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': responseContentType || 'application/json',
      },
    })
  } catch (error: any) {
    console.error(`❌ Proxy error:`, error.message)
    console.error(`Stack:`, error.stack)
    return NextResponse.json(
      { error: 'Backend unavailable', details: error.message },
      { status: 503 }
    )
  }
}

