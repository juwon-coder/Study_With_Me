// script.js - 추후 JavaScript 기능을 추가할 예정입니다.

document.addEventListener('DOMContentLoaded', () => {
    console.log('StudyBuddy 웹사이트가 로드되었습니다.');

    // --- 데이터 관리 (임시) ---
    // 실제 백엔드 없이 데이터를 관리하기 위한 간단한 로직
    let studies = JSON.parse(localStorage.getItem('studies')) || [];
    // let nextStudyId = studies.length > 0 ? Math.max(...studies.map(s => s.id)) + 1 : 1; // 사용자가 ID 입력하므로 필요 없음

    function saveStudies() {
        localStorage.setItem('studies', JSON.stringify(studies));
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
        // 최신 스터디 3개를 주목할 만한 스터디로 표시 (예시)
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

            const studyId = document.getElementById('study-id').value.trim();
            const isEditing = !!document.getElementById('create-study-form').dataset.editingId; // 수정 모드인지 확인

            if (!studyId) {
                alert('스터디 고유 ID를 입력해주세요.');
                return;
            }

            if (!isEditing && studies.some(s => s.id === studyId)) {
                alert('이미 존재하는 스터디 ID입니다. 다른 ID를 사용해주세요.');
                return;
            }

            const newStudyData = {
                id: studyId,
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
            }
            saveStudies();

            // const createStudyMessage = document.getElementById('create-study-message');
            // createStudyMessage.textContent = isEditing ? '스터디가 성공적으로 수정되었습니다!' : '새로운 스터디가 성공적으로 개설되었습니다!';
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
                document.getElementById('study-id').value = studyToEdit.id;
                document.getElementById('study-id').readOnly = true; // ID는 수정 불가
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
                study.description.toLowerCase().includes(searchTerm)
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
    }

    // --- 스터디 상세 페이지: 정보 로드 및 참여 신청 ---
    if (window.location.pathname.includes('study-detail.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const studyId = urlParams.get('id'); // ID는 문자열로 관리
        const study = studies.find(s => s.id === studyId);

        if (study) {
            document.getElementById('detail-study-title').textContent = study.title;
            document.getElementById('detail-study-category').textContent = study.category;
            document.getElementById('detail-study-members').textContent = study.members;
            document.getElementById('detail-study-method').textContent = study.method;
            document.getElementById('detail-study-schedule').textContent = study.schedule || '정보 없음';
            document.getElementById('detail-study-deadline').textContent = study.deadline || '상시 모집';
            document.getElementById('detail-study-description').textContent = study.description;

            const applyButton = document.getElementById('apply-for-study');
            const applyMessage = document.getElementById('apply-message');

            // --- 수정/삭제 버튼 추가 ---
            const detailContent = document.getElementById('study-detail-content');
            const editDeleteContainer = document.createElement('div');
            editDeleteContainer.style.marginTop = '30px';

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
            deleteButton.style.backgroundColor = '#dc3545'; // 삭제 버튼 색상
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


            if (study.status === '모집 완료') {
                applyButton.textContent = '모집 완료';
                applyButton.disabled = true;
                applyButton.style.backgroundColor = '#6c757d'; // 회색으로 변경
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
        } else {
            document.getElementById('study-detail-content').innerHTML = '<h2>스터디를 찾을 수 없습니다.</h2><p>존재하지 않거나 삭제된 스터디입니다.</p>';
        }
    }
});
