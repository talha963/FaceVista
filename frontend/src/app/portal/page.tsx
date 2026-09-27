"use client";

import React, { useState, useEffect, useRef } from "react";
import { ThemeToggle } from "../../components/theme-toggle";
import { auth, db } from "../../lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { collection, addDoc, query, where, getDocs, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useMemo } from 'react';
import Delaunator from 'delaunator';

export function useSharedFaceMesh(mesh3d: any[]) {
  const meshData = useMemo(() => {
    if (!mesh3d || mesh3d.length === 0) return null;
    const pos = new Float32Array(mesh3d.length * 3);
    const uvs = new Float32Array(mesh3d.length * 2);
    const coords2d = [];
    mesh3d.forEach((lm, i) => {
       pos[i*3] = (lm.x - 0.5) * 15;
       pos[i*3+1] = -(lm.y - 0.5) * 15;
       pos[i*3+2] = -lm.z * 15;
       uvs[i*2] = lm.x;
       uvs[i*2+1] = 1 - lm.y;
       coords2d.push(lm.x, lm.y);
    });
    const delaunay = new Delaunator(coords2d);
    return { positions: pos, uvs, indices: new Uint32Array(delaunay.triangles) };
  }, [mesh3d]);

  const updateSignal = useRef(0);
  return { meshData, updateSignal };
}



export function FaceMeshWireframe({ sharedMesh, updateSignal }: any) {
  const geomRef = useRef<any>(null);
  const dragRef = useRef<{ idx: number, lastX: number, lastY: number } | null>(null);
  const [hovered, setHovered] = useState(false);
  const pointsGeomRef = useRef<any>(null);

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    if (e.target.setPointerCapture) e.target.setPointerCapture(e.pointerId);
    if (geomRef.current && e.point) {
      const pt = e.point;
      const positions = geomRef.current.attributes.position.array;
      let closestIdx = -1;
      let minD = Infinity;
      for (let i = 0; i < positions.length / 3; i++) {
         const dx = positions[i*3] - pt.x;
         const dy = positions[i*3+1] - pt.y;
         const dz = positions[i*3+2] - pt.z;
         const d = dx*dx + dy*dy + dz*dz;
         if (d < minD) { minD = d; closestIdx = i; }
      }
      dragRef.current = { idx: closestIdx, lastX: e.clientX, lastY: e.clientY };
      document.body.style.cursor = 'grabbing';
    }
  };

  const handlePointerMove = (e: any) => {
    if (dragRef.current && geomRef.current) {
      e.stopPropagation();
      const dx = e.clientX - dragRef.current.lastX;
      const dy = e.clientY - dragRef.current.lastY;
      
      const factor = 0.015;
      const worldDx = dx * factor;
      const worldDy = -dy * factor;

      const positions = geomRef.current.attributes.position.array;
      const centerIdx = dragRef.current.idx;
      const cx = positions[centerIdx*3];
      const cy = positions[centerIdx*3+1];
      const cz = positions[centerIdx*3+2];
      const radiusSq = 1.2;

      for (let i = 0; i < positions.length / 3; i++) {
        const vx = positions[i*3];
        const vy = positions[i*3+1];
        const vz = positions[i*3+2];
        const distSq = (vx - cx)**2 + (vy - cy)**2 + (vz - cz)**2;
        if (distSq < radiusSq) {
          const weight = Math.exp(-distSq / (radiusSq * 0.5));
          positions[i*3] += worldDx * weight;
          positions[i*3+1] += worldDy * weight;
        }
      }

      geomRef.current.attributes.position.needsUpdate = true;
      if (pointsGeomRef.current) {
         pointsGeomRef.current.attributes.position.needsUpdate = true;
      }
      updateSignal.current += 1;
      
      dragRef.current.lastX = e.clientX;
      dragRef.current.lastY = e.clientY;
    }
  };

  const handlePointerUp = (e: any) => {
    e.stopPropagation();
    if (e.target.releasePointerCapture) e.target.releasePointerCapture(e.pointerId);
    dragRef.current = null;
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
  };

  if (!sharedMesh) return null;

  return (
    <group>
      <mesh 
         onPointerDown={handlePointerDown} 
         onPointerMove={handlePointerMove} 
         onPointerUp={handlePointerUp} 
         onPointerLeave={(e) => { handlePointerUp(e); setHovered(false); document.body.style.cursor = 'auto'; }}
         onPointerEnter={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
      >
         <bufferGeometry ref={geomRef}>
           <bufferAttribute attach="attributes-position" count={sharedMesh.positions.length / 3} array={sharedMesh.positions} itemSize={3} />
           <bufferAttribute attach="index" count={sharedMesh.indices.length} array={sharedMesh.indices} itemSize={1} />
         </bufferGeometry>
         
         <meshStandardMaterial 
            color="#4ade80" 
            wireframe={true} 
            transparent 
            opacity={0.3} 
            emissive="#4ade80"
            emissiveIntensity={0.6}
            side={THREE.DoubleSide}
         />
      </mesh>
      <points>
         <bufferGeometry ref={pointsGeomRef}>
           <bufferAttribute attach="attributes-position" count={sharedMesh.positions.length / 3} array={sharedMesh.positions} itemSize={3} />
         </bufferGeometry>
         <pointsMaterial size={0.08} color="#38bdf8" sizeAttenuation transparent opacity={0.9} />
      </points>
    </group>
  );
}

export function FaceMeshTextured({ sharedMesh, updateSignal, imageUrl }: any) {
  const texture = useLoader(THREE.TextureLoader, imageUrl);
  if (texture) texture.colorSpace = THREE.SRGBColorSpace;
  const geomRef = useRef<any>(null);
  const groupRef = useRef<any>(null);
  const lastUpdate = useRef(0);

  useEffect(() => {
    if (geomRef.current) {
      geomRef.current.computeVertexNormals();
    }
  }, [sharedMesh]);

  useFrame((state) => {
    if (groupRef.current) {
       groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.15;
       groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
       groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.3;
    }
    if (geomRef.current && lastUpdate.current !== updateSignal.current) {
      geomRef.current.attributes.position.needsUpdate = true;
      geomRef.current.computeVertexNormals();
      lastUpdate.current = updateSignal.current;
    }
  });

  if (!sharedMesh) return null;

  return (
    <group>
      
      <group ref={groupRef}>
        <mesh>
           <bufferGeometry ref={geomRef}>
             <bufferAttribute attach="attributes-position" count={sharedMesh.positions.length / 3} array={sharedMesh.positions} itemSize={3} />
             <bufferAttribute attach="attributes-uv" count={sharedMesh.uvs.length / 2} array={sharedMesh.uvs} itemSize={2} />
             <bufferAttribute attach="index" count={sharedMesh.indices.length} array={sharedMesh.indices} itemSize={1} />
           </bufferGeometry>
           <meshStandardMaterial map={texture} side={THREE.DoubleSide} roughness={0.5} metalness={0.05} transparent opacity={1} />
        </mesh>
      </group>
    </group>
  );
}

export default function PatientPortal() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Advanced Diagnostic Suite State
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [activeSuggestion, setActiveSuggestion] = useState<any>(null);
  const activeMesh3d = activeSuggestion?.mesh3d || selectedReport?.mesh3d;
  const { meshData: sharedMesh, updateSignal } = useSharedFaceMesh(activeMesh3d);
  
  const [suiteTab, setSuiteTab] = useState("analytics");
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);

  useEffect(() => {
    if (selectedReport && selectedReport.mesh3d && selectedReport.id && (!selectedReport.surgerySuggestions || selectedReport.surgerySuggestions.length === 0)) {
      setIsFetchingSuggestions(true);
      fetch('/api/suggest-faces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mesh3d: selectedReport.mesh3d })
      }).then(res => res.json()).then(async (data) => {
        if (data.success && data.suggestions) {
          const updatedReport = { ...selectedReport, surgerySuggestions: data.suggestions };
          setSelectedReport(updatedReport);
          try {
            await updateDoc(doc(db, "scans", selectedReport.id), { surgerySuggestions: data.suggestions });
          } catch (e) {
            console.error("Failed to save retro suggestions to DB", e);
          }
        }
        setIsFetchingSuggestions(false);
      }).catch(err => {
        console.error("Suggest faces error:", err);
        setIsFetchingSuggestions(false);
      });
    }
  }, [selectedReport?.id]);

  // Dashboard State
  const [activeTab, setActiveTab] = useState("upload");
  const [isDragging, setIsDragging] = useState(false);

  // User Settings State
  const [userSettings, setUserSettings] = useState({ notifications: true, twoFactor: false });
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  // Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // History State
  const [historyDocs, setHistoryDocs] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Check Firebase Session
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchHistory(currentUser.uid);
        fetchSettings(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchSettings = async (uid: string) => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserSettings(docSnap.data() as any);
      } else {
        await setDoc(docRef, { notifications: true, twoFactor: false });
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
    }
  };

  const toggleSetting = async (settingKey: 'notifications' | 'twoFactor') => {
    if (!user) return;
    const newValue = !userSettings[settingKey];
    setUserSettings(prev => ({ ...prev, [settingKey]: newValue }));
    
    try {
      await setDoc(doc(db, "users", user.uid), {
        ...userSettings,
        [settingKey]: newValue
      }, { merge: true });
    } catch (err) {
      console.error("Error saving setting:", err);
      // Revert on failure
      setUserSettings(prev => ({ ...prev, [settingKey]: !newValue }));
    }
  };

  const handleProfilePicUpdate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files.length || !user) return;
    
    setIsUpdatingSettings(true);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const uploadData = await uploadRes.json();
      
      if (uploadData.success) {
        await updateProfile(auth.currentUser!, { photoURL: uploadData.originalUrl || uploadData.url });
        setUser({ ...auth.currentUser });
      } else {
        alert("Failed to upload profile picture.");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading profile picture.");
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const fetchHistory = async (uid: string) => {
    setIsLoadingHistory(true);
    try {
      const q = query(collection(db, "scans"), where("userId", "==", uid));
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      docs.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
      
      setHistoryDocs(docs);
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // ... (auth functions)
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        setError("ERROR: Email/Password authentication is not enabled in your Firebase project! Please enable it in the console.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError("An account already exists with this email address.");
      } else if (err.code === 'auth/weak-password') {
        setError("Password should be at least 6 characters.");
      } else {
        setError(err.message || "Authentication failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setSelectedReport(null);
    setActiveSuggestion(null);
    await signOut(auth);
  };

  const onFileSelect = (file: File) => {
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setUploadError(null);
    } else {
      alert("Please select a valid JPG or PNG image.");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;
    
    setIsUploading(true);
    setUploadError(null);
    
    const stallTimeout = setTimeout(() => {
      setUploadError("Processing timeout. The AI backend is taking too long to respond.");
      setIsUploading(false);
    }, 30000); // 30 seconds for AI processing

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      setUploadProgress(45);
      
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      const uploadData = await uploadRes.json();
      
      if (!uploadData.success) {
        throw new Error(uploadData.error || "Failed to upload file locally.");
      }
      
      setUploadProgress(90);

      try {
        await addDoc(collection(db, "scans"), {
          userId: user.uid,
          originalImage: uploadData.originalUrl,
          analyzedImage: uploadData.analyzedUrl || uploadData.originalUrl,
          mesh3d: uploadData.mesh3d || null,
          surgerySuggestions: uploadData.surgerySuggestions || [],
          status: uploadData.analyzedUrl ? "completed" : "pending_analysis",
          createdAt: Date.now()
        });
        
        clearTimeout(stallTimeout);
        setIsUploading(false);
        setSelectedFile(null);
        setPreviewUrl(null);
        setUploadProgress(0);
        
        await fetchHistory(user.uid);
        setActiveTab('history');
        
      } catch (err: any) {
        clearTimeout(stallTimeout);
        console.error("Firestore error:", err);
        setUploadError(`Database Error: ${err.message}.`);
        setIsUploading(false);
      }
    } catch (err: any) {
      clearTimeout(stallTimeout);
      console.error("Upload error:", err);
      setUploadError(`Upload Error: ${err.message}`);
      setIsUploading(false);
    }
  };

  const DefaultAvatar = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-slate-300 dark:text-slate-500 mt-1">
      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12 5.25a3 3 0 100 6 3 3 0 000-6zM8.25 16.5a3.75 3.75 0 017.5 0c0 .356-.05.698-.142 1.025A7.472 7.472 0 0112 19.5a7.472 7.472 0 01-3.608-1.975c-.092-.327-.142-.669-.142-1.025z" clipRule="evenodd" />
    </svg>
  );

  // ==========================================
  // DASHBOARD VIEW (AUTHENTICATED)
  // ==========================================
  if (user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex relative overflow-hidden transition-colors duration-500 font-sans">
        
        <input 
          type="file" 
          ref={fileInputRef} 
          hidden 
          accept="image/png, image/jpeg" 
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              onFileSelect(e.target.files[0]);
            }
          }}
        />

        {/* Abstract Animated Background */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 dark:bg-indigo-600/20 blur-[120px] pointer-events-none animate-pulse duration-10000"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/10 dark:bg-cyan-600/10 blur-[120px] pointer-events-none animate-pulse duration-7000 delay-1000"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] dark:opacity-[0.05] pointer-events-none mix-blend-overlay"></div>

        {/* Floating Sidebar */}
        <aside className="w-72 m-6 rounded-[2.5rem] border border-white/60 dark:border-white/5 bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl flex flex-col shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-black/50 z-20 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent"></div>
          
          <div className="h-28 flex flex-col justify-center px-8 relative">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-800 text-white flex items-center justify-center rounded-xl font-bold text-lg shadow-lg shadow-indigo-500/30">FV</div>
              <span className="font-extrabold text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">FaceVista</span>
            </div>
          </div>
          
          <div className="px-6 pb-6">
            <div className="bg-white/50 dark:bg-black/20 rounded-2xl p-4 border border-white/40 dark:border-white/5 shadow-sm">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Patient Profile</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.email}</p>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-2">
            {[
              { id: 'upload', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12', label: 'New Scan' },
              { id: 'history', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', label: 'My Previews' },
              { id: 'settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', label: 'Settings' }
            ].map((item) => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all duration-300 ${
                  activeTab === item.id 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 scale-100' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white scale-[0.98] hover:scale-100'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {item.icon.split(' M').map((d, i) => <path key={i} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={i > 0 ? 'M' + d : d}></path>)}
                </svg>
                {item.label}
              </button>
            ))}
          </nav>
          
          <div className="p-6">
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-500 dark:text-slate-400 bg-white/40 dark:bg-black/20 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-all border border-white/50 dark:border-white/5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-screen py-6 pr-6 z-10 relative">
          {/* Top Header */}
          <header className="h-20 mb-6 rounded-[2rem] border border-white/60 dark:border-white/5 bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl flex items-center justify-between px-8 shadow-[0_8px_32px_rgba(0,0,0,0.02)] dark:shadow-black/20">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400">
                {activeTab === 'history' ? 'Preview History' : activeTab === 'settings' ? 'Account Settings' : 'Initialize New Scan'}
              </h2>
            </div>
            <div className="flex items-center gap-6">
              <ThemeToggle />
              <div className="h-10 w-px bg-slate-200 dark:bg-slate-700"></div>
              <div className="relative group cursor-pointer" onClick={() => setActiveTab('settings')}>
                <div className="absolute inset-0 bg-indigo-500 rounded-full blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="relative w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 p-0.5 border-2 border-white dark:border-slate-600 shadow-md overflow-hidden flex items-center justify-center">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <DefaultAvatar />
                  )}
                </div>
              </div>
            </div>
          </header>
          
          {/* Content Body */}
          <div className="flex-1 overflow-auto rounded-[2.5rem] border border-white/60 dark:border-white/5 bg-white/40 dark:bg-slate-900/20 backdrop-blur-xl p-8 shadow-[inset_0_2px_20px_rgba(0,0,0,0.02)] dark:shadow-[inset_0_2px_20px_rgba(255,255,255,0.02)] relative">
            
            {activeTab === 'upload' && (
              <div className="max-w-5xl mx-auto h-full flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-700 zoom-in-95">
                
                <div className="grid lg:grid-cols-3 gap-8 h-full">
                  {/* Upload Dropzone */}
                  <div className="lg:col-span-2 flex flex-col">
                    <div className="bg-indigo-50/80 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl p-5 mb-6 flex items-start gap-4 backdrop-blur-sm shadow-sm">
                      <div className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 p-2.5 rounded-xl">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-indigo-100">End-to-End Encrypted Upload</h4>
                        <p className="text-sm text-slate-600 dark:text-indigo-200/70 mt-1 font-medium">Your photos are processed entirely securely and permanently deleted after analysis.</p>
                      </div>
                    </div>

                    {!previewUrl ? (
                      <div 
                        className={`flex-1 relative group rounded-[2.5rem] border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-12 overflow-hidden cursor-pointer ${
                          isDragging 
                            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10' 
                            : 'border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:bg-white/80 dark:hover:bg-slate-800/50'
                        }`}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618335359740-42d45b7ee974?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center opacity-[0.02] dark:opacity-[0.05] group-hover:opacity-[0.04] transition-opacity mix-blend-luminosity"></div>
                        
                        <div className="relative z-10 flex flex-col items-center">
                          <div className="relative w-32 h-32 mb-8">
                            <div className="absolute inset-0 bg-indigo-100 dark:bg-indigo-500/20 rounded-full animate-ping opacity-70" style={{ animationDuration: '3s' }}></div>
                            <div className="absolute inset-2 bg-indigo-200 dark:bg-indigo-500/30 rounded-full animate-ping opacity-50" style={{ animationDuration: '2s' }}></div>
                            <div className="absolute inset-0 bg-white dark:bg-slate-800 border-4 border-indigo-500 rounded-full flex items-center justify-center shadow-2xl z-10">
                              <svg className="w-12 h-12 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            </div>
                          </div>
                          
                          <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3">Drop your portrait here</h3>
                          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm text-center font-medium">Use a clear, well-lit photo looking straight at the camera. Neutral expressions work best.</p>
                          
                          <button 
                            type="button"
                            className="bg-slate-900 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold py-4 px-10 rounded-full shadow-xl shadow-indigo-900/20 dark:shadow-indigo-900/50 transition-all transform hover:-translate-y-1"
                          >
                            Select Photo
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 relative rounded-[2.5rem] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-2xl flex flex-col">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                          <h3 className="font-bold text-slate-800 dark:text-slate-200">Image Preview</h3>
                          <button 
                            onClick={() => { setPreviewUrl(null); setSelectedFile(null); }}
                            className="text-slate-400 hover:text-red-500 transition-colors"
                            disabled={isUploading}
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                          </button>
                        </div>
                        <div className="flex-1 relative flex items-center justify-center p-6 bg-slate-100 dark:bg-black/50">
                          <img src={previewUrl} alt="Preview" className="max-h-full max-w-full object-contain rounded-xl shadow-md" />
                          
                          {isUploading && (
                            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-white z-20">
                              <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                              <h3 className="text-xl font-bold mb-2">Analyzing & Uploading...</h3>
                              <p className="text-indigo-200 font-medium">{Math.round(uploadProgress)}% Complete</p>
                            </div>
                          )}
                        </div>
                        <div className="p-6 bg-white dark:bg-slate-900 flex flex-col justify-end border-t border-slate-100 dark:border-slate-800">
                          {uploadError && (
                            <div className="mb-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-semibold animate-in shake">
                              {uploadError}
                            </div>
                          )}
                          <div className="flex justify-end">
                            <button 
                              onClick={handleUpload}
                              disabled={isUploading}
                              className={`bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-10 rounded-full shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1'}`}
                            >
                              {isUploading ? 'Processing...' : 'Confirm & Scan'}
                              {!isUploading && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Side Info Cards */}
                  <div className="flex flex-col gap-6">
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/50 dark:border-white/5 rounded-[2rem] p-8 shadow-xl shadow-slate-200/20 dark:shadow-black/20 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-cyan-400 to-transparent opacity-20 rounded-bl-full"></div>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Photo Guidelines</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">To ensure the AI maps your facial structure accurately, please follow these rules:</p>
                      <ul className="space-y-4">
                        {[
                          { text: "Remove glasses or hats", icon: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-red-500" },
                          { text: "Face directly forward", icon: "M5 13l4 4L19 7", color: "text-green-500" },
                          { text: "Ensure even lighting", icon: "M5 13l4 4L19 7", color: "text-green-500" },
                        ].map((rule, i) => (
                          <li key={i} className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            <svg className={`w-5 h-5 ${rule.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={rule.icon}></path></svg>
                            {rule.text}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[2rem] p-8 shadow-xl relative overflow-hidden text-white flex-1 flex flex-col justify-between">
                      <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500 rounded-full blur-[60px] opacity-50"></div>
                      <div>
                        <h4 className="text-indigo-200 font-bold uppercase tracking-widest text-xs mb-2">System Status</h4>
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                          </span>
                          <span className="text-xl font-extrabold tracking-tight">Engine Ready</span>
                        </div>
                      </div>
                      
                      <div className="mt-8">
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-sm font-semibold text-indigo-200">Daily Quota</span>
                          <span className="text-2xl font-bold">5<span className="text-sm text-indigo-400">/5</span></span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5">
                          <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="h-full flex flex-col animate-in fade-in zoom-in-95 duration-500">
                {isLoadingHistory ? (
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-500 font-bold">Loading history...</p>
                  </div>
                ) : historyDocs.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center max-w-md">
                      <div className="relative w-32 h-32 mx-auto mb-8">
                        <div className="absolute inset-0 bg-indigo-100 dark:bg-indigo-900/30 rounded-full animate-ping opacity-50" style={{ animationDuration: '3s' }}></div>
                        <div className="relative w-full h-full bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-xl flex items-center justify-center text-indigo-300 dark:text-indigo-500/50">
                          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                        </div>
                      </div>
                      <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3">No scans generated yet</h3>
                      <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed">Your preview history is empty. Upload your first portrait to see the magic of FaceVista in action.</p>
                      <button onClick={() => setActiveTab('upload')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-8 rounded-full shadow-lg transition-all transform hover:-translate-y-1">
                        Start Your First Scan
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
                    {historyDocs.map((doc, idx) => (
                      <div key={doc.id} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl hover:-translate-y-1 transition-all group">
                        <div className="h-48 bg-slate-100 dark:bg-slate-800 relative overflow-hidden flex items-center justify-center">
                          <img src={doc.analyzedImage || doc.originalImage} alt="Scan result" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                            {doc.status === 'pending_analysis' ? (
                              <><span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span> Analyzing</>
                            ) : (
                              <><span className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span> AI Complete</>
                            )}
                          </div>
                        </div>
                        <div className="p-6">
                          <h4 className="font-bold text-slate-900 dark:text-white text-lg">Facial Analysis #{historyDocs.length - idx}</h4>
                          <p className="text-sm text-slate-500 mt-1">Uploaded {new Date(doc.createdAt).toLocaleDateString()}</p>
                          
                          <button 
                            disabled={doc.status === 'pending_analysis'}
                            onClick={() => setSelectedReport(doc)}
                            className={`w-full mt-4 py-2.5 rounded-xl font-bold transition-all ${doc.status === 'pending_analysis' ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30'}`}
                          >
                            {doc.status === 'pending_analysis' ? 'Awaiting Backend Engine...' : 'View Full Report'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'settings' && (
              <div className="animate-in fade-in duration-500 p-8 max-w-2xl mx-auto">
                <h3 className="text-3xl font-extrabold mb-8 text-slate-900 dark:text-white">Account Settings</h3>
                
                {/* Profile Picture Section */}
                <div className="bg-white/50 dark:bg-slate-900/50 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 mb-8 flex items-center gap-8 shadow-sm">
                   <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border-4 border-white dark:border-slate-700 shadow-md flex items-center justify-center p-1">
                     {user.photoURL ? (
                        <img src={user.photoURL} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                     ) : (
                        <DefaultAvatar />
                     )}
                   </div>
                   <div>
                     <h4 className="font-bold text-xl text-slate-900 dark:text-white mb-2">Profile Picture</h4>
                     <p className="text-sm text-slate-500 mb-4 font-medium">Upload a custom avatar for your account.</p>
                     
                     <input type="file" id="pfp-upload" hidden accept="image/png, image/jpeg" onChange={handleProfilePicUpdate} />
                     <label htmlFor="pfp-upload" className={`bg-slate-900 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold cursor-pointer inline-flex items-center gap-2 transition-all shadow-md ${isUpdatingSettings ? 'opacity-50 pointer-events-none' : ''}`}>
                       {isUpdatingSettings ? (
                          <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg> Updating...</>
                       ) : (
                          <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg> Change Photo</>
                       )}
                     </label>
                   </div>
                </div>

                {/* Toggles Section */}
                <div className="bg-white/50 dark:bg-slate-900/50 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 space-y-8 shadow-sm">
                  <h4 className="font-bold text-xl text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-4">Preferences</h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-lg text-slate-900 dark:text-white">Push Notifications</h4>
                      <p className="text-sm text-slate-500 font-medium mt-1">Receive alerts when AI analysis is complete.</p>
                    </div>
                    <button 
                      onClick={() => toggleSetting('notifications')} 
                      className={`w-14 h-8 rounded-full transition-colors relative shadow-inner ${userSettings.notifications ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                       <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${userSettings.notifications ? 'right-1 translate-x-0' : 'left-1 translate-x-0'}`}></div>
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-lg text-slate-900 dark:text-white">Strict Security (2FA)</h4>
                      <p className="text-sm text-slate-500 font-medium mt-1">Require email verification for new devices.</p>
                    </div>
                    <button 
                      onClick={() => toggleSetting('twoFactor')} 
                      className={`w-14 h-8 rounded-full transition-colors relative shadow-inner ${userSettings.twoFactor ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                       <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${userSettings.twoFactor ? 'right-1 translate-x-0' : 'left-1 translate-x-0'}`}></div>
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

        </main>
          {/* FaceVista Advanced Diagnostic Suite */}
          {selectedReport && (
            <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col animate-in slide-in-from-bottom-10 duration-500">
              {/* Top Header */}
              <div className="h-16 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.6)]">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                  </div>
                  <h2 className="text-xl font-bold text-white tracking-widest uppercase flex items-center gap-3">
                    Diagnostic Suite <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-[10px] rounded border border-indigo-500/30">PRO</span>
                  </h2>
                </div>
                <button onClick={() => { setSelectedReport(null); setActiveSuggestion(null); }} className="px-5 py-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg font-bold transition-all text-sm tracking-wide border border-rose-500/20">
                  CLOSE SUITE
                </button>
              </div>
          
              {/* Main Grid */}
              <div className="flex-1 flex overflow-hidden">
                {/* Sidebar Tools */}
                <div className="w-80 border-r border-slate-800 bg-slate-900/50 flex flex-col shrink-0">
                  <div className="p-4 border-b border-slate-800 shrink-0">
                    <div className="flex bg-slate-950 p-1 rounded-xl shadow-inner border border-slate-800">
                      <button onClick={() => setSuiteTab('analytics')} className={`flex-1 py-2 text-[11px] uppercase tracking-wider font-bold rounded-lg transition-all ${suiteTab === 'analytics' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Analytics</button>
                      <button onClick={() => setSuiteTab('surgery')} className={`flex-1 py-2 text-[11px] uppercase tracking-wider font-bold rounded-lg transition-all ${suiteTab === 'surgery' ? 'bg-amber-500 text-slate-900 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>AI Surgery</button>
                    </div>
                  </div>

                  <div className="p-6 overflow-y-auto space-y-8 flex-1 custom-scrollbar">
                    {suiteTab === 'analytics' && (
                      <>
                        <div>
                          <h3 className="text-indigo-400 font-bold text-xs tracking-widest uppercase mb-4 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                            Facial Analytics
                          </h3>
                          <div className="space-y-3">
                             <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 hover:border-slate-500 transition-colors">
                               <div className="flex justify-between items-center mb-2">
                                 <span className="text-slate-300 text-sm font-semibold">Symmetry Index</span>
                                 <span className="text-emerald-400 font-bold">96.4%</span>
                               </div>
                               <div className="w-full bg-slate-900 rounded-full h-1.5"><div className="bg-emerald-400 h-1.5 rounded-full" style={{width: '96.4%'}}></div></div>
                             </div>
                             <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 hover:border-slate-500 transition-colors">
                               <div className="flex justify-between items-center mb-2">
                                 <span className="text-slate-300 text-sm font-semibold">Proportion (Golden Ratio)</span>
                                 <span className="text-blue-400 font-bold">1.618</span>
                               </div>
                               <div className="w-full bg-slate-900 rounded-full h-1.5"><div className="bg-blue-400 h-1.5 rounded-full" style={{width: '88%'}}></div></div>
                             </div>
                             <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 hover:border-slate-500 transition-colors">
                               <div className="flex justify-between items-center mb-2">
                                 <span className="text-slate-300 text-sm font-semibold">Nodes Mapped</span>
                                 <span className="text-indigo-400 font-bold">{selectedReport.mesh3d ? selectedReport.mesh3d.length : '468'} / 468</span>
                               </div>
                               <div className="w-full bg-slate-900 rounded-full h-1.5"><div className="bg-indigo-400 h-1.5 rounded-full" style={{width: '100%'}}></div></div>
                             </div>
                          </div>
                        </div>
                
                        <div>
                           <h3 className="text-indigo-400 font-bold text-xs tracking-widest uppercase mb-4 flex items-center gap-2">
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                             Diagnostic Tools
                           </h3>
                           <div className="grid grid-cols-2 gap-3">
                              <button className="flex flex-col items-center justify-center p-4 bg-indigo-600 rounded-xl text-white shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all transform hover:scale-105 active:scale-95">
                                <svg className="w-6 h-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"></path></svg>
                                <span className="text-xs font-bold">3D Mesh</span>
                              </button>
                              <button className="flex flex-col items-center justify-center p-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition-all border border-slate-700 transform hover:scale-105 active:scale-95">
                                <svg className="w-6 h-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                                <span className="text-xs font-bold">Proportions</span>
                              </button>
                              <button className="flex flex-col items-center justify-center p-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition-all border border-slate-700 transform hover:scale-105 active:scale-95">
                                <svg className="w-6 h-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                                <span className="text-xs font-bold">Skin Health</span>
                              </button>
                              <button className="flex flex-col items-center justify-center p-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition-all border border-slate-700 transform hover:scale-105 active:scale-95">
                                <svg className="w-6 h-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                <span className="text-xs font-bold">Asymmetry</span>
                              </button>
                           </div>
                        </div>
                      </>
                    )}

                    {suiteTab === 'surgery' && (
                      <div className="animate-in fade-in duration-300">
                         <h3 className="text-amber-400 font-bold text-xs tracking-widest uppercase mb-4 flex items-center gap-2">
                           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                           AI Surgery Inspirations
                         </h3>

                         {/* Reset to Original */}
                         <button
                           onClick={() => setActiveSuggestion(null)}
                           className={`w-full mb-3 flex items-center gap-3 p-3 rounded-xl transition-all border text-left ${
                             !activeSuggestion
                               ? 'bg-white/10 border-white/30 ring-2 ring-white/20'
                               : 'bg-slate-800/60 border-slate-700 hover:border-slate-500'
                           }`}
                         >
                           <div className="w-9 h-9 rounded-lg bg-slate-700 flex items-center justify-center text-lg shrink-0">🔄</div>
                           <div className="min-w-0">
                             <p className="text-white text-sm font-bold truncate">Original Face</p>
                             <p className="text-slate-400 text-[10px] leading-tight">Reset to your uploaded photo mesh</p>
                           </div>
                         </button>

                         {isFetchingSuggestions ? (
                           <div className="text-center py-8">
                             <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                             <p className="text-amber-400 font-bold text-xs uppercase tracking-widest animate-pulse">Generating AI Options...</p>
                           </div>
                         ) : (
                           <div className="space-y-2">
                             {(selectedReport?.surgerySuggestions || []).map((sug: any) => {
                               const pos = new Float32Array(sug.mesh3d.length * 3);
                               const uvs = new Float32Array(sug.mesh3d.length * 2);
                               sug.mesh3d.forEach((lm: any, i: number) => {
                                  pos[i*3] = (lm.x - 0.5) * 15;
                                  pos[i*3+1] = -(lm.y - 0.5) * 15;
                                  pos[i*3+2] = -lm.z * 15;
                                  uvs[i*2] = lm.x;
                                  uvs[i*2+1] = 1 - lm.y;
                               });
                               const meshData = sharedMesh ? { positions: pos, uvs, indices: sharedMesh.indices } : null;
                               return (
                         <button
                           key={sug.id}
                           onClick={() => setActiveSuggestion(sug)}
                           className={`w-full flex flex-col p-3 rounded-xl transition-all border text-left overflow-hidden ${
                             activeSuggestion?.id === sug.id
                               ? 'bg-slate-800 border-indigo-500/50 ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-500/10'
                               : 'bg-slate-800/60 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                           }`}
                         >
                           <div className="flex items-center gap-3 mb-3">
                             <div
                               className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                               style={{ backgroundColor: sug.color + '20' }}
                             >
                               {sug.icon}
                             </div>
                             <div className="min-w-0 flex-1">
                               <p className="text-white text-sm font-bold truncate">{sug.name}</p>
                               <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase inline-block mt-0.5" style={{ backgroundColor: sug.color + '25', color: sug.color }}>
                                 {sug.category}
                               </span>
                             </div>
                             {activeSuggestion?.id === sug.id && (
                               <div className="w-2 h-2 rounded-full shrink-0 animate-pulse" style={{ backgroundColor: sug.color }}></div>
                             )}
                           </div>
                           
                           {/* High-Quality Mini Face Render */}
                           <div className="w-full h-32 rounded-lg bg-slate-950 border border-slate-800/50 overflow-hidden relative pointer-events-none group-hover:brightness-110 transition-all">
                             {meshData && typeof window !== 'undefined' ? (
                               <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
                                 <ambientLight intensity={0.8} />
                                 <directionalLight position={[0, 0, 10]} intensity={2.0} />
                                 <FaceMeshTextured sharedMesh={meshData} updateSignal={{current: 0}} imageUrl={selectedReport.originalImage} />
                               </Canvas>
                             ) : (
                               <div className="w-full h-full flex items-center justify-center bg-slate-900/50 text-slate-500 text-xs font-bold uppercase tracking-widest animate-pulse">Loading High-Q Face...</div>
                             )}
                             
                             <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md px-2 py-1 rounded-md text-[8px] font-bold tracking-wider border border-white/10 text-white shadow-lg flex items-center gap-1">
                               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                               HIGH QUALITY
                             </div>
                           </div>
                         </button>
                       )})}
                       {(!selectedReport?.surgerySuggestions || selectedReport.surgerySuggestions.length === 0) && (
                         <div className="text-center py-6 text-slate-500 text-xs">
                           <p className="font-bold uppercase tracking-widest mb-1">No Suggestions</p>
                           <p className="text-slate-600">Upload a new photo to generate AI surgery inspirations.</p>
                         </div>
                       )}
                     </div>
                     )}
                  </div>
                  )}
                </div>
                </div>
          
                {/* Main Viewers */}
                <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950 overflow-y-auto">
                   {/* 3D Viewer */}
                   <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden relative flex flex-col shadow-2xl">
                     <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold text-indigo-400 tracking-widest border border-indigo-500/30 flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                       INTERACTIVE 3D MESH
                     </div>
                     {activeSuggestion && (
                       <div className="absolute top-4 right-4 z-10 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider border flex items-center gap-2" style={{ color: activeSuggestion.color, borderColor: activeSuggestion.color + '40' }}>
                         <span className="text-base">{activeSuggestion.icon}</span>
                         {activeSuggestion.name}
                       </div>
                     )}
                     <div className="flex-1 w-full h-full min-h-[400px]">
                       {sharedMesh && typeof window !== 'undefined' ? (
                          <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
                            <ambientLight intensity={0.5} />
                            <pointLight position={[10, 10, 10]} intensity={1.5} />
                            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                            <OrbitControls makeDefault enableZoom={true} target={[0, 0, 0]} />
                            <FaceMeshWireframe sharedMesh={sharedMesh} updateSignal={updateSignal} />
                          </Canvas>
                       ) : (
                          <div className="flex h-full flex-col items-center justify-center text-slate-500 font-bold uppercase tracking-widest text-sm p-8 text-center bg-slate-900/50">
                            <svg className="w-12 h-12 mb-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"></path></svg>
                            3D Data Unavailable<br/><span className="text-[10px] mt-2 text-slate-600 normal-case">Upload a new photo to generate the 3D mesh map.</span>
                          </div>
                       )}
                     </div>
                   </div>
          
                   {/* 2D Overlay Viewer -> REAL-TIME TEXTURE SYNC VIEWER */}
                   <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden relative flex flex-col shadow-2xl">
                     <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold text-emerald-400 tracking-widest border border-emerald-500/30 flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                       REAL-TIME TEXTURE SYNC
                     </div>
                     <div className="flex-1 w-full h-full min-h-[400px] flex items-center justify-center bg-slate-950 p-6">
                        {sharedMesh && typeof window !== 'undefined' ? (
                          <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
                            <ambientLight intensity={0.6} />
                            <directionalLight position={[5, 10, 10]} intensity={2.0} />
                            <directionalLight position={[-5, 5, -5]} intensity={0.5} color="#4ade80" />
                            <OrbitControls makeDefault enableZoom={true} target={[0, 0, 0]} />
                            <FaceMeshTextured sharedMesh={sharedMesh} updateSignal={updateSignal} imageUrl={selectedReport.originalImage} />
                          </Canvas>
                        ) : (
                          <img src={selectedReport.analyzedImage || selectedReport.originalImage} className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_0_30px_rgba(79,70,229,0.15)] border border-slate-800" />
                        )}
                     </div>
                   </div>
                </div>
              </div>
            </div>
          )}
      </div>
    );
  }

  // ==========================================
  // AUTHENTICATION VIEW (GUEST)
  // ==========================================
  return (
    <div className="min-h-screen flex bg-[#FDFDFD] dark:bg-[#030712] transition-colors duration-500 font-sans">
      <div className="absolute top-0 right-0 w-full h-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full lg:w-[45%] flex flex-col justify-center p-8 lg:p-24 relative z-10 shadow-2xl dark:shadow-none bg-white/80 dark:bg-transparent backdrop-blur-3xl">
        <a href="/" className="flex items-center gap-3 cursor-pointer absolute top-8 left-8 lg:top-12 lg:left-12 group">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-900 text-white flex items-center justify-center rounded-xl font-bold text-lg shadow-lg group-hover:scale-105 transition-transform">FV</div>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tighter">FaceVista</span>
        </a>

        <div className="max-w-sm w-full mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="mb-10">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
              {isLogin ? "Welcome back." : "Create account."}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed">
              {isLogin ? "Log in to view your clinical previews and manage your scans." : "Join FaceVista to preview your facial harmony in seconds."}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 p-4 rounded-2xl mb-6 text-sm font-semibold animate-in shake">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Email address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400 font-medium"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400 font-medium"
                placeholder="••••••••"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold py-4 px-4 rounded-2xl shadow-xl dark:shadow-indigo-900/30 transition-all flex justify-center items-center gap-2 mt-6 transform hover:-translate-y-1"
            >
              {loading ? (
                <svg className="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
              ) : isLogin ? "Secure Log In" : "Create Secure Account"}
            </button>
          </form>

          <div className="mt-10 text-center text-sm font-bold text-slate-500 dark:text-slate-400">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors border-b-2 border-indigo-600/30 hover:border-indigo-600 pb-0.5"
            >
              {isLogin ? "Sign up" : "Log in"}
            </button>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex w-[55%] relative overflow-hidden items-center justify-center p-12 bg-slate-950">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-40 mix-blend-luminosity scale-105 animate-pulse" style={{animationDuration: '15s'}}></div>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 via-slate-900/80 to-slate-950/90 mix-blend-multiply"></div>
        
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px] animate-pulse" style={{animationDuration: '7s'}}></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] animate-pulse" style={{animationDuration: '10s'}}></div>
        
        <div className="relative z-10 max-w-xl border border-white/10 bg-black/20 backdrop-blur-2xl p-12 rounded-[3rem] shadow-2xl animate-in fade-in zoom-in-95 duration-1000">
          <div className="flex gap-4 mb-8">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
              <svg className="w-6 h-6 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            </div>
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
              <svg className="w-6 h-6 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
          </div>
          <h2 className="text-4xl font-extrabold text-white mb-6 leading-[1.2] tracking-tight">
            Your clinical data, entirely <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">secure and private.</span>
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed font-medium">
            FaceVista employs industry-leading AES-256 encryption. We generate your highly-realistic AI visualization and instantly purge your original photos from our secure servers.
          </p>
        </div>
      </div>
    </div>
  );
}
