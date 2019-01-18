const VSHADER_SOURCE = `
  attribute vec4 aPosition;
  uniform vec4 uTranslation;
  void main() {
    gl_Position = aPosition + uTranslation;
  }
`

const FSHADER_SOURCE = `
  void main() {
    gl_FragColor = vec4(0.5, 0.0, 1.0, 1.0);
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

const T = {
  x: 0.5,
  y: 0.5,
  z: 0.5
};

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

  const uTranslation = gl.getUniformLocation(gl.program, 'uTranslation');
  gl.uniform4f(uTranslation, T.x, T.y, T.z, 0.0);

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