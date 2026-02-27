// app/page.tsx
"use client"; // Required for Three.js, GSAP, and window events in Next.js

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function Home() {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorOutlineRef = useRef<HTMLDivElement>(null);
  const spotlightGroupRef = useRef<HTMLElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // Register GSAP Plugin
    gsap.registerPlugin(ScrollTrigger);

    // --- 1. Cursor & Spotlight Logic (Desktop Only) ---
    if (window.matchMedia("(min-width: 900px)").matches) {
      const handleMouseMove = (e: MouseEvent) => {
        const posX = e.clientX;
        const posY = e.clientY;

        if (cursorDotRef.current) {
          cursorDotRef.current.style.left = `${posX}px`;
          cursorDotRef.current.style.top = `${posY}px`;
        }

        if (cursorOutlineRef.current) {
          cursorOutlineRef.current.animate(
            { left: `${posX}px`, top: `${posY}px` },
            { duration: 500, fill: "forwards" }
          );
        }

        document.body.style.setProperty('--mouse-x', `${posX}px`);
        document.body.style.setProperty('--mouse-y', `${posY}px`);

        if (spotlightGroupRef.current) {
          document.querySelectorAll('.card').forEach((card) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            (card as HTMLElement).style.setProperty('--mouse-x', `${x}px`);
            (card as HTMLElement).style.setProperty('--mouse-y', `${y}px`);
          });
        }
      };

      window.addEventListener('mousemove', handleMouseMove);

      // Hover states
      const handleMouseEnter = () => document.body.classList.add('hovered');
      const handleMouseLeave = () => document.body.classList.remove('hovered');

      document.querySelectorAll('.hover-target, a, .card, .tech-chip').forEach(el => {
        el.addEventListener('mouseenter', handleMouseEnter);
        el.addEventListener('mouseleave', handleMouseLeave);
      });
    }

    // --- 2. THREE.JS Background ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (canvasContainerRef.current) {
      canvasContainerRef.current.appendChild(renderer.domElement);
    }

    const count = 1500;
    const positions = new Float32Array(count * 3);
    const originalY = new Float32Array(count); 

    for(let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 20; 
      positions[i3 + 1] = (Math.random() - 0.5) * 10; 
      positions[i3 + 2] = (Math.random() - 0.5) * 10; 
      originalY[i] = positions[i3 + 1];
    }

    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({ 
      size: 0.03, color: 0x00f3ff, transparent: true, opacity: 0.6, sizeAttenuation: true 
    });

    const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particleSystem);
    camera.position.z = 5;

    let time = 0;
    let animationFrameId: number;

    const animate = () => {
      time += 0.005;
      const positions = particleSystem.geometry.attributes.position.array as Float32Array;
      
      for(let i = 0; i < count; i++) {
        const i3 = i * 3;
        const x = positions[i3];
        positions[i3 + 1] = originalY[i] + Math.sin(time + x * 0.5) * 0.5;
      }
      
      particleSystem.geometry.attributes.position.needsUpdate = true;
      particleSystem.rotation.y = time * 0.1;
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // --- 3. GSAP Animations ---
    gsap.from(".gsap-hero", { y: 100, opacity: 0, duration: 1.2, stagger: 0.15, ease: "power4.out", delay: 0.2 });
    gsap.utils.toArray('.scroll-reveal').forEach((elem: any) => {
      gsap.from(elem, { scrollTrigger: { trigger: elem, start: "top 85%" }, y: 60, opacity: 0, duration: 1, ease: "power3.out" });
    });

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (canvasContainerRef.current) {
        canvasContainerRef.current.innerHTML = '';
      }
      renderer.dispose();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <div ref={cursorDotRef} className="cursor-dot"></div>
      <div ref={cursorOutlineRef} className="cursor-outline"></div>
      <div className="cursor-light"></div>
      <div className="noise"></div>
      
      <div id="canvas-container" ref={canvasContainerRef}></div>

      <div className="container">
        {/* Navbar */}
        <nav>
          <div className="logo hover-target">PRIYANSHU.</div>
          
          <div className="mobile-menu-btn hover-target" onClick={toggleMenu}>
            <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </div>

          <div className={`nav-items ${isMenuOpen ? 'active' : ''}`}>
            <a className="nav-link hover-target" href="#work" onClick={closeMenu}>Work</a>
            <a className="nav-link hover-target" href="#about" onClick={closeMenu}>About</a>
            <a className="nav-link hover-target" href="#contact" onClick={closeMenu}>Contact</a>
          </div>
        </nav>

        {/* Hero */}
        <header className="hero">
          <div className="hero-eyebrow gsap-hero">Software Developer</div>
          <h1 className="hero-title gsap-hero">Architecting <br/> Digital Reality.</h1>
          <p className="hero-desc gsap-hero">
            I build scalable, high-performance web systems. 
            Currently engineering Next.js &amp; AWS solutions at Globizhub India.
          </p>
          <div className="btn-group gsap-hero">
            <a className="btn btn-primary hover-target" href="https://github.com/priyanshu496" target="_blank" rel="noreferrer">View GitHub</a>
            <a className="btn btn-ghost hover-target" href="https://www.linkedin.com/in/priyanshubora/" target="_blank" rel="noreferrer">LinkedIn</a>
          </div>
        </header>

        {/* Skills */}
        <div className="skills-section scroll-reveal">
          <h2>Technology Arsenal</h2>
          <div className="marquee-container">
            <div className="marquee-track scroll-left">
              <div className="tech-chip hover-target"><i className="fab fa-react"></i> React.js</div>
              <div className="tech-chip hover-target"><i className="fas fa-bolt"></i> Next.js 14</div>
              <div className="tech-chip hover-target"><i className="fab fa-js"></i> TypeScript</div>
              <div className="tech-chip hover-target"><i className="fab fa-node"></i> Node.js</div>
              <div className="tech-chip hover-target"><i className="fas fa-wind"></i> Tailwind CSS</div>
              <div className="tech-chip hover-target"><i className="fas fa-atom"></i> Electron</div>
              <div className="tech-chip hover-target"><i className="fab fa-react"></i> React.js</div>
              <div className="tech-chip hover-target"><i className="fas fa-bolt"></i> Next.js 14</div>
              <div className="tech-chip hover-target"><i className="fab fa-js"></i> TypeScript</div>
              <div className="tech-chip hover-target"><i className="fab fa-node"></i> Node.js</div>
              <div className="tech-chip hover-target"><i className="fas fa-wind"></i> Tailwind CSS</div>
              <div className="tech-chip hover-target"><i className="fas fa-atom"></i> Electron</div>
            </div>
            <div className="marquee-track scroll-right">
              <div className="tech-chip hover-target"><i className="fab fa-aws"></i> AWS Amplify</div>
              <div className="tech-chip hover-target"><i className="fas fa-database"></i> PostgreSQL</div>
              <div className="tech-chip hover-target"><i className="fas fa-leaf"></i> MongoDB</div>
              <div className="tech-chip hover-target"><i className="fab fa-docker"></i> Docker</div>
              <div className="tech-chip hover-target"><i className="fas fa-shield-alt"></i> AWS Cognito</div>
              <div className="tech-chip hover-target"><i className="fas fa-network-wired"></i> Socket.io</div>
              <div className="tech-chip hover-target"><i className="fab fa-aws"></i> AWS Amplify</div>
              <div className="tech-chip hover-target"><i className="fas fa-database"></i> PostgreSQL</div>
              <div className="tech-chip hover-target"><i className="fas fa-leaf"></i> MongoDB</div>
              <div className="tech-chip hover-target"><i className="fab fa-docker"></i> Docker</div>
              <div className="tech-chip hover-target"><i className="fas fa-shield-alt"></i> AWS Cognito</div>
              <div className="tech-chip hover-target"><i className="fas fa-network-wired"></i> Socket.io</div>
            </div>
          </div>
        </div>

        {/* Projects */}
        <section className="section spotlight-group" id="work" ref={spotlightGroupRef}>
          <div className="section-header">Selected Works</div>
          <div className="bento-grid">
            <div className="card col-8 scroll-reveal">
              <div className="card-label">Featured • SaaS Platform</div>
              <div className="card-title">Laboratory Management System</div>
              <div className="card-text">
                Lead Architect for a multi-tenant SaaS. Engineered a hybrid middleware using Electron to connect physical medical analyzers to the cloud. Features complex RBAC and dynamic test engines.
              </div>
              <div className="tags">
                <span className="tag">Next.js 14</span><span className="tag">Electron</span><span className="tag">Prisma</span><span className="tag">AWS</span>
              </div>
            </div>
            <div className="card col-4 scroll-reveal">
              <div className="card-label">Artificial Intelligence</div>
              <div className="card-title">Rezalyzer AI</div>
              <div className="card-text">Serverless AI Resume analyzer powered by Google Gemini. Provides instant scoring and feedback.</div>
              <div className="tags"><span className="tag">Gemini AI</span><span className="tag">React</span><span className="tag">Puter.js</span></div>
            </div>
            <div className="card col-6 scroll-reveal">
              <div className="card-label">Enterprise</div>
              <div className="card-title">EGRents Platform</div>
              <div className="card-text">Property rental system with AWS Cognito Auth and dual-role architecture. Optimized onboarding flow by 30%.</div>
              <div className="tags"><span className="tag">AWS Amplify</span><span className="tag">PostgreSQL</span><span className="tag">Next.js</span></div>
            </div>
            <div className="card col-6 scroll-reveal">
              <div className="card-label">Real-time Comms</div>
              <div className="card-title">Aura Chat</div>
              <div className="card-text">Instant messaging app with context-aware AI responses using Gemini and Socket.io.</div>
              <div className="tags"><span className="tag">Socket.io</span><span className="tag">MongoDB</span><span className="tag">Node.js</span></div>
            </div>
          </div>
        </section>

        {/* Experience */}
        <section className="section" id="about">
          <div className="section-header">Experience</div>
          <div className="spotlight-group">
            <div className="card col-12 scroll-reveal">
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: '10px' }}>
                <h3 style={{ fontSize: '1.5rem', color: '#fff' }}>Software Engineer I</h3>
                <span style={{ color: 'var(--primary)' }}>Oct 2025 - Present</span>
              </div>
              <div style={{ color: '#888', marginBottom: '20px' }}>Globizhub India Pvt Ltd</div>
              <p style={{ color: '#aaa', lineHeight: 1.6 }}>
                Spearheading the development of scalable SaaS solutions. Leading a team of 3 developers, implementing Agile workflows, and architecting secure cloud infrastructure for medical data.
              </p>
            </div>
            <div className="card col-12 scroll-reveal" style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: '10px' }}>
                <h3 style={{ fontSize: '1.5rem', color: '#fff' }}>Team Lead (MediMover)</h3>
                <span style={{ color: 'var(--primary)' }}>Jan 2023 - Jan 2024</span>
              </div>
              <div style={{ color: '#888', marginBottom: '20px' }}>Academic Research</div>
              <p style={{ color: '#aaa', lineHeight: 1.6 }}>
                Led the creation of an IoT healthcare robot. Integrated ThingSpeak for real-time sensor data and reduced deployment latency by 40%.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer id="contact">
          <div className="footer-grid">
            <div>
              <div className="footer-big">Let&apos;s build<br/>the future.</div>
              <div className="social-list">
                <a className="social-icon hover-target" href="mailto:contactpriyanshubora@gmail.com"><i className="fas fa-envelope"></i></a>
                <a className="social-icon hover-target" href="https://www.linkedin.com/in/priyanshubora/" target="_blank" rel="noreferrer"><i className="fab fa-linkedin"></i></a>
                <a className="social-icon hover-target" href="https://github.com/priyanshu496" target="_blank" rel="noreferrer"><i className="fab fa-github"></i></a>
                <a className="social-icon hover-target" href="tel:+918822395825"><i className="fas fa-phone"></i></a>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', textAlign: 'right' }}>
              <p style={{ color: '#666' }}>Designed &amp; Developed by Priyanshu Bora</p>
              <p style={{ color: '#444', fontSize: '0.8rem', marginTop: '10px' }}>Guwahati, Assam, India</p>
              <p style={{ color: '#444', fontSize: '0.8rem' }}>&copy; 2026</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}