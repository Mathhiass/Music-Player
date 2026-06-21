import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  // passthrough middleware — keep for future edge-handling (CORS, logging, etc.)
  return NextResponse.next()
}