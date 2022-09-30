function main() {
    var canvas = document.querySelector("#glcanvas");
    var gl = canvas.getContext("webgl");
    if (!gl) {
        return;
    }

    // creates buffers 
    const cubeBufferInfo = primitives.createCubeWithVertexColorsBufferInfo(gl, 15);
    const coneBufferInfo   = primitives.createTruncatedConeWithVertexColorsBufferInfo(gl, 10, 0, 20, 12, 1, true, false);
    const sphereBufferInfo = primitives.createSphereWithVertexColorsBufferInfo(gl, 10, 12, 6);

    // setup GLSL program
    var programInfo = webglUtils.createProgramInfo(gl, ["vertex-shader-3d", "fragment-shader-3d"]);

    function degToRad(d) {
        return d * Math.PI / 180;
    }

    var fieldOfViewRadians = degToRad(50);

    // Uniforms for each object.

    var cubeUniforms = {
        u_colorMult: [0.5, 1, 0.5, 1],
        u_matrix: m4.identity(),
    };

    var coneUniforms = {
        u_colorMult: [0.5, 0.8, 0.8, 1],
        u_matrix: m4.identity(),
    };

    var sphereUniforms = {
        u_colorMult: [1, 1, 1, 1],
        u_matrix: m4.identity(),
    };

    var cubeTranslation = [-170, 40, 0];
    var coneTranslation   = [ 40, 0, 0];
    var sphereTranslation = [  0, 0, 0];

    var objectsToDraw = [
        {
            programInfo: programInfo,
            bufferInfo: cubeBufferInfo,
            uniforms: cubeUniforms,
        },

        {
            programInfo: programInfo,
            bufferInfo: coneBufferInfo,
            uniforms: coneUniforms,
        },

        {
            programInfo: programInfo,
            bufferInfo: sphereBufferInfo,
            uniforms: sphereUniforms,
        },
    ];

    function computeMatrix(viewProjectionMatrix, translation, xRotation, yRotation) {
        var matrix = m4.translate(viewProjectionMatrix,
            translation[0],
            translation[1],
            translation[2]);
        matrix = m4.xRotate(matrix, xRotation);
        return m4.yRotate(matrix, yRotation);
    }

    requestAnimationFrame(drawScene);

    // Draw the scene.
    function drawScene(time) {
        time *= 0.0005;
        cubeTranslation[0] += 0.5
        if (cubeTranslation[0] > 170) cubeTranslation[0] = -170

        webglUtils.resizeCanvasToDisplaySize(gl.canvas);

        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);

        // Clear the canvas AND the depth buffer.
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Compute the projection matrix
        var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        var projectionMatrix =
            m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

        // Compute the camera's matrix using look at.
        var cameraPosition = [0, 0, 150];
        var target = [0, 0, 0];
        var up = [0, 1, 0];
        var cameraMatrix = m4.lookAt(cameraPosition, target, up);

        // Make a view matrix from the camera matrix.
        var viewMatrix = m4.inverse(cameraMatrix);

        var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

        var cubeXRotation = -time;
        var cubeYRotation = time;

        var coneXRotation   =  time;
        var coneYRotation   = -time;

        var sphereXRotation =  time;
        var sphereYRotation =  time;

        // Compute the matrices for each object.

        cubeUniforms.u_matrix = computeMatrix(
            viewProjectionMatrix,
            cubeTranslation,
            cubeXRotation,
            cubeYRotation);

        coneUniforms.u_matrix = computeMatrix(
            viewProjectionMatrix,
            coneTranslation,
            coneXRotation,
            coneYRotation);

        sphereUniforms.u_matrix = computeMatrix(
            viewProjectionMatrix,
            sphereTranslation,
            sphereXRotation,
            sphereYRotation);

        // ------ Draw the objects --------

        objectsToDraw.forEach(function (object) {
            var programInfo = object.programInfo;
            var bufferInfo = object.bufferInfo;

            gl.useProgram(programInfo.program);

            // Setup all the needed attributes.
            webglUtils.setBuffersAndAttributes(gl, programInfo, bufferInfo);

            // Set the uniforms.
            webglUtils.setUniforms(programInfo, object.uniforms);

            // Draw
            gl.drawArrays(gl.TRIANGLES, 0, bufferInfo.numElements);
        });

        requestAnimationFrame(drawScene);
    }
}

main();
