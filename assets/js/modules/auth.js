layui.define((exports) => {
  const { layer, form, $, data: localStorageCustom } = layui;

  const auth = {
    baseUrl: 'http://test.com/api',
    faceApiLoaded: false,
    modelLoaded: false,

    init() {
      this.bindEvents();
      this.getLang();
      this.loadFaceApi();
    },

    getLang() {
      $.ajax({
        url: `${this.baseUrl}/lang`,
        method: 'GET',
        dataType: 'json',
        success: (result) => {
          layui.data('lang', result.lang);
        },
        error: (error) => {
          console.log(error);
        },
      });
    },
    async loadFaceApi() {
      try {
        console.log('Loading face-api...');
        // Wait for faceapi to be available
        await this.waitForFaceApi();
        const MODEL_URL =
          'https://cdn.jsdelivr.net/gh/cgarciagl/face-api.js/weights';
        console.log('Loading models...');
        // Load required models
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);

        this.faceApiLoaded = true;
        this.modelLoaded = true;
        console.log('Face-api loaded successfully');
      } catch (error) {
        console.error('Error loading face-api:', error);
        this.modelLoaded = false;
      }
    },

    waitForFaceApi() {
      return new Promise((resolve, reject) => {
        let retries = 0;
        const maxRetries = 2;

        const checkFaceApi = () => {
          if (window.faceapi) {
            console.log('Face API loaded');
            resolve();
          } else if (retries >= maxRetries) {
            reject(new Error('Face API failed to load after 2 retries'));
          } else {
            retries++;
            console.log('Retrying face-api...');
            setTimeout(checkFaceApi, 100);
          }
        };
        checkFaceApi();
      });
    },

    bindEvents() {
      form.verify({
        loginStrongPassword: [
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
          'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        ],
        registerStrongPassword: [
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
          'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        ],
        confirmPassword(value) {
          const { password } = form.val('registerForm');
          if (value !== password) {
            return 'Passwords do not match';
          }
        },
      });

      form.on('submit(login)', function (data) {
        auth.login(data.field);
        return false;
      });

      form.on('submit(register)', function (data) {
        auth.register(data.field);
        return false;
      });

      $('#jaBtn').on('click', function () {
        localStorageCustom('lang', {
          key: 'lang',
          value: 'ja',
        });
      });

      $('#enBtn').on('click', function () {
        localStorageCustom('lang', {
          key: 'lang',
          value: 'en',
        });
      });

      $('#faceAuthBtn').on('click', function () {
        layer.open({
          title: 'Face Authentication',
          type: 1,
          content: `
            <div class="face-auth-container">
              <div
                class="face-auth-container"
                id="faceAuthContainer"
                lay-filter="faceAuthContainer"
                style="display: none"
              >
                <video id="video" width="640" height="480" autoplay></video>
              </div>
            </div>
          `,
          area: ['680px', '550px'], // Set fixed dimensions slightly larger than video
          offset: 'auto', // Center the layer - without this and area, layer.open uses default positioning
          shade: 0.8,
          shadeClose: true,
          move: false,
          resize: false,
          // maxmin: true,
          cancel: function () {
            const [video] = $('#video');
            if (video && video.srcObject) {
              const tracks = video.srcObject.getTracks();
              tracks.forEach((track) => track.stop());
            }
          },
        });
        auth.startFaceAuth();
      });
    },

    async login(data) {
      try {
        await $.ajax({
          url: `${this.baseUrl}/login`,
          method: 'POST',
          data: data,
          dataType: 'json',
          success: (result) => {
            console.log(result);
            layui.data('token', result.token);
            layer.msg('Login successful!', { icon: 1, time: 2000 }, () => {
              window.location.href = '/dashboard.html';
            });
          },
          error: (error) => {
            console.log(error);
          },
        });
      } catch (error) {
        layer.msg('Login failed!', { icon: 2 });
      }
    },

    async register(data) {
      try {
        await $.ajax({
          url: `${this.baseUrl}/register`,
          method: 'POST',
          data: data,
          dataType: 'json',
          success: (result) => {
            layui.data('token', result.token);
            layer.msg(
              'Registration successful!',
              { icon: 1, time: 2000 },
              () => {
                window.location.href = '/login';
              }
            );
          },
          error: (error) => {
            console.log(error);
          },
        });
      } catch (error) {
        layer.msg('Registration failed!', { icon: 2 });
      }
    },

    async startFaceAuth() {
      if (!this.faceApiLoaded || !this.modelLoaded) {
        layer.msg('Face detection is still initializing. Please wait...', {
          icon: 16,
        });
        return;
      }

      const faceAuthContainer = $('#faceAuthContainer');
      const video = document.getElementById('video');

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        video.srcObject = stream;
        faceAuthContainer.show();

        video.addEventListener('play', async () => {
          try {
            const canvas = faceapi.createCanvasFromMedia(video);
            canvas.style.position = 'absolute';
            canvas.style.top = video.offsetTop + 'px';
            canvas.style.left = video.offsetLeft + 'px';
            faceAuthContainer.append(canvas);

            const displaySize = { width: video.width, height: video.height };
            faceapi.matchDimensions(canvas, displaySize);

            // const verifyFace = this.verifyFace.bind(this);
            let faceDetected = false;

            const interval = setInterval(async () => {
              const detections = await faceapi
                .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks();

              if (detections && !faceDetected) {
                // faceDetected = true;
                // if the confidence is less than 0.5, then we don't verify the face
                console.log(detections?.detection?._score);
                if (detections?.detection?._score > 0.95) {
                  // layer.msg('Face detected', { icon: 1 });
                  // verifyFace(detections.landmarks.positions);
                }
              }

              const resizedDetections = detections
                ? faceapi.resizeResults(detections, displaySize)
                : null;
              canvas
                .getContext('2d')
                .clearRect(0, 0, canvas.width, canvas.height);
              if (detections) {
                faceapi.draw.drawDetections(canvas, resizedDetections);
                faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
              }
            }, 100);
          } catch (error) {
            console.error('Face detection error:', error);
            layer.msg('Face detection failed to initialize', { icon: 2 });
          }
        });
      } catch (error) {
        console.error('Camera access error:', error);
        layer.msg('Failed to access camera', { icon: 2 });
      }
    },

    async verifyFace(faceLandmarks) {
      try {
        await $.ajax({
          url: `${this.baseUrl}/verify-face`,
          method: 'POST',
          data: { faceLandmarks },
          dataType: 'json',
          success: (result) => {
            console.log(result);
            layer.msg(
              'Face verification successful!',
              {
                icon: 1,
                time: 2000,
              },
              () => {
                window.location.href = '/dashboard';
              }
            );
          },
          error: (error) => {
            layer.msg('Face verification failed!', { icon: 2 });
            console.log(error);
          },
        });
      } catch (error) {
        layer.msg('Face verification failed!', { icon: 2 });
      }
    },
  };

  exports('auth', auth);
});
