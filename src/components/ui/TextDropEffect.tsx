'use client';

import '@/app/interaction.css';
import { useEffect } from 'react';

function randomText() {
  var text = '!@#$%^&*()_+';
  let letters = text[Math.floor(Math.random() * text.length)];
  return letters;
}

export default function TextDropEffect() {
  useEffect(() => {
    console.log('1');
    function rain() {
      let cloud = document.querySelector('.effect_cloud');
      let e = document.createElement('div');

      e.classList.add('effect_drop');
      if (!cloud) return;
      cloud.appendChild(e);

      let left = Math.floor(Math.random() * 290);
      let size = Math.random() * 1.5;
      let duration = Math.random() * 1;

      e.innerText = randomText();
      e.style.left = left + 'px';
      e.style.fontSize = 0.5 + size + 'em';
      e.style.animationDuration = 1 + duration + 's';

      setTimeout(function () {
        if (!cloud) return;
        cloud.removeChild(e);
      }, 2000);
      console.log('1');
    }

    const dropInterval = setInterval(function () {
      rain();
    }, 50);

    return () => clearInterval(dropInterval);
  }, []);

  return (
    <div className="wrap">
      <div className="effect_container">
        <div className="effect_cloud">
          <h2>Data Clouds Rain</h2>
        </div>
      </div>
    </div>
  );
}
