import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function loadModel(containerId, modelUrl) {
  console.log('🚀=== LOADMODEL НАЧАЛО ===', containerId, modelUrl);
  
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('❌ КОНТЕЙНЕР НЕ НАЙДЕН');
    return;
  }
  console.log('✅ Контейнер найден');

  // ОЧИСТКА
  container.innerHTML = '';
  console.log('✅ Контейнер очищен');

  // ОСНОВНЫЕ ОБЪЕКТЫ
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.toneMapping = THREE.NoToneMapping;  // ✅ ОТКЛЮЧЕНО сжатие яркости
  renderer.toneMappingExposure = 2.0;          // ✅ УСИЛЕНО на 200%
  container.appendChild(renderer.domElement);
  console.log('✅ Renderer создан');

  // ✅ СТИЛИ ДЛЯ CANVAS
  const canvas = renderer.domElement;
  Object.assign(canvas.style, {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    zIndex: '999999',
    pointerEvents: 'all',
    cursor: 'grab',
    touchAction: 'manipulation'
  });
  console.log('✅ Canvas стили применены');

  // ORBITCONTROLS
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.enableZoom = true;
  controls.enablePan = false;
  controls.enabled = true;
  console.log('✅ Controls созданы');

  // 🔥 СУПЕР ЯРКИЙ СВЕТ (ЕДИНСТВЕННОЕ ИЗМЕНЕНИЕ)
  const ambientLight = new THREE.AmbientLight(0xffffff, 2.5);        // Было 1.2 → 2.5
  scene.add(ambientLight);
  
  const dirLight = new THREE.DirectionalLight(0xffffff, 5.0);        // Было 2.5 → 5.0
  dirLight.position.set(5, 10, 5);                                   // Лучше позиция
  scene.add(dirLight);
  
  // Дополнительный свет для объема
  const fillLight = new THREE.DirectionalLight(0xffffff, 2.0);       // ✅ НОВЫЙ свет
  fillLight.position.set(-5, 5, -5);
  scene.add(fillLight);
  
  console.log('✅ СУПЕР ЯРКИЙ свет добавлен');

  // ЛОАДЕР
  const loaderDiv = document.createElement('div');
  loaderDiv.className = 'loader-overlay';
  loaderDiv.innerHTML = '<div>Загрузка...</div>';
  container.appendChild(loaderDiv);
  console.log('✅ Лоадер показан');

  // ✅ КРИТИЧНАЯ ЗАГРУЗКА МОДЕЛИ
  const loader = new GLTFLoader();
  console.log('🔄 НАЧИНАЕМ ЗАГРУЗКУ:', modelUrl);
  
  loader.load(
    modelUrl,
    (gltf) => {
      console.log('✅ МОДЕЛЬ ЗАГРУЖЕНА!', gltf);
      const model = gltf.scene;
      scene.add(model);
      
      // ПОДГОНКА КАМЕРЫ
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3()).length();
      camera.position.set(size * 1.5, size * 1.5, size * 1.5);
      camera.lookAt(0, 0, 0);
      controls.target.set(0, 0, 0);
      controls.update();
      
      loaderDiv.remove();
      console.log('✅ Модель добавлена в сцену');
    },
    (xhr) => {
      console.log('📊 Прогресс:', xhr.loaded / xhr.total * 100 + '%');
    },
    (error) => {
      console.error('❌ ОШИБКА ЗАГРУЗКИ МОДЕЛИ:', error);
      loaderDiv.innerHTML = '❌ Ошибка загрузки модели';
    }
  );

  // АНИМАЦИЯ
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
  console.log('✅ Анимация запущена');
  
  console.log('🚀=== LOADMODEL КОНЕЦ ===');
}
