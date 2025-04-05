import React, { useState, useEffect } from 'react';

const CountdownTimer = () => {
  const targetDate = new Date('May 12, 2025 00:00:00').getTime(); // Target date

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Update the timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      // If the countdown reaches zero, clear the interval
      if (distance <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        // Calculate remaining time
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000); // Update every second

    return () => clearInterval(interval); // Clean up on unmount
  }, [targetDate]);

  return (
    <div>
      <div className="countdown-timer">
        <span>{timeLeft.days}d </span>
        <span>{timeLeft.hours}h </span>
        <span>{timeLeft.minutes}m </span>
        <span>{timeLeft.seconds}s</span>
      </div>
    </div>
  );
};

export default CountdownTimer;
