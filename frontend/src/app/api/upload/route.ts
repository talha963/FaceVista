import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Define the upload directory inside the Next.js public folder
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    // Create directory if it doesn't exist
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // Ignore directory exists error
    }

    // Create a unique filename
    const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
    const filepath = path.join(uploadDir, filename);

    // Write file to disk
    await writeFile(filepath, buffer);

    // IMMEDIATELY Call the Python Backend to process the image!
    // We use http://backend:8000 because we are inside the Docker network
    try {
      const backendRes = await fetch('http://backend:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: filename })
      });
      
      const backendData = await backendRes.json();
      
      if (backendData.success) {
        // Return BOTH the original, the analyzed image, and the 3D mesh data!
        return NextResponse.json({ 
          success: true, 
          originalUrl: `/uploads/${filename}`,
          analyzedUrl: backendData.analyzed_url,
          mesh3d: backendData.mesh_3d
        });
      } else {
        console.error("AI Analysis failed on backend", backendData);
      }
    } catch (aiError) {
      console.error("Failed to connect to Python backend:", aiError);
    }

    // If AI fails for some reason, still return the original so the UI doesn't completely break
    return NextResponse.json({ 
      success: true, 
      originalUrl: `/uploads/${filename}`, 
      analyzedUrl: null 
    });

  } catch (error: any) {
    console.error("Local Upload Error:", error);
    return NextResponse.json({ success: false, error: error.message || 'Upload failed' }, { status: 500 });
  }
}
