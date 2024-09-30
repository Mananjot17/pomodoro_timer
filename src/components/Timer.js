import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import PlayButton from './PlayButton';
import PauseButton from './PauseButton';
import SettingsButton from './SettingsButton';
import { useContext, useState, useEffect, useRef } from 'react';
import SettingsContext from '../context/SettingsContext';

const red = '#f54e4e';
const green = '#4aec8c';

function Timer() {
  const settingsInfo = useContext(SettingsContext);

  const [isPaused, setIsPaused] = useState(true);
  const [mode, setMode] = useState('work'); 
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [sessionCount, setSessionCount] = useState(() => {
    return 0; 
  });
  const [history, setHistory] = useState(() => {
    return JSON.parse(localStorage.getItem('history')) || [];
  });

  const secondsLeftRef = useRef(secondsLeft);
  const isPausedRef = useRef(isPaused);
  const modeRef = useRef(mode);

  function tick() {
    secondsLeftRef.current--;
    setSecondsLeft(secondsLeftRef.current);
  }

  useEffect(() => {
    
    localStorage.setItem('sessionCount', 0);

    function switchMode() {
      const nextMode = modeRef.current === 'work' ? 'break' : 'work';
      const nextSeconds = (nextMode === 'work' ? settingsInfo.workMinutes : settingsInfo.breakMinutes) * 60;

     
      if (modeRef.current === 'work') {
        setSessionCount((prev) => {
          const newCount = prev + 1;
          localStorage.setItem('sessionCount', newCount);
          return newCount;
        });

        const newHistory = [...history, { mode: 'work', date: new Date() }];
        setHistory(newHistory);
        localStorage.setItem('history', JSON.stringify(newHistory));
      }

      setMode(nextMode);
      modeRef.current = nextMode;

      setSecondsLeft(nextSeconds);
      secondsLeftRef.current = nextSeconds;
    }

    secondsLeftRef.current = settingsInfo.workMinutes * 60;
    setSecondsLeft(secondsLeftRef.current);

    const interval = setInterval(() => {
      if (isPausedRef.current) {
        return;
      }
      if (secondsLeftRef.current === 0) {
        return switchMode();
      }

      tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [settingsInfo, history]);

  const totalSeconds = mode === 'work'
    ? settingsInfo.workMinutes * 60
    : settingsInfo.breakMinutes * 60;
  const percentage = Math.round(secondsLeft / totalSeconds * 100);

  const minutes = Math.floor(secondsLeft / 60);
  let seconds = secondsLeft % 60;
  if (seconds < 10) seconds = '0' + seconds;

  return (
    <div>
      <CircularProgressbar
        value={percentage}
        text={minutes + ':' + seconds}
        styles={buildStyles({
          textColor: '#fff',
          pathColor: mode === 'work' ? red : green,
          tailColor: 'rgba(255,255,255,.2)',
        })}
      />
      <div style={{ marginTop: '20px' }}>
        {isPaused
          ? <PlayButton onClick={() => { setIsPaused(false); isPausedRef.current = false; }} />
          : <PauseButton onClick={() => { setIsPaused(true); isPausedRef.current = true; }} />}
      </div>
      <div style={{ marginTop: '20px' }}>
        <SettingsButton onClick={() => settingsInfo.setShowSettings(true)} />
      </div>
      <div style={{ marginTop: '20px' }}>
        <p>Completed Sessions: {sessionCount}</p>
      </div>
    </div>
  );
}

export default Timer;
