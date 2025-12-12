'use client';

import * as React from 'react';

type WebGLContext = WebGLRenderingContext | WebGL2RenderingContext;

type UniformLocationMap = {
  time: WebGLUniformLocation;
  resolution: WebGLUniformLocation;
  mouse: WebGLUniformLocation;
  scroll: WebGLUniformLocation;
  intensity: WebGLUniformLocation;
};

function compileShader(gl: WebGLContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error('Failed to create shader');
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS) === true;
  if (!compiled) {
    const info = gl.getShaderInfoLog(shader) ?? 'Unknown shader error';
    gl.deleteShader(shader);
    throw new Error(info);
  }

  return shader;
}

function createProgram(gl: WebGLContext, vertexSource: string, fragmentSource: string) {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

  const program = gl.createProgram();
  if (!program) {
    throw new Error('Failed to create program');
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  const linked = gl.getProgramParameter(program, gl.LINK_STATUS) === true;
  if (!linked) {
    const info = gl.getProgramInfoLog(program) ?? 'Unknown program error';
    gl.deleteProgram(program);
    throw new Error(info);
  }

  return program;
}

const VERT = `
  attribute vec2 a_position;
  varying vec2 v_uv;

  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAG = `
  precision highp float;

  varying vec2 v_uv;

  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec2 u_mouse;
  uniform float u_scroll;
  uniform float u_intensity;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 78.233);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(0.80, -0.60, 0.60, 0.80);
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = rot * p * 2.0 + vec2(10.0);
      a *= 0.55;
    }
    return v;
  }

  vec3 palette(float t) {
    vec3 a = vec3(0.05, 0.02, 0.08);
    vec3 b = vec3(0.50, 0.25, 0.80);
    vec3 c = vec3(0.90, 0.35, 0.55);
    vec3 d = vec3(0.20, 0.75, 0.95);
    return a + b * cos(6.28318 * (c * t + d));
  }

  void main() {
    vec2 uv = v_uv;

    vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;

    float t = u_time * 0.07;
    float scrollT = u_scroll;

    vec2 m = u_mouse / u_resolution;
    vec2 mouseWarp = (m - 0.5) * vec2(1.2, 0.9);

    float swirl = fbm(p * 2.2 + vec2(t, -t) + mouseWarp * 0.75);
    float swirl2 = fbm(p * 4.0 - vec2(t * 1.3, t * 0.9) - mouseWarp * 1.1);

    float energy = pow(swirl, 2.2) * 0.8 + pow(swirl2, 3.0) * 0.35;
    energy += 0.25 * sin((p.x + p.y) * 6.0 + t * 4.0);

    float vignette = 1.0 - smoothstep(0.15, 1.2, length(p));

    float rings = sin(10.0 * length(p) - t * 6.0 + scrollT * 6.28318);
    rings = smoothstep(0.15, 0.95, rings);

    float pulse = 0.55 + 0.45 * sin(t * 3.0 + scrollT * 4.0);

    vec3 colA = palette(energy + scrollT * 0.45);
    vec3 colB = palette(energy + 0.35 + scrollT * 0.65);

    float mixT = smoothstep(0.0, 1.0, 0.5 + 0.5 * sin(t + energy * 2.0 + scrollT * 3.0));
    vec3 base = mix(colA, colB, mixT);

    // Neon bloom-ish response
    float glow = pow(max(energy, 0.0), 3.0);
    vec3 neon = base * (1.35 + glow * 2.0);
    neon += vec3(0.0, 0.6, 1.0) * glow * 0.65;

    // Subtle chromatic shift
    neon.r += 0.12 * fbm(p * 6.0 + t);
    neon.g += 0.09 * fbm(p * 6.0 - t);
    neon.b += 0.15 * fbm(p * 6.0 + vec2(-t, t));

    neon *= vignette;
    neon += rings * vec3(0.1, 0.65, 1.0) * 0.35;
    neon *= (0.85 + 0.15 * pulse);

    // Filmic-ish curve
    neon = neon / (1.0 + neon);

    vec3 bg = vec3(0.0);
    vec3 color = mix(bg, neon, u_intensity);

    // A tiny scanline shimmer that responds to scroll
    float scan = 0.985 + 0.015 * sin((uv.y * u_resolution.y) * 0.9 + u_time * 6.0 + u_scroll * 24.0);
    color *= scan;

    gl_FragColor = vec4(color, 1.0);
  }
`;

export function WebGLNeonBackdrop({ className }: { className?: string }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const rafRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const gl: WebGL2RenderingContext | WebGLRenderingContext | null =
      canvas.getContext('webgl2', { antialias: false, alpha: true }) ??
      canvas.getContext('webgl', { antialias: false, alpha: true });

    if (!gl) {
      return;
    }

    let program: WebGLProgram;
    try {
      program = createProgram(gl, VERT, FRAG);
    } catch {
      return;
    }

    const positionLocation = gl.getAttribLocation(program, 'a_position');

    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const mouseLocation = gl.getUniformLocation(program, 'u_mouse');
    const scrollLocation = gl.getUniformLocation(program, 'u_scroll');
    const intensityLocation = gl.getUniformLocation(program, 'u_intensity');

    if (!timeLocation || !resolutionLocation || !mouseLocation || !scrollLocation || !intensityLocation) {
      gl.deleteProgram(program);
      return;
    }

    const uniforms: UniformLocationMap = {
      time: timeLocation,
      resolution: resolutionLocation,
      mouse: mouseLocation,
      scroll: scrollLocation,
      intensity: intensityLocation,
    };

    const positionBuffer = gl.createBuffer();
    if (!positionBuffer) {
      gl.deleteProgram(program);
      return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1,
        1, -1,
        -1, 1,
        -1, 1,
        1, -1,
        1, 1,
      ]),
      gl.STATIC_DRAW,
    );

    gl.useProgram(program);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    let width = 0;
    let height = 0;

    const mouse = { x: 0, y: 0 };
    const setMouseFromEvent = (event: PointerEvent) => {
      mouse.x = event.clientX;
      mouse.y = window.innerHeight - event.clientY;
    };

    const setMouseFromTouch = (event: TouchEvent) => {
      const t = event.touches[0];
      if (!t) return;
      mouse.x = t.clientX;
      mouse.y = window.innerHeight - t.clientY;
    };

    const getScrollProgress = () => {
      const doc = document.documentElement;
      const max = Math.max(1, doc.scrollHeight - window.innerHeight);
      return Math.min(1, Math.max(0, window.scrollY / max));
    };

    let scroll = getScrollProgress();

    const handleResize = () => {
      const dpr = Math.min(2, window.devicePixelRatio ?? 1);
      const nextWidth = Math.floor(window.innerWidth * dpr);
      const nextHeight = Math.floor(window.innerHeight * dpr);

      if (nextWidth === width && nextHeight === height) return;

      width = nextWidth;
      height = nextHeight;
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      gl.viewport(0, 0, width, height);
    };

    const handleScroll = () => {
      scroll = getScrollProgress();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('pointermove', setMouseFromEvent, { passive: true });
    window.addEventListener('touchmove', setMouseFromTouch, { passive: true });

    handleResize();

    const start = performance.now();
    const startIntensity = 0;

    const render = (now: number) => {
      const elapsed = (now - start) / 1000;

      const intensity = prefersReducedMotion
        ? 0.45
        : Math.min(1, startIntensity + (1 - Math.exp(-elapsed * 1.4)));

      gl.uniform1f(uniforms.time, elapsed);
      gl.uniform2f(uniforms.resolution, width, height);
      gl.uniform2f(uniforms.mouse, mouse.x, mouse.y);
      gl.uniform1f(uniforms.scroll, scroll);
      gl.uniform1f(uniforms.intensity, intensity);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('pointermove', setMouseFromEvent);
      window.removeEventListener('touchmove', setMouseFromTouch);
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
    />
  );
}
