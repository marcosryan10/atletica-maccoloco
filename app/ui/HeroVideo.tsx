'use client';
import { useEffect,useRef,useState } from 'react';
import { Pause,Play } from 'lucide-react';
export default function HeroVideo(){
 const ref=useRef<HTMLVideoElement>(null);const [paused,setPaused]=useState(false);const [failed,setFailed]=useState(false);
 useEffect(()=>{
  const video=ref.current;if(!video)return;let inView=true;let manualPause=false;
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');manualPause=motion.matches;setPaused(manualPause);
  const reset=()=>{try{video.currentTime=0;}catch{}};
  const restart=()=>{reset();video.muted=true;if(!document.hidden&&inView&&!manualPause)video.play().then(()=>setPaused(false)).catch(()=>setPaused(true));};
  const visibility=()=>{if(document.hidden){video.pause();reset();}else restart();};
  const leave=()=>{video.pause();reset();};
  const observer=new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;if(inView)restart();else leave();},{threshold:.12});observer.observe(video);
  const togglePause=(event:Event)=>{manualPause=(event as CustomEvent<boolean>).detail;};video.addEventListener('macco-pause',togglePause);
  document.addEventListener('visibilitychange',visibility);window.addEventListener('pagehide',leave);window.addEventListener('pageshow',restart);restart();
  return()=>{observer.disconnect();document.removeEventListener('visibilitychange',visibility);window.removeEventListener('pagehide',leave);window.removeEventListener('pageshow',restart);video.removeEventListener('macco-pause',togglePause);};
 },[]);
 function toggle(){const video=ref.current;if(!video)return;const pause=!video.paused;video.dispatchEvent(new CustomEvent('macco-pause',{detail:pause}));if(pause){video.pause();setPaused(true);}else{video.play().then(()=>setPaused(false)).catch(()=>setPaused(true));}}
 return <div className="hero-video-frame"><video ref={ref} src="/media/maccoloco-abertura.mp4" autoPlay muted loop playsInline preload="metadata" aria-label="Vídeo de apresentação da Atlética MaccoLoco, sem áudio" onError={()=>setFailed(true)}/>{failed?<p className="video-error">Não foi possível reproduzir o vídeo.</p>:<button className="video-control" type="button" onClick={toggle} aria-label={paused?'Reproduzir vídeo':'Pausar vídeo'}>{paused?<Play size={18}/>:<Pause size={18}/>}</button>}</div>;
}
