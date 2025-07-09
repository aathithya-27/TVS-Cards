"use client"

import { useState, useEffect, useLayoutEffect, useRef } from "react"
import Image from "next/image"

export default function TVSCertificateGenerator() {
  const [formData, setFormData] = useState({
    name: "Aathithya",
    position: "Technical Head",
    month: "June",
    year: "2025",
    photo: "/images/IMG_3128.jpg",
  })
  const [prevPhoto, setPrevPhoto] = useState(formData.photo)
  const fileInputRef = useRef(null)

  const [sparkles, setSparkles] = useState<any[]>([])
  const [isClient, setIsClient] = useState(false)
  const [confetti, setConfetti] = useState<any[]>([])
  const [fitMode, setFitMode] = useState<'cover' | 'contain'>('cover')
  const [profileBg, setProfileBg] = useState<string>("#fff")
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
        '#FFD700', // gold
        '#FF69B4', // pink
        '#00CFFF', // blue
        '#7CFC00', // green
        '#FF4500', // orange
        '#FFFFFF', // white
      ][Math.floor(Math.random() * 6)],
      rotate: Math.random() * 360,
      animationDelay: Math.random() * 2,
      animationDuration: 2 + Math.random() * 2,
    }))
    setConfetti(confettiArr)
  }, [])

  // Responsive scaling logic (auto-size to content)
  const cardRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    function handleResize() {
      if (!cardRef.current) return;
      const card = cardRef.current;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const cardW = card.offsetWidth;
      const cardH = card.offsetHeight;
      const scaleW = vw / cardW;
      const scaleH = vh / cardH;
      setScale(Math.min(scaleW, scaleH, 1));
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
    const cardW = card.offsetWidth;
    const cardH = card.offsetHeight;
    const scaleW = vw / cardW;
    const scaleH = vh / cardH;
    setScale(Math.min(scaleW, scaleH, 1));
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

  // Handle image error (e.g., deleted image)
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
    // Sample left, right, top, bottom edge pixels
    const edgePixels = [];
    const w = img.naturalWidth, h = img.naturalHeight;
    for (let i = 0; i < w; i += Math.max(1, Math.floor(w/20))) {
      edgePixels.push(ctx.getImageData(i, 0, 1, 1).data); // top
      edgePixels.push(ctx.getImageData(i, h-1, 1, 1).data); // bottom
    }
    for (let j = 0; j < h; j += Math.max(1, Math.floor(h/20))) {
      edgePixels.push(ctx.getImageData(0, j, 1, 1).data); // left
      edgePixels.push(ctx.getImageData(w-1, j, 1, 1).data); // right
    }
    // Find the most common color
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
      setFitMode('cover'); // wide image, zoom in
      setProfileBg('transparent');
    } else {
      setFitMode('contain'); // tall or square, show full
      setProfileBg(getDominantColor(img));
    }
  }

  // Prevent scrolling globally
  const noScrollStyle = `body { overflow: hidden !important; }`;
  const mobileStyle = `@media (max-width: 768px) {
    .responsive-card {
      min-width: 100% !important;
      max-width: 100% !important;
      width: 100% !important;
      transform: none !important;
      transformOrigin: none !important;
      position: relative !important;
      display: flex !important;
      flexDirection: column !important;
      alignItems: center !important;
      justifyContent: center !important;
      background: none !important;
      overflow: hidden !important;
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

  return (
    <>
      <style>{noScrollStyle}</style>
      <style>{mobileStyle}</style>
      <div style={{ minHeight: '100vh', background: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div
          ref={cardRef}
          className="responsive-card"
          style={{
            minWidth: 480,
            maxWidth: 740,
            width: '100%',
            transform: `scale(${scale})`,
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
                    <path
                      d="M0,500 Q250,400 500,500 T1000,500"
                      stroke="rgba(255, 215, 0, 0.15)"
                      strokeWidth="3"
                      fill="none"
                      className="animate-[wave_8s_ease-in-out_infinite]"
                    />
                    <path
                      d="M0,520 Q250,420 500,520 T1000,520"
                      stroke="rgba(255, 215, 0, 0.12)"
                      strokeWidth="2"
                      fill="none"
                      className="animate-[wave_6s_ease-in-out_infinite_reverse]"
                    />
                    <path
                      d="M0,480 Q250,380 500,480 T1000,480"
                      stroke="rgba(255, 215, 0, 0.08)"
                      strokeWidth="1.5"
                      fill="none"
                      className="animate-[wave_10s_ease-in-out_infinite]"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center text-center px-8 py-8 gap-4 w-full">
              {/* TVS Logo: Only the tvs_white.png image, large and centered */}
              <div className="flex items-center justify-center animate-[fade-in-down_1s_ease-out] min-h-0 h-[120px]">
                <Image
                  src="/tvs_white.png"
                  alt="TVS Logo"
                  width={900}
                  height={400}
                  className="object-contain h-[200px] w-auto max-w-full drop-shadow-lg"
                  priority
                />
              </div>

              {/* Channel partner Helpdesk - Large Bold Serif with Golden-Yellow */}
              <div className="mb-8 animate-[fade-in-up_1s_ease-out_0.5s_both]">
                <h1 className="text-yellow-400 text-7xl leading-tight amperzand-font">
                  Channel Partner
                </h1>
                <h2 className="text-yellow-400 text-7xl leading-tight amperzand-font">
                  HelpDesk
                </h2>
              </div>

              {/* Congratulations with Medal Emoji */}
              <div className="mb-10 animate-[fade-in-up_1s_ease-out_1s_both]">
                <h3 className="text-white text-5xl animate-[glow-text_2s_ease-in-out_infinite] amperzand-font">
                  Congratulations{" "}
                  <span className="text-5xl animate-medal-bounce inline-block align-middle">🏅</span>
                </h3>
              </div>

              {/* Employee Photo with Golden Ribbon Banner */}
              <div className="relative mb-10 flex flex-col items-center animate-[scale-in_1s_ease-out_1.5s_both]">
                {/* Circular Profile Photo */}
                <div ref={profileRef} className="w-72 h-72 rounded-full overflow-hidden border-4 border-yellow-400 shadow-2xl relative z-10" style={{background: profileBg}}>
                  <Image
                    src={formData.photo || "/placeholder.svg"}
                    alt={formData.name}
                    width={224}
                    height={224}
                    className={`w-full h-full object-${fitMode} animate-[subtle-zoom_6s_ease-in-out_infinite]`}
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                  />
                  {/* File input for uploading new profile image */}
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

                {/* Golden Ribbon Banner with Name & Title - Optimized for Amperzand Font */}
                <div className="relative -mt-16 w-[420px] h-[100px] animate-[ribbon-glow_8s_ease-in-out_infinite] z-20 flex items-center justify-center">
                  <Image
                    src="/ribbon.png"
                    alt="Golden Ribbon"
                    width={420}
                    height={100}
                    className="w-full h-full object-contain absolute inset-0"
                  />
                  <div className="absolute inset-x-0 top-2 flex flex-col items-center justify-start px-4">
                    <div className="text-center flex flex-col justify-start h-full">
                      <h4 className="text-black text-3xl font-extrabold amperzand-decorative mb-0">
                        {formData.name}
                      </h4>
                      <p className="text-black text-2xl font-bold amperzand-decorative mt-0">
                        {formData.position}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Best Performer Text - Large White Serif */}
              <div className="text-center animate-[fade-in-up_1s_ease-out_2s_both] -mt-8 mb-20">
                <h3 className="text-white text-5xl mb-2 amperzand-font">
                  Best
                </h3>
                <h3 className="text-white text-4xl mb-2 amperzand-font">
                  Performer of the month
                </h3>
                <h3 className="text-white text-5xl amperzand-font">
                  {formData.month} {formData.year}
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
/* Add confetti animation to global styles if not present */
// In your globals.css or in a <style jsx global> block:
// @keyframes confetti-fall {
//   0% { transform: translateY(-20px) rotate(var(--rotate, 0deg)); opacity: 1; }
//   100% { transform: translateY(400px) rotate(var(--rotate, 0deg)); opacity: 0.7; }
// }

