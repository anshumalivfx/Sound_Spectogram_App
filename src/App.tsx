// import { useState } from "preact/hooks";
// import preactLogo from "./assets/preact.svg";
// import { invoke } from "@tauri-apps/api/tauri";
// import "./App.css";

// function App() {
//   const [greetMsg, setGreetMsg] = useState("");
//   const [name, setName] = useState("");

//   async function greet() {
//     // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
//     setGreetMsg(await invoke("greet", { name }));
//   }

//   return <div class="container"></div>;
// }

// export default App;

import { useState, useEffect, useRef } from "preact/hooks";
import { invoke } from "@tauri-apps/api/tauri";
import FFT from "fft.js";
import "./App.css";

function App() {
  const canvasRef = useRef(null);
  const [audioContext, setAudioContext] = useState<null | AudioContext>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [dataArray, setDataArray] = useState<Uint8Array | null>(null);
  const [bufferLength, setBufferLength] = useState<number | null>(null);

  useEffect(() => {
    async function initAudio() {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const context = new window.AudioContext();
      const analyser = context.createAnalyser();
      analyser.fftSize = 2048;

      const source = context.createMediaStreamSource(stream);
      source.connect(analyser);

      setAudioContext(context);
      setAnalyser(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      setBufferLength(bufferLength);
      setDataArray(dataArray);
    }

    initAudio();
  }, []);

  useEffect(() => {
    if (!analyser || !dataArray || !canvasRef.current) return;

    const canvas = canvasRef.current as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");

    function draw() {
      if (!analyser || !ctx || bufferLength === null) return; // Add null check for analyser, ctx, and bufferLength

      if (dataArray !== null) {
        analyser.getByteFrequencyData(dataArray);
      }

      ctx.fillStyle = "rgb(0, 0, 0)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        if (dataArray && dataArray[i] !== undefined) {
          barHeight = dataArray[i];
        } else {
          return; // or handle the case when barHeight is undefined
        }

        const hue = (i / bufferLength) * 360;
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);

        x += barWidth + 1;
      }

      requestAnimationFrame(draw);
    }

    draw();
  }, [analyser, dataArray, bufferLength]);

  return (
    <div class="container">
      <canvas ref={canvasRef} width="800" height="400"></canvas>
    </div>
  );
}

export default App;
