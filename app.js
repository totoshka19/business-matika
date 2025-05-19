const app = document.getElementById('app');

// Константы для API авторизации ReqRes.in
const REQRES_LOGIN_URL = 'https://reqres.in/api/login';
const REQRES_API_KEY = 'reqres-free-v1';

// Константы для API погоды OpenWeatherMap
const OPENWEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';
const OPENWEATHER_API_KEY = '1be42fe31b1b8e2dab9e25ed802d6a98';
const WEATHER_CITY = 'moscow';
const WEATHER_UNITS = 'metric';
const WEATHER_LANG = 'ru';

// Получаем ссылки на секции
const loginSection = document.getElementById('login-section');
const weatherSection = document.getElementById('weather-section');
const weatherErrorSection = document.getElementById('weather-error-section');
const weatherErrorMessage = document.getElementById('weather-error-message');

// Вспомогательная функция для обработки ответов fetch
async function handleFetchResponse(response) {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${response.status}: ${response.statusText} - ${errorText}`);
  }
  return response.json();
}

// Вспомогательная функция для отображения ошибок в форме логина
function displayLoginError(message) {
  const errorElement = document.getElementById('error');
  if (errorElement) {
    errorElement.innerText = message;
  }
}

// Обновленные функции рендеринга для управления видимостью секций
function renderLogin() {
  loginSection.classList.remove('hidden');
  weatherSection.classList.add('hidden');
  weatherErrorSection.classList.add('hidden');
}

function renderWeather(data) {
  loginSection.classList.add('hidden');
  weatherSection.classList.remove('hidden');
  weatherErrorSection.classList.add('hidden');

  // Обновляем данные в элементах карточки погоды
  document.getElementById('weather-icon').src = `https://openweathermap.org/img/w/${data.weather[0].icon}.png`;
  document.getElementById('weather-temp').innerText = Math.round(data.main.temp);
  document.getElementById('weather-description').innerText = data.weather[0].description;
  document.getElementById('weather-speed').innerText = data.wind.speed;
}

function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  displayLoginError('');

  fetch(REQRES_LOGIN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': REQRES_API_KEY
    },
    body: JSON.stringify({ email, password })
  })
  .then(handleFetchResponse)
  .then(data => {
    if (data.token) {
      localStorage.setItem('token', data.token);
      loadWeather();
    } else {
      displayLoginError('Неверные логин или пароль');
    }
  })
  .catch(err => {
    // Проверяем, является ли ошибка ошибкой авторизации от ReqRes.in
    if (err.message.includes('Missing password') || err.message.includes('user not found')) {
      displayLoginError('Неверные логин или пароль');
    } else {
      displayLoginError(`Ошибка входа: ${err.message}`);
    }
  });
}

function logout() {
  localStorage.removeItem('token');
  renderLogin();
}

function loadWeather() {
  fetch(`${OPENWEATHER_API_URL}?q=${WEATHER_CITY}&appid=${OPENWEATHER_API_KEY}&units=${WEATHER_UNITS}&lang=${WEATHER_LANG}`)
    .then(handleFetchResponse)
    .then(data => {
      renderWeather(data);
    })
    .catch(err => {
      // Показываем секцию ошибки и вставляем текст ошибки через textContent
      weatherErrorSection.classList.remove('hidden');
      weatherErrorMessage.textContent = `Не удалось загрузить погоду: ${err.message}.`;
      loginSection.classList.add('hidden');
      weatherSection.classList.add('hidden');
    });
}

// Проверяем, есть ли токен при загрузке страницы
if (localStorage.getItem('token')) {
  loadWeather();
} else {
  renderLogin();
}