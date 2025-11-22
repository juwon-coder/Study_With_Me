// script.js - 추후 JavaScript 기능을 추가할 예정입니다.

document.addEventListener('DOMContentLoaded', () => {
    console.log('StudyBuddy 웹사이트가 로드되었습니다.');

    // --- 데이터 관리 (임시) ---
    // 실제 백엔드 없이 데이터를 관리하기 위한 간단한 로직
    let studies = JSON.parse(localStorage.getItem('studies')) || [];
    let currentLeader = localStorage.getItem('currentLeader') || null; // 현재 브라우저에서 스터디를 개설한 리더명 (가상)

    function saveStudies() {
        localStorage.setItem('studies', JSON.stringify(studies));
    }

    function saveCurrentLeader(leaderName) {
        localStorage.setItem('currentLeader', leaderName);
        currentLeader = leaderName;
    }

    // 예시 스터디 초기화 (localStorage에 스터디가 없을 때만)
    if (studies.length === 0) {
        const exampleStudies = [
            { id: 'ex1', leader: '김민준', title: '파이썬 기초 문법 스터디', category: '코딩', description: '프로그래밍 초보자를 위한 파이썬 기초 스터디입니다. 주 2회 온라인으로 진행됩니다.', members: 5, method: '온라인', schedule: '매주 월,수 저녁 8시', deadline: '2025-12-31', status: '모집 중', createdAt: new Date().toISOString() },
            { id: 'ex2', leader: '이서연', title: '토익 900+ 목표 스터디', category: '어학', description: '토익 고득점을 위한 실전 문제 풀이 및 오답 분석 스터디입니다. 오프라인으로 진행됩니다.', members: 3, method: '오프라인', schedule: '매주 토요일 오전 10시', deadline: '2025-11-30', status: '모집 중', createdAt: new Date().toISOString() },
            { id: 'ex3', leader: '박지훈', title: '모던 자바스크립트 완전 정복', category: '코딩', description: 'ES6+ 문법과 비동기 프로그래밍을 학습하는 스터디입니다. 온라인 혼합 방식입니다.', members: 7, method: '혼합', schedule: '매주 화요일 저녁 7시', deadline: '2026-01-15', status: '모집 완료', createdAt: new Date().toISOString() },
            { id: 'ex4', leader: '최유진', title: '드로잉 기초 & 인물화', category: '취미/교양', description: '드로잉 실력을 향상시키고 인물화를 배우는 스터디입니다. 매주 오프라인 모임.', members: 4, method: '오프라인', schedule: '매주 일요일 오후 2시', deadline: '2025-12-10', status: '모집 중', createdAt: new Date().toISOString() }
        ];
        studies = exampleStudies; // 예시 스터디로 초기화
        saveStudies();
    }

    // --- 문의하기 폼 제출 처리 (예시) ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            console.log('문의 내용:', { name, email, message });

            const formMessage = document.getElementById('form-message');
            formMessage.textContent = '문의해주셔서 감사합니다! 빠른 시일 내에 답변드리겠습니다.';
            contactForm.reset();
        });
    }

    // --- 메인 페이지: 주목할 만한 스터디 로드 ---
    const featuredStudiesGrid = document.querySelector('#featured-studies .study-grid');
    if (featuredStudiesGrid) {
        const featured = studies.slice(0, 3); 
        if (featured.length === 0) {
            featuredStudiesGrid.innerHTML = '<p>아직 개설된 스터디가 없습니다. 새로운 스터디를 개설해보세요!</p>';
        } else {
            featured.forEach(study => {
                const studyCard = document.createElement('div');
                studyCard.classList.add('study-card');
                studyCard.innerHTML = `
                    <span class="category">${study.category}</span>
                    <h4><a href="study-detail.html?id=${study.id}">${study.title}</a></h4>
                    <p>리더: ${study.leader}</p>
                    <p>${study.description.substring(0, 100)}...</p>
                    <p class="status ${study.status === '모집 완료' ? 'closed' : ''}">${study.status}</p>
                `;
                featuredStudiesGrid.appendChild(studyCard);
            });
        }
    }

    // --- 스터디 개설 페이지: 폼 제출 처리 ---
    const createStudyForm = document.getElementById('create-study-form');
    if (createStudyForm) {
        createStudyForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const leaderName = document.getElementById('study-leader').value.trim();
            const isEditing = !!document.getElementById('create-study-form').dataset.editingId; // 수정 모드인지 확인

            if (!leaderName) {
                alert('스터디 리더명을 입력해주세요.');
                return;
            }
            
            const newStudyId = isEditing ? document.getElementById('create-study-form').dataset.editingId : `study_${Date.now()}`; // 새로운 ID 생성

            const newStudyData = {
                id: newStudyId,
                leader: leaderName,
                title: document.getElementById('study-title').value,
                category: document.getElementById('study-category').value,
                description: document.getElementById('study-description').value,
                members: parseInt(document.getElementById('study-members').value),
                method: document.getElementById('study-method').value,
                schedule: document.getElementById('study-schedule').value,
                deadline: document.getElementById('study-deadline').value,
                status: '모집 중', // 초기 상태
                createdAt: new Date().toISOString()
            };

            if (isEditing) {
                // 기존 스터디 업데이트
                const editingId = document.getElementById('create-study-form').dataset.editingId;
                studies = studies.map(s => (s.id === editingId ? { ...s, ...newStudyData } : s));
                alert('스터디가 성공적으로 수정되었습니다!');
            } else {
                // 새로운 스터디 추가
                studies.unshift(newStudyData); // 최신 스터디가 맨 위에 오도록
                alert('새로운 스터디가 성공적으로 개설되었습니다!');
                saveCurrentLeader(leaderName); // 현재 개설한 리더명 저장
            }
            saveStudies();

            createStudyForm.reset();
            console.log('처리된 스터디:', newStudyData);

            setTimeout(() => {
                window.location.href = 'study-list.html'; // 목록 페이지로 이동
            }, 1000);
        });

        // 수정 모드로 페이지 접근 시 폼 채우기
        const urlParams = new URLSearchParams(window.location.search);
        const editStudyId = urlParams.get('editId');
        if (editStudyId) {
            const studyToEdit = studies.find(s => s.id === editStudyId);
            if (studyToEdit) {
                document.getElementById('study-leader').value = studyToEdit.leader;
                // document.getElementById('study-id').readOnly = true; // ID는 수정 불가, 이제 ID는 자동 생성
                document.getElementById('study-title').value = studyToEdit.title;
                document.getElementById('study-category').value = studyToEdit.category;
                document.getElementById('study-description').value = studyToEdit.description;
                document.getElementById('study-members').value = studyToEdit.members;
                document.getElementById('study-method').value = studyToEdit.method;
                document.getElementById('study-schedule').value = studyToEdit.schedule;
                document.getElementById('study-deadline').value = studyToEdit.deadline;
                document.querySelector('#create-study-content h2').textContent = '스터디 수정';
                document.querySelector('#create-study-form button[type="submit"]').textContent = '스터디 수정하기';
                createStudyForm.dataset.editingId = editStudyId; // 수정 모드임을 표시
            } else {
                alert('수정할 스터디를 찾을 수 없습니다.');
                window.location.href = 'study-list.html';
            }
        }
    }

    // --- 스터디 목록 페이지: 스터디 로드 및 필터링 ---
    const allStudiesGrid = document.getElementById('all-studies-grid');
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const methodFilter = document.getElementById('method-filter');
    const statusFilter = document.getElementById('status-filter');
    const applyFiltersBtn = document.getElementById('apply-filters');

    function renderStudies(filteredStudies) {
        if (allStudiesGrid) {
            allStudiesGrid.innerHTML = ''; // 기존 목록 초기화
            if (filteredStudies.length === 0) {
                allStudiesGrid.innerHTML = '<p>조건에 맞는 스터디가 없습니다.</p>';
                return;
            }
            filteredStudies.forEach(study => {
                const studyCard = document.createElement('div');
                studyCard.classList.add('study-card');
                studyCard.innerHTML = `
                    <span class="category">${study.category}</span>
                    <h4><a href="study-detail.html?id=${study.id}">${study.title}</a></h4>
                    <p>리더: ${study.leader}</p>
                    <p>${study.description.substring(0, 100)}...</p>
                    <p class="status ${study.status === '모집 완료' ? 'closed' : ''}">${study.status}</p>
                `;
                allStudiesGrid.appendChild(studyCard);
            });
        }
    }

    function applyFilters() {
        let filtered = [...studies];

        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
        const selectedMethod = methodFilter ? methodFilter.value : 'all';
        const selectedStatus = statusFilter ? statusFilter.value : 'all';

        if (searchTerm) {
            filtered = filtered.filter(study =>
                study.title.toLowerCase().includes(searchTerm) ||
                study.description.toLowerCase().includes(searchTerm) ||
                study.leader.toLowerCase().includes(searchTerm) // 리더명으로도 검색 가능
            );
        }

        if (selectedCategory !== 'all') {
            filtered = filtered.filter(study => study.category === selectedCategory);
        }

        if (selectedMethod !== 'all') {
            filtered = filtered.filter(study => study.method === selectedMethod);
        }

        if (selectedStatus !== 'all') {
            filtered = filtered.filter(study => study.status === selectedStatus);
        }

        renderStudies(filtered);
    }

    if (window.location.pathname.includes('study-list.html')) {
        renderStudies(studies); // 초기 로드
        applyFiltersBtn?.addEventListener('click', applyFilters);
        // 검색 필드에서 Enter 키 눌렀을 때도 필터 적용
        searchInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                applyFilters();
            }
        });
        // 필터 변경 시 자동 적용
        categoryFilter?.addEventListener('change', applyFilters);
        methodFilter?.addEventListener('change', applyFilters);
        statusFilter?.addEventListener('change', applyFilters);
        searchInput?.addEventListener('input', applyFilters); // 입력할 때마다 필터 적용
    }

    // --- 스터디 상세 페이지: 정보 로드 및 참여 신청 ---
    if (window.location.pathname.includes('study-detail.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const studyId = urlParams.get('id'); 
        const study = studies.find(s => s.id === studyId);

        if (study) {
            document.getElementById('detail-study-title').textContent = study.title;
            document.getElementById('detail-study-category').textContent = study.category;
            document.getElementById('detail-study-members').textContent = study.members;
            document.getElementById('detail-study-method').textContent = study.method;
            document.getElementById('detail-study-schedule').textContent = study.schedule || '정보 없음';
            document.getElementById('detail-study-deadline').textContent = study.deadline || '상시 모집';
            document.getElementById('detail-study-description').textContent = study.description;
            document.getElementById('detail-study-leader').textContent = study.leader; // 리더명 표시

            const applyButton = document.getElementById('apply-for-study');
            const applyMessage = document.getElementById('apply-message');

            const detailContent = document.getElementById('study-detail-content');
            const editDeleteContainer = document.createElement('div');
            editDeleteContainer.style.marginTop = '30px';

            // --- 내가 개설한 스터디일 경우 수정/삭제 버튼 표시 ---
            if (study.leader === currentLeader) { // 현재 브라우저에서 개설된 스터디의 리더와 같으면
                applyButton.style.display = 'none'; // 참여 신청 버튼 숨기기

                const editButton = document.createElement('button');
                editButton.textContent = '수정하기';
                editButton.classList.add('btn');
                editButton.style.marginRight = '10px';
                editButton.addEventListener('click', () => {
                    window.location.href = `create-study.html?editId=${study.id}`;
                });
    
                const deleteButton = document.createElement('button');
                deleteButton.textContent = '삭제하기';
                deleteButton.classList.add('btn');
                deleteButton.style.backgroundColor = '#dc3545'; 
                deleteButton.style.borderColor = '#dc3545';
                deleteButton.addEventListener('click', () => {
                    if (confirm('정말로 이 스터디를 삭제하시겠습니까?')) {
                        studies = studies.filter(s => s.id !== study.id);
                        saveStudies();
                        alert('스터디가 삭제되었습니다.');
                        window.location.href = 'study-list.html';
                    }
                });

                editDeleteContainer.appendChild(editButton);
                editDeleteContainer.appendChild(deleteButton);
                detailContent.appendChild(editDeleteContainer);

            } else { // 다른 사람이 개설한 스터디일 경우 (또는 내가 개설한 스터디가 아닌 경우)
                editDeleteContainer.style.display = 'none'; // 수정/삭제 버튼 숨기기

                if (study.status === '모집 완료') {
                    applyButton.textContent = '모집 완료';
                    applyButton.disabled = true;
                    applyButton.style.backgroundColor = '#6c757d'; 
                    applyMessage.textContent = '이 스터디는 현재 모집이 완료되었습니다.';
                    applyMessage.style.color = '#dc3545';
                } else {
                    applyButton.addEventListener('click', () => {
                        alert(`${study.title} 스터디에 참여를 신청합니다! (실제로는 신청 메시지 작성 폼 등이 나타납니다.)`);
                        applyMessage.textContent = '참여 신청이 완료되었습니다. 리더의 승인을 기다려주세요!';
                        applyMessage.style.color = 'green';
                        applyButton.disabled = true;
                        applyButton.textContent = '신청 완료';
                        applyButton.style.backgroundColor = '#6c757d';
                    });
                }
            }
        } else {
            document.getElementById('study-detail-content').innerHTML = '<h2>스터디를 찾을 수 없습니다.</h2><p>존재하지 않거나 삭제된 스터디입니다.</p>';
        }
    }
});
