import { useEffect, useState } from 'react';
import { getActiveVideos } from '../../services/homepageService';

// Normalise stored values ('INLINE SECTION' / 'inline_section' -> 'inline_section')
const norm = (s) => String(s || '').trim().toLowerCase().replace(/\s+/g, '_');

// Convert YouTube watch / shorts / youtu.be URL to embed URL
function getYouTubeEmbed(rawUrl, { autoPlay, loop, controls }) {
  try {
    const u = new URL(rawUrl);
    let id = '';
    if (u.hostname.includes('youtu.be')) {
      id = u.pathname.slice(1);
    } else if (u.pathname.startsWith('/shorts/')) {
      id = u.pathname.split('/shorts/')[1]?.split('/')[0];
    } else if (u.pathname.startsWith('/embed/')) {
      id = u.pathname.split('/embed/')[1]?.split('/')[0];
    } else {
      id = u.searchParams.get('v') || '';
    }
    if (!id) return null;
    const params = new URLSearchParams({
      autoplay: autoPlay ? '1' : '0',
      mute: autoPlay ? '1' : '0',
      loop: loop ? '1' : '0',
      controls: controls ? '1' : '0',
      playsinline: '1',
      rel: '0',
    });
    if (loop) params.set('playlist', id);
    return `https://www.youtube.com/embed/${id}?${params.toString()}`;
  } catch {
    return null;
  }
}

/**
 * Renders ACTIVE videos assigned to the Home page.
 * Fetched once on mount (no realtime). Renders nothing if there are none,
 * so Home looks unchanged when no video is assigned.
 *
 * NOTE: Men / Women / Shop / About / Collections / Product pages are not wired
 * yet. To add them later, render a similar component on those pages calling
 * getActiveVideos('men' | 'women' | 'shop' | 'about' | 'collections' | 'product_pages').
 */
export default function HomeVideos() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    let cancelled = false;
    // getActiveVideos filters status = 'ACTIVE' (drafts never show) and pages contains 'home'
    getActiveVideos('home').then(({ videos: data }) => {
      if (cancelled) return;
      setVideos((data || []).filter(v => v.url || v.video_url || v.youtube_url || v.vimeo_url));
    });
    return () => { cancelled = true; };
  }, []);

  if (!videos.length) return null;

  return videos.map(v => <HomeVideo key={v.id} video={v} />);
}

function HomeVideo({ video }) {
  const style = norm(video.display_style) || 'inline_section';
  const playback = (video.playback || []).map(norm);
  const isBackground = style === 'background_loop';
  const autoPlay = isBackground || video.autoplay || playback.includes('autoplay_muted');
  const loop = isBackground || video.loop || playback.includes('loop');
  const controls = !isBackground && (video.play_on_click || playback.includes('play_on_click') || !autoPlay);
  const fileUrl = video.url || video.video_url;
  const poster = video.thumbnail || video.thumbnail_url || undefined;
  const headline = video.overlay_headline || video.headline;
  const subtext = video.overlay_subtext || video.subtext;

  const ytEmbed = video.source === 'YOUTUBE' && video.youtube_url
    ? getYouTubeEmbed(video.youtube_url, { autoPlay, loop, controls })
    : null;

  const player = ytEmbed ? (
    <iframe
      src={ytEmbed}
      title={video.title || 'Video'}
      allow="autoplay; encrypted-media; picture-in-picture"
      allowFullScreen
      className="absolute inset-0 w-full h-full border-0"
    />
  ) : (
    <video
      ref={el => { if (el) el.muted = autoPlay; }} // ensure muted for mobile autoplay
      src={fileUrl}
      poster={poster}
      autoPlay={autoPlay}
      muted={autoPlay}
      loop={loop}
      controls={controls}
      playsInline
      preload="metadata"
      className="absolute inset-0 w-full h-full object-cover"
    />
  );

  const overlay = (headline || subtext) && (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 bg-black/30 pointer-events-none">
      {headline && (
        <h2 className="font-unica text-4xl md:text-6xl uppercase tracking-tighter text-white">{headline}</h2>
      )}
      {subtext && (
        <p className="font-plex text-sm md:text-base text-white/80 mt-3 max-w-xl">{subtext}</p>
      )}
    </div>
  );

  if (style === 'hero_fullscreen' || isBackground) {
    return (
      <section className={`relative w-full overflow-hidden bg-black ${isBackground ? 'h-[70vh]' : 'h-screen'}`}>
        {player}
        {overlay}
      </section>
    );
  }

  // inline_section
  return (
    <section className="w-full px-4 md:px-8 py-12 md:py-16">
      <div className="relative w-full max-w-6xl mx-auto aspect-video overflow-hidden bg-black">
        {player}
        {overlay}
      </div>
    </section>
  );
}
