// src/components/VideoPlayer.js
import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';

const VideoPlayerInterview = ({ src }) => {
  const videoRef = useRef();

  useEffect(() => {
    if (Hls.isSupported() && src) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(videoRef.current);
      return () => {
        hls.destroy();
      };
    } else if (videoRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = src;
    }
  }, [src]);

  return (
      <video
          ref={videoRef}
          controls
          style={{ width: '100%', height: '300px', background: '#000' }}
      />
  );
};

export default VideoPlayerInterview;
