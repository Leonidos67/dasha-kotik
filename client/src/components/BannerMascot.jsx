import { useEffect, useRef } from 'react';
import bannerVideo from '../banner2.webm';
import './BannerMascot.css';

export default function BannerMascot({ variant = 'fixed', src = bannerVideo, className = '' }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.loop = true;
    video.playsInline = true;

    const play = () => {
      video.play().catch(() => {});
    };

    play();
    video.addEventListener('loadeddata', play);
    return () => video.removeEventListener('loadeddata', play);
  }, [src]);

  return (
    <div
      className={['banner-mascot', `banner-mascot--${variant}`, className].filter(Boolean).join(' ')}
      aria-hidden
    >
      <video
        ref={videoRef}
        src={src}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
      />
    </div>
  );
}
