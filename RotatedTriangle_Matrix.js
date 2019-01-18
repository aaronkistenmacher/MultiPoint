const VSHADER_SOURCE = `
  // x' = x cos b - y sin b
  // y' = x sin b + y cos b
  // z' = z
  attribute vec4 aPosition;
  uniform mat4 uXformMatrix;
  void main() {
    gl_Position = uXformMatrix * aPosition;
  }
`

const FSHADER_SOURCE = `
  void main() {
    gl_FragColor = vec4(0.0, 0.25, 0.50, 1.0);
  }
`

function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));

    return null;
  }

  return shaderProgram;
}

function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
}

const angle = 90.0;

function main() {
  const canvas = document.getElementById('webgl');

  const gl = canvas.getContext('webgl');

  if (!gl) {
    alert('Unable to initialize WebGL.');
    return;
  }

  const program = initShaderProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE);
  gl.useProgram(program);
  gl.program = program;

  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the position of the vertices');
    return;
  }

  const radian = Math.PI * angle / 180.0;
  const cosB = Math.cos(radian);
  const sinB = Math.sin(radian);

  // WebGL is column major
  const xformMatrix = new Float32Array([
     cosB,  sinB,   0.0,   0.0,
    -sinB,  cosB,   0.0,   0.0,
      0.0,   0.0,   1.0,   0.0,
      0.0,   0.0,   0.0,   1.0
  ]);

  const uXformMatrix = gl.getUniformLocation(gl.program, 'uXformMatrix');
  gl.uniformMatrix4fv(uXformMatrix, false, xformMatrix);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVertexBuffers(gl) {
  var vertices = new Float32Array([  0.0,  0.5,
                                    -0.5, -0.5,
                                     0.5, -0.5 ]);
  // var n = 4;
  const n = vertices.length/2;

  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create buffer object');
    return -1;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  var aPosition = gl.getAttribLocation(gl.program, 'aPosition');
  if (aPosition < 0) {
    console.log('Failed to get the storage location of aPosition');
    return -1;
  }

  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(aPosition);

  return n;
}