import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { mesh3d } = await request.json();

    if (!mesh3d) {
      return NextResponse.json({ success: false, error: 'No mesh data provided' }, { status: 400 });
    }

    const backendRes = await fetch('http://backend:8000/suggest-faces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mesh3d })
    });
    
    const backendData = await backendRes.json();
    return NextResponse.json(backendData);

  } catch (error: any) {
    console.error("Local Suggest Faces Error:", error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch suggestions' }, { status: 500 });
  }
}
