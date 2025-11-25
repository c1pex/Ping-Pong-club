import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCIfPeJSURQW_TNBYvaKcsX6bDtMLwr-ZE",
  authDomain: "tennizov.firebaseapp.com",
  databaseURL: "https://tennizov-default-rtdb.firebaseio.com",
  projectId: "tennizov",
  storageBucket: "tennizov.appspot.com",
  messagingSenderId: "194989527761",
  appId: "1:194989527761:web:c0a4ba1fcf9484709fabf0"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Элементы DOM
const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

// Переключение между вкладками
loginTab.addEventListener('click', () => {
  loginTab.classList.add('text-blue-600', 'border-blue-600');
  loginTab.classList.remove('text-gray-500');
  registerTab.classList.remove('text-blue-600', 'border-blue-600');
  registerTab.classList.add('text-gray-500');
  loginForm.classList.remove('hidden');
  registerForm.classList.add('hidden');
});

registerTab.addEventListener('click', () => {
  registerTab.classList.add('text-blue-600', 'border-blue-600');
  registerTab.classList.remove('text-gray-500');
  loginTab.classList.remove('text-blue-600', 'border-blue-600');
  loginTab.classList.add('text-gray-500');
  registerForm.classList.remove('hidden');
  loginForm.classList.add('hidden');
});

// Функция показа уведомлений
function showAlert(icon, title, text) {
  Swal.fire({
    icon: icon,
    title: title,
    text: text,
    confirmButtonColor: '#1e40af'
  });
}

// Регистрация
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('registerConfirmPassword').value;

  // Валидация
  if (password !== confirmPassword) {
    showAlert('error', 'Ошибка', 'Пароли не совпадают');
    return;
  }

  if (password.length < 6) {
    showAlert('error', 'Ошибка', 'Пароль должен содержать минимум 6 символов');
    return;
  }

  try {
    // Создаем пользователя
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Обновляем профиль с именем
    await updateProfile(user, {
      displayName: name
    });

    showAlert('success', 'Успех!', 'Регистрация завершена. Теперь вы можете войти.');
    
    // Переключаем на вкладку входа
    loginTab.click();
    
    // Очищаем форму регистрации
    registerForm.reset();
    
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    
    let errorMessage = 'Ошибка при регистрации';
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'Этот email уже зарегистрирован';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Неверный формат email';
        break;
      case 'auth/weak-password':
        errorMessage = 'Пароль слишком слабый';
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Проблемы с сетью. Проверьте подключение к интернету';
        break;
    }
    
    showAlert('error', 'Ошибка', errorMessage);
  }
});

// Вход
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    showAlert('success', 'Успешный вход!', `Добро пожаловать, ${user.displayName || user.email}!`);
    
    // Перенаправляем на главную страницу через 1.5 секунды
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1500);
    
  } catch (error) {
    console.error('Ошибка входа:', error);
    
    let errorMessage = 'Ошибка при входе';
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'Пользователь с таким email не найден';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Неверный пароль';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Неверный формат email';
        break;
      case 'auth/invalid-credential':
        errorMessage = 'Неверные учетные данные';
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Проблемы с сетью. Проверьте подключение к интернету';
        break;
    }
    
    showAlert('error', 'Ошибка', errorMessage);
  }
});

// Проверяем, если пользователь уже авторизован
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Если пользователь уже вошел, перенаправляем на главную
    window.location.href = 'index.html';
  }
});