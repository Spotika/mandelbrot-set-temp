import { useEffect, useRef, useState } from "react";
import styles from "./MandelbrotPage.module.scss";
import { vertexShaderSource, fragmentShaderSource } from "./shaders";

export const MandelbrotPage = () => {
  const canvas = useRef<HTMLCanvasElement>(null);

  const [offsetX, setOffsetX] = useState(-0.4);
  const [offsetY, setOffsetY] = useState(0);
  const [zoom, setZoom] = useState(0.6);

  const gl_items = useRef({} as any as {
    vertex: WebGLShader,
    fragment: WebGLShader,
    program: WebGLProgram | null,
    attributeLocations: {
      vertexPosition: GLint
    },
    uniformLocations: {
      resolution: WebGLUniformLocation | null
      zoom: WebGLUniformLocation | null
      offset: WebGLUniformLocation | null
    }
  });
  const shiftDown = useRef(false);


  useEffect(() => {
    if (!canvas.current) return;
    const gl = canvas.current.getContext("webgl");
    if (!gl) return;

    const vertexShader = gl.createShader(gl.VERTEX_SHADER) as any;
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(vertexShader));
      return;
    }

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER) as any;
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(fragmentShader));
      return;
    }

    const program = gl.createProgram() as any;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }

    const vertexPosition = gl.getAttribLocation(program, "a_position");
    const resolution = gl.getUniformLocation(program, "u_resolution");
    const zoomLocation = gl.getUniformLocation(program, "u_zoom");
    const offset = gl.getUniformLocation(program, "u_offset");

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    const vertices = new Float32Array([
      -1, -1,
      1, -1,
      -1, 1,
      1, 1,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.vertexAttribPointer(vertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexPosition);

    gl.useProgram(program);

    gl.uniform2f(resolution, canvas.current.width, canvas.current.height);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // Сохранение объектов WebGL
    gl_items.current = {
      vertex: vertexShader,
      fragment: fragmentShader,
      program,
      attributeLocations: {
        vertexPosition
      },
      uniformLocations: {
        resolution,
        zoom: zoomLocation,
        offset
      }
    };
  }, []);
  const handleScroll = (event: WheelEvent) => {
    event.preventDefault();

    const { deltaX, deltaY } = event;
    const delta = deltaY > 0 ? 1.005: 0.996;

    if (!shiftDown.current) {
      const newZoom = Math.min(38000, zoom * delta);
      setZoom(newZoom);
      const canvasRect = canvas.current!.getBoundingClientRect();
      const mouseX = event.clientX - canvasRect.left;
      const mouseY = event.clientY - canvasRect.top;
      const canvasWidth = canvasRect.width;
      const canvasHeight = canvasRect.height;

      const newOffsetX = offsetX + (mouseX / canvasWidth - 0.5) * (deltaY * 0.001 / zoom);
      const newOffsetY = offsetY - (mouseY / canvasHeight - 0.5) * (deltaY * 0.001 / zoom);
      setOffsetX(newOffsetX);
      setOffsetY(newOffsetY);

    } else {
      setOffsetX(offsetX + deltaX * 0.001 * zoom);
      setOffsetY(offsetY - deltaY * 0.001 * zoom);
    }
  };

  useEffect(() => {
    if (!canvas.current) return;

    canvas.current.addEventListener("wheel", handleScroll, { passive: false });
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Shift") {
        shiftDown.current = true;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "Shift") {
        shiftDown.current = false;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      canvas.current?.removeEventListener("wheel", handleScroll);
    };

  }, [canvas, offsetX, offsetY, zoom]);

  useEffect(() => {
    if (!canvas.current) return;
    const gl = canvas.current.getContext("webgl");
    if (!gl) return;

    const program = gl_items.current.program;
    gl.useProgram(program);

    gl.uniform2f(gl_items.current.uniformLocations.resolution, 1200, 900);
    gl.uniform2f(gl_items.current.uniformLocations.offset, offsetX, offsetY);
    gl.uniform1f(gl_items.current.uniformLocations.zoom, zoom);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }, [offsetX, offsetY, zoom]);

  return <div className={styles.container}>
    <h1 className={styles.title}>Mandelbrot set</h1>
    <canvas ref={canvas} width="1200" height="900" className={styles.canvas}></canvas>
  </div>
}