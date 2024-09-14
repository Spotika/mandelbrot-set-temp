export const vertexShaderSource = `
attribute vec2 a_position;
void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
}
`

export const fragmentShaderSource = `
precision highp float;

#define AA 2

uniform vec2 u_resolution;
uniform vec2 u_offset;
uniform float u_zoom;

float mandelbrot( in vec2 c ) {
    float c2 = dot(c, c);
    if(256.0*c2*c2 - 96.0*c2 + 32.0*c.x - 3.0 < 0.0) return 0.0;
    if(16.0*(c2+2.0*c.x+1.0) - 1.0 < 0.0) return 0.0;


    const float B = 256.;
    float l = 0.0;
    vec2 z  = vec2(0.0);
    for(int i = 0; i < 512; ++i) {
        z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
        if (dot(z, z) > B * B) break;
        l += 1.0;
    }

    if(l > 511.0) return 0.0;
    float sl = l - log2(log2(dot(z, z))) + 4.0;

    float al = smoothstep(-0.2, 0.0, u_zoom);
    l = mix(l, sl, al);

    return l;
}

void main() {
    vec3 col = vec3(0.0);

    for(int m = 0; m < AA; m++)
        for(int n = 0; n < AA; n++) {
            vec2 p = (-u_resolution.xy + 2.0 * (gl_FragCoord.xy + vec2(float(m), float(n)) / float(AA))) / u_resolution.y;
            float w = float(AA*m+n);
            float time = u_zoom;

            float zoo = 1. / time;
            vec2 xy = vec2(p.x, p.y);
            vec2 c = xy * zoo;

            float l = mandelbrot(c + u_offset);
            if (l == 0.0) {
                col += 0.5 + 0.5*cos( 3. + l*0.15 + vec3(0.1,0.6,1.0));
            } else {
                col += 0.5 + 0.5*cos( 3. + l*0.15 + vec3(0.1,0.6,1.0));
            }
        }
        col /= float(AA * AA);
    gl_FragColor = vec4(col, 1.0);
}
`;
