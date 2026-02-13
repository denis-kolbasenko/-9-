import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// RoomEnvironment убран - ломает прозрачность

export function loadModel(containerId, modelUrl) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // 1. Сцена - Самостоятельное задание 9 лаба: Прозрачный фон
  const scene = new THREE.Scene();
  scene.background = null; // ✅ Прозрачный фон сцены

  // 2. Камера
  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    100
  );

  // 3. Рендерер - Полные настройки цвета + прозрачность
  const renderer = new THREE.WebGLRenderer({ 
    antialias: true, 
    alpha: true // ✅ Самостоятельное задание 9 лаба: Прозрачность canvas
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  
  // ✅ ВАЖНЫЕ НАСТРОЙКИ ЦВЕТА (киношный рендер)
  renderer.outputColorSpace = THREE.SRGBColorSpace;     // Правильные цвета
  renderer.toneMapping = THREE.ACESFilmicToneMapping;   // Tone Mapping как в Unreal
  renderer.toneMappingExposure = 1.8;                   // Яркость

  // Убедитесь, что очистка container.innerHTML = '' происходит ДО добавления лоадера
  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  // 4. Контролы
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 0.5;
  controls.maxDistance = 20;

  // 5. СВЕТ (критично важно!)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Мягкий свет
  scene.add(ambientLight);
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.5); // Основной свет
  dirLight.position.set(5, 10, 7);
  scene.add(dirLight);

  // --- 1. Генерируем HTML лоадера программно --
  const loaderDiv = document.createElement('div');
  loaderDiv.className = 'loader-overlay';
  loaderDiv.innerHTML = `
    <div>Загрузка...</div>
    <div class="progress-bar">
      <div class="progress-fill"></div>
    </div>
  `;
  container.appendChild(loaderDiv);

  // Находим полоску, чтобы менять её ширину
  const progressFill = loaderDiv.querySelector('.progress-fill');

  // 6. Загрузка модели
  const loader = new GLTFLoader();
  loader.load(
    modelUrl,
    // A. ON LOAD (Успех)
    (gltf) => {
      const model = gltf.scene;
      fitCameraToObject(camera, model, controls);
      scene.add(model);
      
      // Скрываем лоадер
      loaderDiv.style.opacity = '0';
      setTimeout(() => {
        loaderDiv.remove(); // Удаляем из DOM через 0.3 сек
      }, 300);
    },
    // B. ON PROGRESS (Прогресс)
    (xhr) => {
      // xhr.total - общий вес файла в байтах
      // xhr.loaded - сколько скачалось
      if (xhr.total > 0) {
        const percent = (xhr.loaded / xhr.total) * 100;
        progressFill.style.width = percent + '%';
      }
    },
    // C. ON ERROR (Ошибка)
    (error) => {
      console.error('Ошибка загрузки:', error);
      loaderDiv.innerHTML = `
        <div class="error-msg">
          ❌ Ошибка загрузки<br>
          Проверьте файл
        </div>
      `;
    }
  );

  // 7. Анимация
  function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Обновляем контролы (инерция)
    renderer.render(scene, camera);
  }
  animate();

  // 8. Resize обработчик
  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
}

// Функция центровки камеры под модель
function fitCameraToObject(camera, object, controls) {
  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);

  // Центрируем модель
  object.position.x = -center.x;
  object.position.y = -center.y;
  object.position.z = -center.z;

  // Позиционируем камеру
  const fov = camera.fov * (Math.PI / 180);
  let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.5;
  camera.position.set(cameraZ, cameraZ * 0.5, cameraZ);
  camera.lookAt(0, 0, 0);

  // Настраиваем контролы
  controls.target.set(0, 0, 0);
  controls.update();
}
