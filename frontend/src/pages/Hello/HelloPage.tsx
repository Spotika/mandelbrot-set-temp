import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./HelloPage.module.scss"
import { useTheme } from "../../hooks/useTheme";
import { compileShader, fragmentShaderSource, vertexShaderSource } from "./shaders";

export const HelloPage = () => {
  const [depth, setDepth] = useState(0);
  const { toggleTheme } = useTheme();

  const canvas = useRef<HTMLCanvasElement>(null);

  const generateKochCurve = useCallback((iterations: number) => {
    let points = [[-0.9, -0.6], [0.9, -0.6]]; // Начальные точки
    const angle = Math.PI / 3;

    for (let i = 0; i < iterations; i++) {
      let newPoints = [];
      for (let j = 0; j < points.length - 1; j++) {
        const p1 = points[j];
        const p2 = points[j + 1];

        const s = [(2 * p1[0] + p2[0]) / 3, (2 * p1[1] + p2[1]) / 3];
        const t = [(p1[0] + 2 * p2[0]) / 3, (p1[1] + 2 * p2[1]) / 3];

        const dx = t[0] - s[0];
        const dy = t[1] - s[1];
        const peak = [
          s[0] + dx * Math.cos(angle) - dy * Math.sin(angle),
          s[1] + dx * Math.sin(angle) + dy * Math.cos(angle),
        ];

        newPoints.push(p1);
        newPoints.push(s);
        newPoints.push(peak);
        newPoints.push(t);
      }
      newPoints.push(points[points.length - 1]);
      points = newPoints;
    }
    return points;
  }, []);

  let gl_items = useRef(null as any as {
    vertex: WebGLShader,
    fragment: WebGLShader,
    program: WebGLProgram
  });

  useEffect(() => {
    if (!canvas.current) return;
    const gl = canvas.current.getContext('webgl');
    if (!gl) return;
    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);


    const program = gl.createProgram();
    if (!program) throw new DOMException("Failed to create program");
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(`Error linking program ${gl.getProgramInfoLog(program)}`);
    }

    gl_items.current = {
      vertex: vertexShader,
      fragment: fragmentShader,
      program: program
    };
  });

  useEffect(() => {
    if (!canvas.current) return;
    if (!gl_items.current) return;
    const gl = canvas.current?.getContext('webgl');
    if (!gl) return;

    const points = generateKochCurve(depth).flat();

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);

    const a_position = gl.getAttribLocation(gl_items.current.program, 'a_position');
    gl.enableVertexAttribArray(a_position);
    gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.LINE_STRIP, 0, points.length / 2);
  }, [gl_items, depth]);

  return <div className={styles.container}>
    <h1>Koh curve</h1>
    <button
      className={styles.changeTheme}
      onClick={toggleTheme}
    >
      Change theme
    </button>
    <div className={styles.currentDepth}>
      Current depth: {depth}
    </div>
    <div className={styles.canvasContainer}>
      <canvas width="1500" height="750" ref={canvas}></canvas>
    </div>
    <div className={styles.controlsContainer}>
      <button onClick={() => {
        if (depth > 0) {
          setDepth(depth - 1);
        }
      }}>
        Prev
      </button>
      <div className={styles.depthVariants}>
        {Array.from({ length: 12 }, (_, i) => i).map(i => (
          <button key={i} className={depth == i ? styles.buttonActive : ""} onClick={() => setDepth(i)}>
            {i}
          </button>
        ))}
      </div>
      <button onClick={() => {
        setDepth(depth + 1);
      }}>
        Next
      </button>
    </div>
  </div>
}
