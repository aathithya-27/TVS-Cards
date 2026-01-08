"use client"

import { useState, useEffect, useLayoutEffect, useRef } from "react"

export default function TVSCertificateGenerator() {
  const [formData, setFormData] = useState({
    name: "Prema.C",
    month: "December",
    year: "2025",
    photo: "/images/prema.jpg",
  })
  const [prevPhoto, setPrevPhoto] = useState(formData.photo)
  const fileInputRef = useRef(null)

  const [sparkles, setSparkles] = useState<any[]>([])
  const [isClient, setIsClient] = useState(false)
  const [confetti, setConfetti] = useState<any[]>([])
  const [fitMode, setFitMode] = useState<'cover' | 'contain'>('cover')
  const [profileBg, setProfileBg] = useState<string>("#fff")

  // Animation constants
  const MOVE_DURATION_MS = 12000; // 12 seconds for each movement (slowed down)
  const CENTER_PAUSE_MS = 10000; // 10 seconds for the pause at the center
  const FINAL_PAUSE_MS = 2000; // 2 seconds for the final pause before refresh

  // Calculate total duration for one cycle
  const oneCycleDuration = MOVE_DURATION_MS * 3 + CENTER_PAUSE_MS; // L-R, R-C, C-L + pause
  // Total duration for the entire animation (2 cycles + final pause)
  const totalAnimationDuration = (oneCycleDuration * 2) + FINAL_PAUSE_MS;

  useEffect(() => {
    setIsClient(true)
    // Sparkles
    const sparkArr = Array.from({ length: 80 }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDelay: Math.random() * 2,
    }))
    setSparkles(sparkArr)
    // Confetti
    const confettiArr = Array.from({ length: 35 }, () => ({
      left: Math.random() * 100,
      top: -10, // Start above the card
      size: 6 + Math.random() * 10,
      color: [
        '#FFD700', '#FF69B4', '#00CFFF', '#7CFC00', '#FF4500', '#FFFFFF',
      ][Math.floor(Math.random() * 6)],
      rotate: Math.random() * 360,
      animationDelay: Math.random() * 2,
      animationDuration: 2 + Math.random() * 2,
    }))
    setConfetti(confettiArr)

    // Set a timer to reload the page at the end of the full animation sequence
    const refreshTimer = setTimeout(() => {
      window.location.reload();
    }, totalAnimationDuration);

    // Cleanup the timer if the component unmounts
    return () => clearTimeout(refreshTimer);

  }, []) // Empty dependency array ensures this runs only once on mount

  // Responsive scaling logic
  const cardRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    function handleResize() {
      if (!cardRef.current) return;
      const card = cardRef.current;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // Use clientWidth and clientHeight for accurate dimensions without transforms
      const cardW = card.clientWidth;
      const cardH = card.clientHeight;
      const scaleW = vw / cardW;
      const scaleH = vh / cardH;
      setScale(Math.min(scaleW, scaleH)); // Removed 1 to allow full fit
    }
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  // Recalculate scale when content changes
  useEffect(() => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cardW = card.clientWidth;
    const cardH = card.clientHeight;
    const scaleW = vw / cardW;
    const scaleH = vh / cardH;
    setScale(Math.min(scaleW, scaleH)); // Removed 1 to allow full fit
  }, [formData, fitMode]);

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPrevPhoto(formData.photo)
      setFormData({ ...formData, photo: url })
    }
  }

  // Handle image error
  const handleImageError = () => {
    setFormData({ ...formData, photo: prevPhoto || "/placeholder.svg" })
  }

  // Helper to get dominant color from image
  const getDominantColor = (img: HTMLImageElement) => {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '#fff';
    ctx.drawImage(img, 0, 0);
    const edgePixels = [];
    const w = img.naturalWidth, h = img.naturalHeight;
    for (let i = 0; i < w; i += Math.max(1, Math.floor(w/20))) {
      edgePixels.push(ctx.getImageData(i, 0, 1, 1).data);
      edgePixels.push(ctx.getImageData(i, h-1, 1, 1).data);
    }
    for (let j = 0; j < h; j += Math.max(1, Math.floor(h/20))) {
      edgePixels.push(ctx.getImageData(0, j, 1, 1).data);
      edgePixels.push(ctx.getImageData(w-1, j, 1, 1).data);
    }
    const colorMap = {} as Record<string, number>;
    let max = 0, dominant = '#fff';
    for (const d of edgePixels) {
      const key = `rgb(${d[0]},${d[1]},${d[2]})`;
      colorMap[key] = (colorMap[key] || 0) + 1;
      if (colorMap[key] > max) {
        max = colorMap[key];
        dominant = key;
      }
    }
    return dominant;
  }

  // Dynamically set fit mode based on image aspect ratio
  const handleImageLoad = (e: any) => {
    const img = e.target;
    if (img.naturalWidth > img.naturalHeight) {
      setFitMode('cover');
      setProfileBg('transparent');
    } else {
      setFitMode('contain');
      setProfileBg(getDominantColor(img));
    }
  }

  // Prevent scrolling globally
  const noScrollStyle = `body { overflow: hidden !important; }`;
  const mobileStyle = `@media (max-width: 768px) {
    .responsive-card {
      min-width: 100% !important; max-width: 100% !important; width: 100% !important;
      transform: none !important; transform-origin: none !important;
      position: relative !important; display: flex !important; flex-direction: column !important;
      align-items: center !important; justify-content: center !important;
      background: none !important; overflow: hidden !important;
    }
  }`;

  // For profile picture position (for blast)
  const profileRef = useRef<HTMLDivElement>(null);
  const [profileCenter, setProfileCenter] = useState({ x: 0, y: 0 });
  useLayoutEffect(() => {
    if (profileRef.current) {
      const rect = profileRef.current.getBoundingClientRect();
      setProfileCenter({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }
  }, [scale, formData.photo]);

  // CSS Keyframes for the entire 2-cycle animation
  const animationKeyframes = `
    @keyframes full-two-cycle-animation {
      /* Cycle 1 Start */
      0% { transform: translateX(-35vw); } /* Start at left */
      ${(MOVE_DURATION_MS / totalAnimationDuration) * 100}% { transform: translateX(35vw); } /* Move to right */
      ${((MOVE_DURATION_MS * 2) / totalAnimationDuration) * 100}% { transform: translateX(0); } /* Move to center */
      /* 10s Pause at Center */
      ${((MOVE_DURATION_MS * 2 + CENTER_PAUSE_MS) / totalAnimationDuration) * 100}% { transform: translateX(0); }
      ${(oneCycleDuration / totalAnimationDuration) * 100}% { transform: translateX(-35vw); } /* Move to left */
      
      /* Cycle 2 Start */
      ${((oneCycleDuration + MOVE_DURATION_MS) / totalAnimationDuration) * 100}% { transform: translateX(35vw); } /* Move to right */
      ${((oneCycleDuration + MOVE_DURATION_MS * 2) / totalAnimationDuration) * 100}% { transform: translateX(0); } /* Move to center */
      /* 10s Pause at Center */
      ${((oneCycleDuration + MOVE_DURATION_MS * 2 + CENTER_PAUSE_MS) / totalAnimationDuration) * 100}% { transform: translateX(0); }
      ${((oneCycleDuration * 2) / totalAnimationDuration) * 100}% { transform: translateX(-35vw); } /* Move to left */

      /* Final 2s Pause at Left */
      100% { transform: translateX(-35vw); }
    }

    .animate-card-flow {
      animation: full-two-cycle-animation ${totalAnimationDuration}ms ease-in-out forwards;
    }
  `;

  return (
    <>
      <style>{noScrollStyle}</style>
      <style>{mobileStyle}</style>
      <style>{animationKeyframes}</style>

      <div style={{ minHeight: '100vh', background: 'black', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflow: 'hidden' }}>
        <div
          ref={cardRef}
          className="responsive-card animate-card-flow"
          style={{
            minWidth: 480,
            maxWidth: 740,
            width: '100%',
            transformOrigin: 'center top',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            overflow: 'hidden',
          }}
        >
          <div
            className="w-full"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'center top' // Changed to top for better alignment
            }}
          >
            <div
              className="relative w-full rounded-lg shadow-2xl flex flex-col items-center overflow-hidden"
              style={{
                backgroundImage: `url('/background.png')`,
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
              }}
            >
              {/* All animated overlays clipped to card */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Confetti Effect */}
                {isClient && (
                  <div className="absolute inset-0 pointer-events-none">
                    {confetti.map((c, i) => (
                      <div
                        key={`confetti-${i}`}
                        className="absolute"
                        style={{
                          left: `${c.left}%`,
                          top: `-10%`,
                          width: `${c.size}px`,
                          height: `${c.size * 0.4}px`,
                          backgroundColor: c.color,
                          borderRadius: '2px',
                          transform: `rotate(${c.rotate}deg)`,
                          opacity: 0.85,
                          animation: `fall-confetti-fix ${c.animationDuration + 1.5}s linear infinite`,
                          animationDelay: `${c.animationDelay}s`,
                          zIndex: 1,
                        }}
                      />
                    ))}
                    <style>{`
                      @keyframes fall-confetti-fix {
                        0% { opacity: 1; }
                        100% { opacity: 0.7; top: 110%; }
                      }
                    `}</style>
                  </div>
                )}

                {/* Animated Sparkle Effects */}
                <div className="absolute inset-0">
                  {[...Array(40)].map((_, i) => (
                    <div
                      key={`sparkle-${i}`}
                      className="absolute animate-[sparkle_2s_ease-in-out_infinite]"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 2}s`,
                      }}
                    >
                      <div className="w-3 h-3 bg-yellow-300 transform rotate-45 animate-spin"></div>
                    </div>
                  ))}
                </div>

                {/* Pulsing Golden Rings */}
                <div className="absolute top-1/4 left-1/4 w-32 h-32 border-2 border-yellow-400/30 rounded-full animate-[pulse-ring_4s_ease-in-out_infinite]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-24 h-24 border-2 border-yellow-400/40 rounded-full animate-[pulse-ring_3s_ease-in-out_infinite_reverse]"></div>
                <div className="absolute top-1/2 right-1/3 w-16 h-16 border-2 border-yellow-400/20 rounded-full animate-[pulse-ring_5s_ease-in-out_infinite]"></div>
                <div className="absolute bottom-1/3 left-1/2 w-20 h-20 border-2 border-yellow-400/25 rounded-full animate-[pulse-ring_6s_ease-in-out_infinite]"></div>

                {/* Animated Golden Waves */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full">
                    <svg className="w-full h-full" viewBox="0 0 1000 1000">
                      <path d="M0,500 Q250,400 500,500 T1000,500" stroke="rgba(255, 215, 0, 0.15)" strokeWidth="3" fill="none" className="animate-[wave_8s_ease-in-out_infinite]" />
                      <path d="M0,520 Q250,420 500,520 T1000,520" stroke="rgba(255, 215, 0, 0.12)" strokeWidth="2" fill="none" className="animate-[wave_6s_ease-in-out_infinite_reverse]" />
                      <path d="M0,480 Q250,380 500,480 T1000,480" stroke="rgba(255, 215, 0, 0.08)" strokeWidth="1.5" fill="none" className="animate-[wave_10s_ease-in-out_infinite]" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="relative z-10 flex flex-col items-center text-center px-8 py-8 gap-4 w-full">
                {/* TVS Logo */}
                <div className="flex items-center justify-center animate-[fade-in-down_1s_ease-out] min-h-0 h-[120px]">
                  <img
                    src="/tvs_white.png"
                    alt="TVS Logo"
                    width={900}
                    height={400}
                    className="object-contain h-[200px] w-auto max-w-full drop-shadow-lg"
                  />
                </div>

                {/* Channel partner Helpdesk */}
                <div className="mb-8 animate-[fade-in-up_1s_ease-out_0.5s_both]">
                  <h1 className="text-yellow-400 text-7xl leading-tight amperzand-font">Channel Partner</h1>
                  <h2 className="text-yellow-400 text-7xl leading-tight amperzand-font">HelpDesk</h2>
                </div>

                {/* Congratulations */}
                <div className="mb-10 animate-[fade-in-up_1s_ease-out_1s_both]">
                  <h3 className="text-white text-5xl animate-[glow-text_2s_ease-in-out_infinite] amperzand-font">
                    Congratulations <span className="text-5xl animate-medal-bounce inline-block align-middle">🏅</span>
                  </h3>
                </div>

                {/* Employee Photo with Golden Ribbon Banner */}
                <div className="relative mb-10 flex flex-col items-center animate-[scale-in_1s_ease-out_1.5s_both]">
                  <div ref={profileRef} className="w-72 h-72 rounded-full overflow-hidden border-4 border-yellow-400 shadow-2xl relative z-10" style={{ background: profileBg }}>
                    <img
                      src={formData.photo || "/placeholder.svg"}
                      alt={formData.name}
                      width={224}
                      height={224}
                      className={`w-full h-full object-${fitMode} animate-[subtle-zoom_6s_ease-in-out_infinite]`}
                      onError={handleImageError}
                      onLoad={handleImageLoad}
                    />
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                    />
                    <button
                      className="absolute bottom-2 right-2 bg-yellow-400 text-black px-3 py-1 rounded shadow hover:bg-yellow-300 text-sm"
                      onClick={() => fileInputRef.current && (fileInputRef.current as HTMLInputElement).click()}
                    >
                      Change Photo
                    </button>
                  </div>
                  <div className="relative -mt-16 w-[420px] h-[100px] animate-[ribbon-glow_8s_ease-in-out_infinite] z-20 flex items-center justify-center">
                    <img
                      src="/ribbon.png"
                      alt="Golden Ribbon"
                      width={420}
                      height={100}
                      className="w-full h-full object-contain absolute inset-0"
                    />
                    <div className="absolute inset-0 flex items-center justify-center px-4">
                      <div className="text-center">
                        <h4 className="text-black text-3xl font-extrabold amperzand-decorative">{formData.name}</h4>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Best Performer Text */}
                <div className="text-center animate-[fade-in-up_1s_ease-out_2s_both] -mt-8 mb-20">
                  <h3 className="text-white text-5xl mb-2 amperzand-font">Best</h3>
                  <h3 className="text-white text-4xl mb-2 amperzand-font">Performer of the month</h3>
                  <h3 className="text-white text-5xl amperzand-font">{formData.month} {formData.year}</h3>
                </div>
              </div>
            </div>
            {/* MACS Logo and Tagline */}
            <div className="absolute bottom-0 right-0 mb-4 mr-4 flex flex-row items-end justify-end gap-2 z-30">
              <img
                src="/images/macs_logo.png"
                alt="MACS Logo"
                width={50}
                height={50}
                className="object-contain w-30 h-30 -mt-16 align-bottom"
              />
              <span className="text-white text-3xl" style={{ fontFamily: 'Trebuchet MS, Arial, sans-serif' }}>A</span>
              <span className="text-white text-3xl" style={{ fontFamily: 'Trebuchet MS, Arial, sans-serif' }}>MACS'ian Product</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}