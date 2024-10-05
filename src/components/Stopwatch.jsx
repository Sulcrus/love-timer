import React, { useEffect, useState } from "react";
import axios from 'axios';
import "./Stopwatch.css"; // Ensure you have the styles

const calculateTimeFromStart = (startTime) => {
  const now = new Date();
  const difference = now - startTime;

  let seconds = Math.floor((difference / 1000) % 60);
  let minutes = Math.floor((difference / 1000 / 60) % 60);
  let hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  let days = Math.floor(difference / (1000 * 60 * 60 * 24)) % 30;
  let months = Math.floor(difference / (1000 * 60 * 60 * 24 * 30)) % 12;
  let years = Math.floor(difference / (1000 * 60 * 60 * 24 * 365));

  return { years, months, days, hours, minutes, seconds };
};

const Stopwatch = () => {
  const [time, setTime] = useState({ years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [quote, setQuote] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [player, setPlayer] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [likes, setLikes] = useState(0);
  const [error, setError] = useState("");
  const [ip, setIp] = useState('');

  const getStartTime = () => {
    const storedTime = localStorage.getItem("stopwatchStartTime");
    if (storedTime) {
      return new Date(storedTime);
    } else {
      const now = new Date();
      localStorage.setItem("stopwatchStartTime", now);
      return now;
    }
  };

  const startTime = getStartTime();

  const quotes = [
    "Sometimes the heart needs more time to accept what the mind already knows.",
    "Every day is a new beginning; take a deep breath, smile, and start again.",
    "I may not be there with you, but I will always be waiting for you.",
    "Love knows not its own depth until the hour of separation.",
    "Time heals all wounds, but the heart remembers the moments.",
    "In the end, we only regret the chances we didn't take."
  ];

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(calculateTimeFromStart(startTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  useEffect(() => {
    const fetchIp = async () => {
      try {
        const response = await axios.get('https://api.ipify.org?format=json');
        setIp(response.data.ip);
        await axios.post('http://localhost:5000/track', { ip: response.data.ip });
      } catch (error) {
        console.error("Error fetching IP address", error);
      }
    };

    fetchIp();
  }, []);

  useEffect(() => {
    window.onYouTubeIframeAPIReady = () => {
      const newPlayer = new window.YT.Player('youtube-player', {
        height: '0',
        width: '0',
        videoId: 'PLn7Z0rgU7bpvw0Vx8_vP7jBjazDBsozN8',
        events: {
          onReady: () => {
            newPlayer.playVideo();
            setPlayer(newPlayer);
          },
        },
      });
    };

    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }, []);

  const toggleMute = () => {
    if (player) {
      if (isMuted) {
        player.unMute();
      } else {
        player.mute();
      }
      setIsMuted(!isMuted);
    }
  };

  const handleLike = () => {
    const hasLiked = localStorage.getItem('hasLiked');
    if (hasLiked) {
      setError("You can only like once!");
    } else {
      setLikes(likes + 1);
      localStorage.setItem('likeCount', likes + 1);
      localStorage.setItem('hasLiked', 'true');
      setError("");
    }
  };

  useEffect(() => {
    const storedLikes = localStorage.getItem('likeCount');
    if (storedLikes) {
      setLikes(parseInt(storedLikes, 10));
    }
  }, []);

  return (
    <div className="bg-cozy-background flex justify-center items-center min-h-screen relative overflow-hidden">
      <div className="text-center z-10 relative">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-pink-700 font-serif animate-text">
          Counting the Days of Heartache...
        </h1>
        <div className="text-5xl md:text-7xl font-bold text-red-600 space-x-4 ancient-font">
          <span>{time.years}Y</span>
          <span>{time.months}M</span>
          <span>{time.days}D</span>
          <span>{time.hours}H</span>
          <span>{time.minutes}M</span>
          <span>{time.seconds}S</span>
        </div>
        <p className="mt-4 text-2xl text-gray-800 italic font-light">
          "{quote}"
        </p>
        <button onClick={toggleMute} className="mt-4">
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
        <div className="like-container mt-4">
          <button onClick={handleLike} className="like-button">❤️ Like</button>
          <p className="like-count">{likes} Likes</p>
          {error && <p className="error-message text-red-500">{error}</p>}
        </div>
      </div>

      <div id="youtube-player" className="absolute bottom-0 left-0 w-full"></div>

      <footer className="absolute bottom-5 left-1/2 transform -translate-x-1/2 text-center text-gray-700">
        <p>Your IP is being monitored for security purposes.<br />{ip}</p>
        <p>&copy; 2024 sulcrus</p>
      </footer>
    </div>
  );
};

export default Stopwatch;
