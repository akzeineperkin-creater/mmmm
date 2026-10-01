import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw, Sparkles } from 'lucide-react';

interface Bird {
  id: string;
  name: string;
  scientificName: string;
  description: string;
  image: string;
  audio: string;
  category: string;
}

const BIRDS_DATA: Bird[] = [
  {
    id: 'chaffinch',
    name: 'Зяблик',
    scientificName: 'Fringilla coelebs',
    description: 'Небольшая певчая птица с ярким оперением. Песня зяблика представляет собой звонкую раскатистую трель с характерным «росчерком» на конце.',
    image: '/images/chaffinch.jpg',
    audio: '/audio/chaffinch.mp3',
    category: 'Певчие'
  },
  {
    id: 'golden-eagle',
    name: 'Беркут',
    scientificName: 'Aquila chrysaetos',
    description: 'Один из самых крупных и сильных дневных хищников. Издает громкий клекот и звонкие свистящие позывки во время парения над просторами.',
    image: '/images/golden-eagle.jpg',
    audio: '/audio/eagle.mp3',
    category: 'Хищные'
  },
  {
    id: 'eagle',
    name: 'Орел',
    scientificName: 'Haliaeetus leucocephalus',
    description: 'Величественная хищная птица с мощным изогнутым клювом и острым зрением. Голос — серия резких, высоких криков и металлических трелей.',
    image: '/images/eagle.jpg',
    audio: '/audio/eagle.mp3',
    category: 'Хищные'
  },
  {
    id: 'pheasant-male',
    name: 'Фазан',
    scientificName: 'Phasianus colchicus',
    description: 'Самец обыкновенного фазана отличается эффектным блестящим оперением и длинным хвостом. Издает резкий гортанный двухсложный брачный крик.',
    image: '/images/pheasant-male.jpg',
    audio: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Phasianus_colchicus_-_Common_Pheasant_XC717758.mp3',
    category: 'Курообразные'
  },
  {
    id: 'golden-pheasant',
    name: 'Золотой фазан',
    scientificName: 'Chrysolophus pictus',
    description: 'Невероятно красивая птица с золотисто-желтым хохлом и ярко-красным брюшком. Издает свистящие звуки и резкие металлические сигналы тревоги.',
    image: '/images/golden-pheasant.jpg',
    audio: '/audio/golden-pheasant.mp3',
    category: 'Экзотические'
  },
  {
    id: 'pheasant-female',
    name: 'Самка фазана',
    scientificName: 'Phasianus colchicus (female)',
    description: 'Обладает покровительственной песочно-бурой окраской с темными крапинами для маскировки в траве. Издает негромкие осторожные сигналы связи.',
    image: '/images/pheasant-female.jpg',
    audio: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Phasianus_colchicus_-_Common_Pheasant_XC717758.mp3',
    category: 'Курообразные'
  },
  {
    id: 'greenfinch',
    name: 'Зеленушка',
    scientificName: 'Chloris chloris',
    description: 'Плотная птица с оливково-зеленым оперением. Песня состоит из звонких журчащих трелей, чередующихся с характерным хриплым «вжжжж».',
    image: '/images/greenfinch.jpg',
    audio: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Chloris_chloris_song.mp3',
    category: 'Певчие'
  },
  {
    id: 'magpie',
    name: 'Сорока',
    scientificName: 'Pica pica',
    description: 'Высокоинтеллектуальная птица с контрастным черно-белым оперением с сине-зеленым отливом. Характерный голос — быстрое стрекотание.',
    image: '/images/magpie.jpg',
    audio: '/audio/magpie.mp3',
    category: 'Врановые'
  }
];

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&w=800&q=80';

export default function BirdCatalog() {
  const [activeBirdId, setActiveBirdId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const formatTime = (timeInSeconds: number): string => {
    if (isNaN(timeInSeconds) || timeInSeconds === 0) return '0:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const togglePlay = (bird: Bird) => {
    if (!audioRef.current) return;

    if (activeBirdId === bird.id) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
      }
    } else {
      setActiveBirdId(bird.id);
      audioRef.current.src = bird.audio;
      audioRef.current.load();
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.warn('Playback error:', err);
          setIsPlaying(false);
        });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleImageError = (id: string) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased py-10 px-4 sm:px-6 lg:px-8">
      <audio ref={audioRef} muted={isMuted} preload="metadata" />

      <div className="max-w-7xl mx-auto space-y-10">
        <header className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Интерактивный справочник
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            Голоса птиц
          </h1>
          <p className="text-slate-600 text-base sm:text-lg">
            Послушайте аутентичные голоса и трели птиц в живой природе.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BIRDS_DATA.map((bird) => {
            const isActive = activeBirdId === bird.id;
            const isThisPlaying = isActive && isPlaying;

            return (
              <div
                key={bird.id}
                className={`group flex flex-col bg-white rounded-2xl border transition-all duration-300 overflow-hidden shadow-sm hover:shadow-xl ${
                  isActive
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-emerald-100'
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                  <img
                    src={failedImages[bird.id] ? FALLBACK_IMAGE : bird.image}
                    alt={bird.name}
                    onError={() => handleImageError(bird.id)}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1 rounded-full">
                    {bird.category}
                  </div>

                  {isThisPlaying && (
                    <div className="absolute bottom-3 right-3 flex items-end gap-1 bg-black/70 backdrop-blur-md px-2.5 py-1.5 rounded-lg">
                      <span className="w-1 h-3 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-1 h-5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-1 h-2 bg-emerald-400 rounded-full animate-bounce"></span>
                      <span className="w-1 h-4 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.25s]"></span>
                    </div>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {bird.name}
                    </h3>
                    <p className="text-xs font-mono text-slate-400 italic mt-0.5">
                      {bird.scientificName}
                    </p>
                    <p className="text-sm text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                      {bird.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => togglePlay(bird)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 ${
                          isThisPlaying
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200 hover:bg-emerald-700'
                            : isActive
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                        title={isThisPlaying ? 'Пауза' : 'Слушать голос'}
                      >
                        {isThisPlaying ? (
                          <>
                            <Pause className="w-4 h-4 fill-current" />
                            <span>Пауза</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                            <span>Слушать</span>
                          </>
                        )}
                      </button>

                      <span className="text-xs font-mono text-slate-400 font-medium">
                        {isActive ? `${formatTime(currentTime)} / ${formatTime(duration)}` : '0:00'}
                      </span>
                    </div>

                    <div className="relative flex items-center">
                      <input
                        type="range"
                        min={0}
                        max={isActive ? duration || 100 : 100}
                        value={isActive ? currentTime : 0}
                        disabled={!isActive}
                        onChange={handleSeek}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 disabled:cursor-not-allowed disabled:opacity-40"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <footer className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-sm gap-4">
          <p>© Каталог голосов птиц. Все аудиозаписи и изображения интегрированы локально.</p>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
              <span>{isMuted ? 'Включить звук' : 'Без звука'}</span>
            </button>

            {activeBirdId && (
              <button
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current.currentTime = 0;
                  }
                  setIsPlaying(false);
                  setActiveBirdId(null);
                  setCurrentTime(0);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
                title="Остановить все"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Сбросить</span>
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
