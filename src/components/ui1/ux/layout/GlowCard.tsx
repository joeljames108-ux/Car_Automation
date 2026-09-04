import React, { useRef, useState, useCallback } from "react";
export interface GlowCardProps {
  children: React.ReactNode; className?: string; glowColor?: string;
  hoverScale?: boolean; magneticHover?: boolean; tilt3D?: boolean;
  glass?: boolean; onClick?: () => void; style?: React.CSSProperties;
}
export const GlowCard: React.FC<GlowCardProps> = ({
  children, className = "", glowColor = "rgba(196,168,96,0.35)",
  hoverScale = true, magneticHover = false, tilt3D = false,
  glass = true, onClick, style,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [mp, setMp] = useState({x:0.5,y:0.5});
  const [hov, setHov] = useState(false);
  const [mag, setMag] = useState({x:0,y:0});
  const [tilt, setTilt] = useState({x:0,y:0});
  const onMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width, y=(e.clientY-r.top)/r.height;
    setMp({x,y});
    if (magneticHover) setMag({x:(e.clientX-r.left-r.width/2)*0.08,y:(e.clientY-r.top-r.height/2)*0.08});
    if (tilt3D) setTilt({x:(y-0.5)*-12,y:(x-0.5)*12});
  }, [magneticHover, tilt3D]);
  const onLeave = useCallback(() => { setHov(false); setMag({x:0,y:0}); setTilt({x:0,y:0}); }, []);
  const ts: React.CSSProperties = {
    position: "relative", overflow: "hidden",
    transition: "transform 0.35s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s cubic-bezier(0.16,1,0.3,1)",
    willChange: "transform, box-shadow", cursor: onClick ? "pointer" : "default",
    transform: (magneticHover ? "translate3d("+mag.x+"px,"+mag.y+"px,0)" : "") + (tilt3D ? " perspective(800px) rotateX("+tilt.x+"deg) rotateY("+tilt.y+"deg)" : ""),
    ...style,
  };
  const gs: React.CSSProperties = glass ? {
    background: "rgba(26,16,8,0.65)", backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px",
  } : {};
  return (
    <div ref={ref} className={className} style={{...ts,...gs}}
      onMouseMove={onMove} onMouseEnter={()=>setHov(true)} onMouseLeave={onLeave} onClick={onClick}>
      <div style={{position:"absolute",left:mp.x*100+"%",top:mp.y*100+"%",width:200,height:200,marginLeft:-100,marginTop:-100,borderRadius:"50%",
        background:"radial-gradient(circle,"+glowColor+",transparent 70%)",opacity:hov?0.6:0,transition:"opacity 0.3s",pointerEvents:"none",willChange:"opacity"}} />
      <div style={{position:"absolute",top:0,left:hov?"150%":"-100%",width:"50%",height:"100%",
        background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)",transform:"skewX(-25deg)",
        transition:"left 0.6s cubic-bezier(0.16,1,0.3,1)",pointerEvents:"none"}} />
      <div style={{position:"relative",zIndex:2}}>{children}</div>
    </div>
  );
};