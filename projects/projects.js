import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

const projectsContainer = document.querySelector('.projects');
const projectsTitle = document.querySelector('.projects-title');
const searchInput = document.querySelector('.searchBar');

const projects = await fetchJSON('../lib/projects.json');

if (projectsTitle) {
    projectsTitle.textContent = `Projects (${projects.length})`;
}

// 전역 변수
let selectedYear = null;          // Pie 선택 연도
let currentQuery = '';            // 검색어

function renderPieChart() {
    // Pie 데이터 준비: 항상 현재 검색 + Pie 필터를 반영
    const filteredProjects = projects
        .filter(p => Object.values(p).join('\n').toLowerCase().includes(currentQuery))
        .filter(p => !selectedYear || p.year === selectedYear);

    const rolledData = d3.rollups(filteredProjects, v => v.length, d => d.year);
    const data = rolledData.map(([year, count]) => ({ value: count, label: year }));

    const svg = d3.select('#projects-plot');
    const legend = d3.select('.legend');
    const colors = d3.scaleOrdinal(d3.schemeTableau10);

    const pieGenerator = d3.pie().value(d => d.value);
    const arcData = pieGenerator(data);
    const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

    // Pie 렌더링
    svg.selectAll('path')
       .data(arcData, d => d.data.label)
       .join(
           enter => enter.append('path')
                         .attr('d', arcGenerator)
                         .attr('fill', (_, i) => colors(i))
                         .attr('cursor', 'pointer')
                         .on('click', (event, d) => {
                             selectedYear = selectedYear === d.data.label ? null : d.data.label;
                             updateSelection();
                             event.stopPropagation();
                         }),
           update => update
                         .attr('d', arcGenerator)
                         .attr('fill', (_, i) => colors(i)),
           exit => exit.remove()
       );

    // Legend 렌더링
    legend.selectAll('li')
          .data(data, d => d.label)
          .join(
              enter => enter.append('li')
                            .attr('class', 'legend-item')
                            .attr('style', (_, i) => `--color:${colors(i)}`)
                            .html(d => `<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
                            .attr('cursor', 'pointer')
                            .on('click', (event, d) => {
                                selectedYear = selectedYear === d.label ? null : d.label;
                                updateSelection();
                                event.stopPropagation();
                            }),
              update => update
                            .attr('style', (_, i) => `--color:${colors(i)}`)
                            .html(d => `<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`),
              exit => exit.remove()
          );

    // 선택 상태 업데이트 함수
    function updateSelection() {
        svg.selectAll('path')
           .attr('class', d => d.data.label === selectedYear ? 'selected' : '');

        legend.selectAll('li')
              .attr('class', d => d.label === selectedYear ? 'selected' : 'legend-item');

        // 검색 + Pie 필터 동시에 적용
        const filtered = projects
            .filter(p => Object.values(p).join('\n').toLowerCase().includes(currentQuery))
            .filter(p => !selectedYear || p.year === selectedYear);

        renderProjects(filtered, projectsContainer, 'h2');
    }

    // Pie 클릭 후 초기 렌더링도 반영
    updateSelection();
}

// 초기 렌더링
renderPieChart();

// 검색 이벤트 처리
searchInput.addEventListener('input', (event) => {
    currentQuery = event.target.value.toLowerCase();
    selectedYear = selectedYear; // Pie 선택 유지
    renderPieChart();
});

// 빈 화면 클릭 시 초기화
document.addEventListener('click', (event) => {
    const target = event.target;
    if (target.closest('#projects-plot') || target.closest('.legend') || target.closest('.searchBar')) return;

    selectedYear = null;
    currentQuery = '';
    renderPieChart();
});
