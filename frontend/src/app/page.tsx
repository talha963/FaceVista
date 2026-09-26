import React from 'react';
import { ThemeToggle } from '../components/theme-toggle';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 selection:bg-indigo-100 selection:text-indigo-900 dark:selection:bg-indigo-900/50 dark:selection:text-indigo-100 transition-colors duration-300">
      
      {/* Navigation Bar */}
      <header className="fixed w-full top-0 z-50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 transition-all">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-900 text-white flex items-center justify-center rounded-xl font-bold text-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50">
                FV
              </div>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tighter">FaceVista</span>
              <span className="hidden sm:inline-block ml-3 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-900/30 px-2.5 py-1 rounded-full border border-indigo-100 dark:border-indigo-800 tracking-widest uppercase">
                Clinical Preview Platform
              </span>
            </div>
            <nav className="hidden md:flex space-x-10">
              <a href="#how-it-works" className="text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold transition-colors">How it Works</a>
              <a href="#procedures" className="text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold transition-colors">Procedures</a>
              <a href="#benefits" className="text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold transition-colors">Benefits</a>
              <a href="#faq" className="text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold transition-colors">FAQ</a>
            </nav>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <a href="/portal" className="bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-sm px-6 py-2.5 rounded-full font-semibold transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 transform inline-block">
                Patient Portal
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32 border-b border-slate-100 dark:border-slate-800/50">
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-40 dark:opacity-20"></div>
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white dark:from-slate-950 to-transparent"></div>

        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 flex flex-col lg:flex-row items-center gap-16">
          
          <div className="lg:w-[55%]">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-8 tracking-wide shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400 mr-2 animate-pulse"></span>
              Smart Facial Preview
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 dark:text-white leading-[1.05] mb-6 tracking-tighter">
              See your future results with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 dark:from-indigo-400 dark:to-cyan-400">total clarity.</span>
            </h1>
            <p className="text-xl text-slate-500 dark:text-slate-400 mb-10 leading-relaxed font-medium max-w-2xl">
              FaceVista helps you and your surgeon get on the exact same page. We securely scan your facial photo to create highly realistic, natural-looking previews before you ever step into the consultation room.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="/portal" className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold px-8 py-4 rounded-full shadow-[0_8px_30px_rgba(79,70,229,0.3)] transition-all flex items-center justify-center group hover:-translate-y-1">
                Start Your Preview
                <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </a>
              <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-lg font-bold px-8 py-4 rounded-full shadow-sm transition-all flex items-center justify-center">
                View Gallery
              </button>
            </div>
          </div>

          <div className="lg:w-[45%] w-full relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-blue-300 transform translate-x-4 translate-y-4 rounded-[2rem] opacity-20 dark:opacity-40 blur-xl"></div>
            <div className="relative rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/60 dark:border-white/10 bg-white dark:bg-slate-900 group">
              
              <div className="relative aspect-[4/5]">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1000" 
                  alt="Facial Analysis Subject" 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                
                <div className="absolute inset-0 bg-indigo-900/10 dark:bg-indigo-900/40 mix-blend-multiply"></div>
                
                <div className="absolute left-0 right-0 h-1 bg-indigo-400/80 shadow-[0_0_20px_rgba(99,102,241,1)] animate-[scan_3s_ease-in-out_infinite]"></div>

                <div className="absolute top-[42%] left-[38%] w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,1)]">
                  <div className="absolute w-6 h-6 border border-cyan-400/50 rounded-full -left-[9px] -top-[9px] animate-ping"></div>
                </div>
                <div className="absolute top-[42%] left-[62%] w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,1)]">
                  <div className="absolute w-6 h-6 border border-cyan-400/50 rounded-full -left-[9px] -top-[9px] animate-ping" style={{animationDelay: '0.5s'}}></div>
                </div>
                <div className="absolute top-[58%] left-[50%] w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,1)]">
                  <div className="absolute w-8 h-8 border border-indigo-400/50 rounded-full -left-[13px] -top-[13px] animate-ping" style={{animationDelay: '1s'}}></div>
                </div>
                {/* Note: I've removed the Analysis Active widget that was at the bottom left */}
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Supported Procedures Section */}
      <section id="procedures" className="py-32 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-indigo-600 dark:text-indigo-400 font-extrabold tracking-widest uppercase text-xs mb-4">Targeted Modifications</h2>
            <h3 className="text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">Areas We Can Preview</h3>
            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">Our smart system is specially trained to map and preview highly accurate changes across these key facial zones.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Rhinoplasty */}
            <div className="group rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-all bg-white dark:bg-slate-900 hover:-translate-y-1 duration-300">
              <div className="h-56 overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800" alt="Nose Profile" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
              </div>
              <div className="p-8">
                <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">Nose (Rhinoplasty)</h4>
                <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed">Preview changes to the bridge of your nose, the shape of the tip, and how it balances with the rest of your face.</p>
                <ul className="space-y-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 mr-3"></span> Bridge Straightening</li>
                  <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 mr-3"></span> Tip Refinement</li>
                  <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 mr-3"></span> Width Adjustment</li>
                </ul>
              </div>
            </div>

            {/* Genioplasty */}
            <div className="group rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-all bg-white dark:bg-slate-900 hover:-translate-y-1 duration-300">
              <div className="h-56 overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&q=80&w=800" alt="Chin Profile" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
              </div>
              <div className="p-8">
                <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">Chin (Genioplasty)</h4>
                <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed">See how a stronger or softer chin profile can completely change your facial harmony from the side and front.</p>
                <ul className="space-y-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 mr-3"></span> Forward Projection</li>
                  <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 mr-3"></span> Chin Reduction</li>
                  <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 mr-3"></span> Shape Balancing</li>
                </ul>
              </div>
            </div>

            {/* Jawline */}
            <div className="group rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-all bg-white dark:bg-slate-900 hover:-translate-y-1 duration-300">
              <div className="h-56 overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800" alt="Jawline Structure" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
              </div>
              <div className="p-8">
                <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">Jaw Contouring</h4>
                <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed">Preview what a slimmer, sharper, or more defined jawline would look like to improve overall symmetry.</p>
                <ul className="space-y-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 mr-3"></span> Angle Enhancement</li>
                  <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 mr-3"></span> Slimming Effects</li>
                  <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 mr-3"></span> Symmetry Correction</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simplified, User-Friendly How it Works */}
      <section id="how-it-works" className="py-32 bg-[#060B14] relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-24">
            <h2 className="text-cyan-400 font-extrabold tracking-widest uppercase text-xs mb-4">Simple Process</h2>
            <h3 className="text-4xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight">FaceVista Work Process</h3>
            <p className="text-lg text-slate-400 font-medium">We've made it incredibly easy to see your options before you ever book an appointment.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Step 1 */}
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[2rem] hover:bg-white/10 transition-colors group relative overflow-hidden mt-0 lg:mt-0">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8 border border-white/10 text-cyan-400 font-black text-2xl">
                1
              </div>
              <h4 className="text-2xl font-bold mb-3 text-white tracking-tight">Upload Photo</h4>
              <p className="text-slate-400 text-sm leading-relaxed">Securely upload a clear photo of your face from your phone or computer. We keep everything completely private.</p>
            </div>

            {/* Step 2 */}
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[2rem] hover:bg-white/10 transition-colors group relative overflow-hidden mt-0 lg:mt-12">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8 border border-white/10 text-indigo-400 font-black text-2xl">
                2
              </div>
              <h4 className="text-2xl font-bold mb-3 text-white tracking-tight">Smart Analysis</h4>
              <p className="text-slate-400 text-sm leading-relaxed">Our smart technology scans your facial structure to understand your natural proportions and bone structure.</p>
            </div>

            {/* Step 3 */}
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[2rem] hover:bg-white/10 transition-colors group relative overflow-hidden mt-0 lg:mt-0">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8 border border-white/10 text-purple-400 font-black text-2xl">
                3
              </div>
              <h4 className="text-2xl font-bold mb-3 text-white tracking-tight">Preview Results</h4>
              <p className="text-slate-400 text-sm leading-relaxed">We generate highly realistic previews showing exactly what subtle, moderate, and noticeable changes would look like on you.</p>
            </div>

            {/* Step 4 */}
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[2rem] hover:bg-white/10 transition-colors group relative overflow-hidden mt-0 lg:mt-12">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8 border border-white/10 text-emerald-400 font-black text-2xl">
                4
              </div>
              <h4 className="text-2xl font-bold mb-3 text-white tracking-tight">Doctor Review</h4>
              <p className="text-slate-400 text-sm leading-relaxed">Take these previews straight to your surgeon so you both know exactly what your desired goal looks like.</p>
            </div>

          </div>
        </div>
      </section>

      {/* NEW SECTION: Patient / Doctor Benefits */}
      <section id="benefits" className="py-32 bg-indigo-50 dark:bg-slate-900/50 border-y border-indigo-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            
            {/* Animated & Live Plastic Surgery Face Window */}
            <div className="lg:w-1/2 relative">
              <div className="absolute inset-0 bg-indigo-600 dark:bg-indigo-500 rounded-3xl transform -rotate-3 scale-[1.02] opacity-10 dark:opacity-20"></div>
              
              <div className="rounded-3xl shadow-xl relative z-10 w-full overflow-hidden h-[500px] bg-slate-900 border border-slate-200 dark:border-slate-800">
                {/* Live Indicator */}
                <div className="absolute top-4 left-4 z-30 flex items-center bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-2 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                  <span className="text-[10px] text-white font-bold tracking-widest uppercase">Live Analysis</span>
                </div>

                {/* Clean Aesthetic Male Face Image */}
                <img 
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=1000" 
                  alt="Live Facial Analysis" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                
                <div className="absolute inset-0 bg-indigo-900/10 mix-blend-multiply z-10"></div>
                
                {/* Animated Scanning Laser */}
                <div className="absolute left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,1)] z-20 animate-[scan_3s_ease-in-out_infinite]"></div>

                {/* Dynamic Facial Mapping HUD */}
                <div className="absolute inset-0 z-20 pointer-events-none">
                  {/* Golden Ratio / Symmetry Lines */}
                  <div className="absolute top-[35%] left-[20%] right-[20%] border-t border-dashed border-cyan-300/50 animate-pulse">
                     <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-900/80 text-cyan-100 text-[8px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm border border-cyan-400/30">Upper Third: 33.2%</div>
                  </div>
                  
                  <div className="absolute top-[55%] left-[25%] right-[25%] border-t border-dashed border-indigo-300/50 animate-pulse" style={{animationDelay: '0.5s'}}>
                     <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-900/80 text-indigo-100 text-[8px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm border border-indigo-400/30">Middle Third: 33.4%</div>
                  </div>

                  <div className="absolute top-[75%] left-[30%] right-[30%] border-t border-dashed border-purple-300/50 animate-pulse" style={{animationDelay: '1s'}}>
                     <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-900/80 text-purple-100 text-[8px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm border border-purple-400/30">Lower Third: 33.4%</div>
                  </div>

                  {/* Vertical Symmetry Line */}
                  <div className="absolute top-[10%] bottom-[10%] left-1/2 border-l border-dashed border-white/30"></div>
                  
                  {/* Tracking Nodes */}
                  <div className="absolute top-[55%] left-[40%] w-2 h-2 rounded-full border-2 border-cyan-400 animate-ping"></div>
                  <div className="absolute top-[55%] right-[40%] w-2 h-2 rounded-full border-2 border-cyan-400 animate-ping" style={{animationDelay: '0.2s'}}></div>
                  <div className="absolute top-[75%] left-[50%] w-2 h-2 rounded-full border-2 border-indigo-400 animate-ping" style={{animationDelay: '0.4s'}}></div>
                </div>

              </div>

              {/* Trust Badge overlaying the bottom right */}
              <div className="absolute -bottom-6 -right-6 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl z-30 border border-slate-100 dark:border-slate-700 hidden md:block">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Analysis</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">100% Accuracy</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2">
              <h2 className="text-indigo-600 dark:text-indigo-400 font-extrabold tracking-widest uppercase text-xs mb-4">Why FaceVista?</h2>
              <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">Stop guessing. Start planning.</h3>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                The hardest part of cosmetic surgery is explaining what you want. Words like "natural," "subtle," or "a little smaller" mean different things to different people. FaceVista replaces confusing words with clear, visual options.
              </p>
              
              <ul className="space-y-6">
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mt-1"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg></div>
                  <div className="ml-4">
                    <h5 className="text-xl font-bold text-slate-900 dark:text-white">Feel Confident</h5>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">See how you might look before you ever commit to a procedure, removing the fear of the unknown.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mt-1"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg></div>
                  <div className="ml-4">
                    <h5 className="text-xl font-bold text-slate-900 dark:text-white">Better Doctor Visits</h5>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Take the guesswork out of your consultation. Show your surgeon exactly what you have in mind.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mt-1"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg></div>
                  <div className="ml-4">
                    <h5 className="text-xl font-bold text-slate-900 dark:text-white">Privacy First</h5>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Your photos are entirely encrypted and securely deleted from our servers automatically.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-32 bg-white dark:bg-slate-950">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">Frequently Asked Questions</h3>
            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">Everything you need to know about getting your previews.</p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 lg:p-8 border border-slate-100 dark:border-slate-800 transition-colors">
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Is my face photo kept private?</h4>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Absolutely. We use bank-level encryption (AES-256) to secure your photos. As soon as your previews are generated and delivered to you, the original photos are automatically wiped from our servers.</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 lg:p-8 border border-slate-100 dark:border-slate-800 transition-colors">
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Are these previews exactly how I will look after surgery?</h4>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">No. These images are strictly visual simulations to help you communicate your goals. Everyone heals differently, and human anatomy has limitations. Your actual surgeon will tell you exactly which preview is medically possible for you.</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 lg:p-8 border border-slate-100 dark:border-slate-800 transition-colors">
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">How long does it take to get my results?</h4>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">It takes less than 60 seconds! Once you upload your photo, our smart system processes your image and generates your subtle, moderate, and pronounced previews almost instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Variations Showcase */}
      <section id="technology" className="py-32 bg-[#FDFDFD] dark:bg-slate-950 border-y border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 lg:p-16 shadow-[0_20px_60px_rgba(0,0,0,0.03)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.2)] border border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row items-center gap-16 transition-colors">
            <div className="lg:w-1/2">
              <h2 className="text-indigo-600 dark:text-indigo-400 font-extrabold tracking-widest uppercase text-xs mb-4">Multiple Options</h2>
              <h3 className="text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight leading-[1.1]">We give you choices.</h3>
              <p className="text-lg text-slate-500 dark:text-slate-400 mb-10 leading-relaxed font-medium">
                Standard apps apply one aggressive filter. FaceVista gives you a range of realistic options so you can find exactly what feels right for you.
              </p>
              
              <div className="space-y-8">
                <div className="flex items-start group">
                  <div className="flex-shrink-0 w-12 h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 group-hover:border-indigo-300 dark:group-hover:border-indigo-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/50 rounded-2xl flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 font-black transition-all">1</div>
                  <div className="ml-5">
                    <h5 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Subtle Preview</h5>
                    <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm leading-relaxed">A very small, conservative change. Perfect if you just want a tiny refinement.</p>
                  </div>
                </div>
                <div className="flex items-start group">
                  <div className="flex-shrink-0 w-12 h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 group-hover:border-indigo-300 dark:group-hover:border-indigo-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/50 rounded-2xl flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 font-black transition-all">2</div>
                  <div className="ml-5">
                    <h5 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Moderate Preview</h5>
                    <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm leading-relaxed">A noticeable change that still looks completely natural and maintains your unique look.</p>
                  </div>
                </div>
                <div className="flex items-start group">
                  <div className="flex-shrink-0 w-12 h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 group-hover:border-indigo-300 dark:group-hover:border-indigo-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/50 rounded-2xl flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 font-black transition-all">3</div>
                  <div className="ml-5">
                    <h5 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Pronounced Preview</h5>
                    <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm leading-relaxed">A stronger, more dramatic change to see what the maximum safe limit looks like.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2 w-full">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-3 shadow-inner border border-slate-200 dark:border-slate-700 transition-colors">
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative group rounded-[1.5rem] overflow-hidden shadow-sm">
                    <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600" className="w-full h-72 object-cover" alt="Original" />
                    <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white px-4 py-2.5 rounded-xl text-xs font-bold backdrop-blur-md shadow-sm border border-white/50 dark:border-slate-700/50 text-center uppercase tracking-wider">Your Photo</div>
                  </div>
                  <div className="relative group rounded-[1.5rem] overflow-hidden shadow-sm">
                    <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600&sat=-10" className="w-full h-72 object-cover scale-[1.02]" alt="Subtle" />
                    <div className="absolute bottom-4 left-4 right-4 bg-indigo-600/90 dark:bg-indigo-500/90 text-white px-4 py-2.5 rounded-xl text-xs font-bold backdrop-blur-md shadow-sm border border-indigo-400/50 dark:border-indigo-400/30 text-center uppercase tracking-wider">Subtle</div>
                  </div>
                  <div className="relative group rounded-[1.5rem] overflow-hidden shadow-sm">
                    <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600&sat=-20" className="w-full h-72 object-cover scale-[1.04]" alt="Moderate" />
                    <div className="absolute bottom-4 left-4 right-4 bg-indigo-700/90 dark:bg-indigo-600/90 text-white px-4 py-2.5 rounded-xl text-xs font-bold backdrop-blur-md shadow-sm border border-indigo-500/50 dark:border-indigo-500/30 text-center uppercase tracking-wider">Moderate</div>
                  </div>
                  <div className="relative group rounded-[1.5rem] overflow-hidden shadow-sm">
                    <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600&sat=-30" className="w-full h-72 object-cover scale-[1.06]" alt="Pronounced" />
                    <div className="absolute bottom-4 left-4 right-4 bg-indigo-900/90 dark:bg-indigo-800/90 text-white px-4 py-2.5 rounded-xl text-xs font-bold backdrop-blur-md shadow-sm border border-indigo-700/50 dark:border-indigo-600/30 text-center uppercase tracking-wider">Pronounced</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#02060D] relative overflow-hidden pt-24 pb-8 border-t border-white/5">
        <div className="absolute bottom-0 left-0 w-full flex justify-center opacity-[0.03] pointer-events-none select-none overflow-hidden">
          <span className="text-[12rem] lg:text-[18rem] font-black text-white leading-none tracking-tighter">FACEVISTA</span>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 mb-20">
            <div className="lg:col-span-5">
              {/* Removed the FV icon box here */}
              <div className="flex items-center gap-3 mb-8">
                <span className="text-3xl font-extrabold text-white tracking-tighter">FaceVista</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed font-medium mb-8 max-w-sm">
                The world's most advanced facial preview platform. See your possibilities before you ever book an appointment.
              </p>
            </div>
            
            <div className="lg:col-span-2 lg:col-start-8">
              <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Menu</h4>
              <ul className="space-y-4 text-sm font-medium text-slate-400">
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a></li>
                <li><a href="#procedures" className="hover:text-white transition-colors">Procedures</a></li>
                <li><a href="#benefits" className="hover:text-white transition-colors">Benefits</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div className="lg:col-span-2">
              <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Legal</h4>
              <ul className="space-y-4 text-sm font-medium text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Medical Disclaimer</a></li>
              </ul>
            </div>
          </div>
          
          <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-2xl p-6 lg:p-8 text-center backdrop-blur-sm mb-8">
            <h5 className="text-indigo-400 font-bold uppercase tracking-widest text-xs mb-3">Important Medical Disclaimer</h5>
            <p className="text-slate-400 text-xs max-w-5xl mx-auto leading-relaxed">
              FaceVista generates visual illustrations using Generative AI for educational and communication purposes exclusively. 
              It is <strong className="text-slate-300">not</strong> a medical diagnostic device and does not guarantee surgical outcomes. Anatomy, healing, and surgical techniques vary vastly between individuals. 
              All medical decisions must be formally assessed and approved by a licensed, board-certified medical professional.
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center text-slate-600 text-xs font-bold tracking-wide border-t border-white/5 pt-8">
            <p>© 2026 FaceVista Clinical Systems. All rights reserved.</p>
          </div>
        </div>
      </footer>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-spin-slow {
          animation: spin 4s linear infinite;
        }
      `}} />
    </div>
  );
}
