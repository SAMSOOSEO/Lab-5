// global.js
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

// 선택자 $$ 함수 (배열 반환)
function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// 페이지 정보 배열
const pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'contact/', title: 'Contact' },
  { url: 'resume/', title: 'CV & Resume' },
  { url: 'https://github.com/samsooseo', title: 'GitHub' }
];

// <nav> 생성 후 body 맨 위에 추가
let nav = document.createElement('nav');
document.body.prepend(nav);

// BASE_PATH 정의 (로컬 / GitHub Pages 구분)
const BASE_PATH =
  location.hostname === 'localhost' || location.hostname === '127.0.0.1'
    ? '/'             // 로컬 서버
    : '/Lab-5/';      // GitHub Pages repo 이름

// 페이지 링크 반복 생성
for (let p of pages) {
  let url = !p.url.startsWith('http') ? BASE_PATH + p.url : p.url;
  let a = document.createElement('a');
  a.href = url;
  a.textContent = p.title;
  a.classList.toggle('current', a.host === location.host && a.pathname === location.pathname);
  if (a.host !== location.host) {
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  }
  nav.append(a);
}

// Dark Mode 관련 내용
document.body.insertAdjacentHTML(
  'afterbegin',
  `
<label class="color-scheme">
  Theme:
  <select>
    <option value="light dark">Automatic</option>
    <option value="light">Light</option>
    <option value="dark">Dark</option>
  </select>
</label>
`
);

const select = document.querySelector('.color-scheme select');
if ('colorScheme' in localStorage) {
  const saved = localStorage.colorScheme;
  document.documentElement.style.setProperty('color-scheme', saved);
  select.value = saved;
}

select.addEventListener('input', (event) => {
  const value = event.target.value;
  if (value === 'light dark') {
    document.documentElement.style.removeProperty('color-scheme');
  } else {
    document.documentElement.style.setProperty('color-scheme', value);
  }
  localStorage.colorScheme = value;
});

const saved = localStorage.colorScheme || 'light dark';
document.documentElement.style.setProperty(
  'color-scheme',
  saved === 'light dark' ? '' : saved
);
select.value = saved;

// JSON fetch 함수
export async function fetchJSON(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching JSON:', error);
    return null;
  }
}

// 프로젝트 렌더링 함수
export async function initProjects() {
  const projects = await fetchJSON(`${BASE_PATH}lib/projects.json`);
  if (!projects) return;
  const container = document.querySelector('.projects');
  container.innerHTML = '';
  projects.forEach(project => {
    const article = document.createElement('article');
    article.innerHTML = `
      <h3>${project.title}</h3>
      <img src="${project.image || 'https://via.placeholder.com/150'}" alt="${project.title}">
      <p>${project.description || 'Description not available.'}</p>
    `;
    container.appendChild(article);
  });
}

// 메인 IIFE
(async function() {
  const projectsContainer = document.querySelector('.projects');
  const projects = await fetchJSON(`${BASE_PATH}lib/projects.json`);
  if (projects) {
    const latestProjects = projects.slice(0, 4);
    renderProjects(latestProjects, projectsContainer, 'h3');
  }

  const githubData = await fetchJSON('https://api.github.com/users/SAMSOOSEO');
  const profileStats = document.querySelector('#profile-stats');
  if (profileStats && githubData) {
    profileStats.innerHTML = `
      <dl>
        <dt>Followers:</dt><dd>${githubData.followers}</dd>
        <dt>Following:</dt><dd>${githubData.following}</dd>
        <dt>Public Repos:</dt><dd>${githubData.public_repos}</dd>
        <dt>Public Gists:</dt><dd>${githubData.public_gists}</dd>
      </dl>
    `;
  }
})();
