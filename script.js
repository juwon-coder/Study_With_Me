// script.js - 추후 JavaScript 기능을 추가할 예정입니다.

document.addEventListener('DOMContentLoaded', () => {
    console.log('StudyBuddy 웹사이트가 로드되었습니다.');

    // --- 데이터 관리 (임시) ---
    // 실제 백엔드 없이 데이터를 관리하기 위한 간단한 로직
    let studies = JSON.parse(localStorage.getItem('studies')) || [];
    let myCreatedLeaders = JSON.parse(localStorage.getItem('myCreatedLeaders')) || []; // 이 브라우저에서 개설한 스터디 리더명 목록
    let currentLeader = localStorage.getItem('currentLeader') || null; // 마지막으로 스터디를 개설하거나 신청한 리더명 (이 브라우저의 가상 사용자)

    function saveStudies() {
        localStorage.setItem('studies', JSON.stringify(studies));
    }

    function saveMyCreatedLeaders() {
        localStorage.setItem('myCreatedLeaders', JSON.stringify(myCreatedLeaders));
    }

    function saveCurrentLeader(leaderName) {
        localStorage.setItem('currentLeader', leaderName);
        currentLeader = leaderName;
    }

    // 예시 스터디 초기화 (localStorage에 스터디가 없을 때만)
    if (studies.length === 0) {
        const exampleStudies = [
            { id: 'ex1', leader: '김민준', title: '파이썬 기초 문법 스터디', category: '코딩', description: '프로그래밍 초보자를 위한 파이썬 기초 스터디입니다. 주 2회 온라인으로 진행됩니다.', members: 5, currentMembersCount: 0, appliedMembers: [], method: '온라인', schedule: '매주 월,수 저녁 8시', deadline: '2025-12-31', status: '모집 중', createdAt: new Date().toISOString() },
            { id: 'ex2', leader: '이서연', title: '토익 900+ 목표 스터디', category: '어학', description: '토익 고득점을 위한 실전 문제 풀이 및 오답 분석 스터디입니다. 오프라인으로 진행됩니다.', members: 3, currentMembersCount: 1, appliedMembers: ['박지훈'], method: '오프라인', schedule: '매주 토요일 오전 10시', deadline: '2025-11-30', status: '모집 중', createdAt: new Date().toISOString() },
            { id: 'ex3', leader: '박지훈', title: '모던 자바스크립트 완전 정복', category: '코딩', description: 'ES6+ 문법과 비동기 프로그래밍을 학습하는 스터디입니다. 온라인 혼합 방식입니다.', members: 7, currentMembersCount: 7, appliedMembers: ['김민준','이서연','최유진','한아름','정대현','송지은','강동원'], method: '혼합', schedule: '매주 화요일 저녁 7시', deadline: '2026-01-15', status: '모집 완료', createdAt: new Date().toISOString() },
            { id: 'ex4', leader: '최유진', title: '드로잉 기초 & 인물화', category: '취미/교양', description: '드로잉 실력을 향상시키고 인물화를 배우는 스터디입니다. 매주 오프라인 모임.', members: 4, currentMembersCount: 2, appliedMembers: ['김민준','이서연'], method: '오프라인', schedule: '매주 일요일 오후 2시', deadline: '2025-12-10', status: '모집 중', createdAt: new Date().toISOString() }
        ];
        studies = exampleStudies; // 예시 스터디로 초기화
        saveStudies();
        saveMyCreatedLeaders(); // 초기화 시 빈 배열 저장

        // 예시 스터디 개설 리더들을 myCreatedLeaders에 추가 (선택적)
        // exampleStudies.forEach(s => {
        //     if (!myCreatedLeaders.includes(s.leader)) {
        //         myCreatedLeaders.push(s.leader);
        //     }
        // });
        // saveMyCreatedLeaders();
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
                    <p>모집현황: ${study.currentMembersCount}/${study.members}</p>
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
                currentMembersCount: isEditing ? studies.find(s => s.id === newStudyId).currentMembersCount : 0, // 수정 시 기존 값 유지, 개설 시 0
                appliedMembers: isEditing ? studies.find(s => s.id === newStudyId).appliedMembers : [], // 수정 시 기존 값 유지, 개설 시 빈 배열
                method: document.getElementById('study-method').value,
                schedule: document.getElementById('study-schedule').value,
                deadline: document.getElementById('study-deadline').value,
                status: '모집 중', // 초기 상태
                createdAt: new Date().toISOString()
            };

            // 모집 완료 상태 자동 업데이트 (수정 시)
            if (newStudyData.currentMembersCount >= newStudyData.members) {
                newStudyData.status = '모집 완료';
            } else {
                newStudyData.status = '모집 중';
            }

            if (isEditing) {
                // 기존 스터디 업데이트
                const editingId = document.getElementById('create-study-form').dataset.editingId;
                studies = studies.map(s => (s.id === editingId ? { ...s, ...newStudyData } : s));
                alert('스터디가 성공적으로 수정되었습니다!');
            } else {
                // 새로운 스터디 추가
                studies.unshift(newStudyData); // 최신 스터디가 맨 위에 오도록
                alert('새로운 스터디가 성공적으로 개설되었습니다!');
                if (!myCreatedLeaders.includes(leaderName)) {
                    myCreatedLeaders.push(leaderName);
                    saveMyCreatedLeaders();
                }
                saveCurrentLeader(leaderName); // 마지막으로 개설한 리더명 저장
            }
            saveStudies();

            createStudyForm.reset();
            console.log('처리된 스터디:', newStudyData);

            setTimeout(() => {
                window.location.href = 'my-studies.html'; // 내 스터디 페이지로 이동
            }, 1000);
        });

        // 수정 모드로 페이지 접근 시 폼 채우기
        const urlParams = new URLSearchParams(window.location.search);
        const editStudyId = urlParams.get('editId');
        if (editStudyId) {
            const studyToEdit = studies.find(s => s.id === editStudyId);
            if (studyToEdit) {
                document.getElementById('study-leader').value = studyToEdit.leader;
                document.getElementById('study-leader').readOnly = true; // 리더명은 수정 불가
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
                window.location.href = 'my-studies.html';
            }
        }
    }

    // --- 스터디 목록 페이지: 스터디 로드 및 필터링 ---
    const allStudiesGrid = document.getElementById('all-studies-grid');
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const methodFilter = document.getElementById('method-filter');
    const statusFilter = document.getElementById('status-filter');
    const myStudiesFilter = document.getElementById('my-studies-filter'); // 새로운 필터 추가
    const applyFiltersBtn = document.getElementById('apply-filters');

    function renderStudies(filteredStudies, targetGrid) {
        if (targetGrid) {
            targetGrid.innerHTML = ''; // 기존 목록 초기화
            if (filteredStudies.length === 0) {
                targetGrid.innerHTML = '<p style="text-align: center; margin-top: 20px; color: #555;">조건에 맞는 스터디가 없습니다.</p>';
                return;
            }
            filteredStudies.forEach(study => {
                const studyCard = document.createElement('div');
                studyCard.classList.add('study-card');
                studyCard.innerHTML = `
                    <span class="category">${study.category}</span>
                    <h4><a href="study-detail.html?id=${study.id}">${study.title}</a></h4>
                    <p>리더: ${study.leader}</p>
                    <p>모집현황: ${study.currentMembersCount}/${study.members}</p>
                    <p>${study.description.substring(0, 100)}...</p>
                    <p class="status ${study.status === '모집 완료' ? 'closed' : ''}">${study.status}</p>
                `;
                targetGrid.appendChild(studyCard);
            });
        }
    }

    function applyFilters() {
        let filtered = [...studies];

        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
        const selectedMethod = methodFilter ? methodFilter.value : 'all';
        const selectedStatus = statusFilter ? statusFilter.value : 'all';
        const selectedMyStudiesFilter = myStudiesFilter ? myStudiesFilter.value : 'all'; // 새로운 필터 값

        if (searchTerm) {
            filtered = filtered.filter(study =>
                study.title.toLowerCase().includes(searchTerm) ||
                study.description.toLowerCase().includes(searchTerm) ||
                study.leader.toLowerCase().includes(searchTerm) 
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

        if (selectedMyStudiesFilter === 'my-created') {
            filtered = filtered.filter(study => myCreatedLeaders.includes(study.leader));
        }

        renderStudies(filtered, allStudiesGrid); 
    }

    if (window.location.pathname.includes('study-list.html')) {
        renderStudies(studies, allStudiesGrid); 
        applyFiltersBtn?.addEventListener('click', applyFilters);
        searchInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                applyFilters();
            }
        });
    }

    // --- 스터디 상세 페이지: 정보 로드 및 참여 신청 ---
    if (window.location.pathname.includes('study-detail.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const studyId = urlParams.get('id'); 
        let study = studies.find(s => s.id === studyId); 

        if (study) {
            document.getElementById('detail-study-title').textContent = study.title;
            document.getElementById('detail-study-category').textContent = study.category;
            document.getElementById('detail-study-members').textContent = `${study.currentMembersCount}/${study.members}명`; 
            document.getElementById('detail-study-method').textContent = study.method;
            document.getElementById('detail-study-schedule').textContent = study.schedule || '정보 없음';
            document.getElementById('detail-study-deadline').textContent = study.deadline || '상시 모집';
            document.getElementById('detail-study-description').textContent = study.description;
            document.getElementById('detail-study-leader').textContent = study.leader; 

            const applyButton = document.getElementById('apply-for-study');
            const applyMessage = document.getElementById('apply-message');

            // --- 내가 개설한 스터디일 경우 수정/삭제 버튼 표시 ---
            if (myCreatedLeaders.includes(study.leader)) { 
                applyButton.textContent = '수정하기';
                applyButton.style.backgroundColor = '#28a745'; 
                applyButton.style.borderColor = '#28a745';
                applyButton.onclick = () => {
                    window.location.href = `create-study.html?editId=${study.id}`;
                };

                const deleteButton = document.createElement('button');
                deleteButton.textContent = '삭제하기';
                deleteButton.classList.add('btn'); 
                deleteButton.style.backgroundColor = '#dc3545'; 
                deleteButton.style.borderColor = '#dc3545';
                deleteButton.style.marginLeft = '10px';
                deleteButton.addEventListener('click', () => {
                    if (confirm('정말로 이 스터디를 삭제하시겠습니까?')) {
                        studies = studies.filter(s => s.id !== study.id);
                        saveStudies();
                        alert('스터디가 삭제되었습니다.');
                        window.location.href = 'my-studies.html'; 
                    }
                });
                applyButton.parentNode.insertBefore(deleteButton, applyButton.nextSibling); 

            } else { // 다른 사람이 개설한 스터디일 경우 (또는 내가 개설한 스터디가 아닌 경우)
                const isApplied = study.appliedMembers && study.appliedMembers.includes(currentLeader);

                if (study.status === '모집 완료') {
                    applyButton.textContent = '모집 완료';
                    applyButton.disabled = true;
                    applyButton.style.backgroundColor = '#6c757d'; 
                    applyMessage.textContent = '이 스터디는 현재 모집이 완료되었습니다.';
                    applyMessage.style.color = '#dc3545';
                } else if (isApplied) {
                    applyButton.textContent = '신청 완료';
                    applyButton.disabled = true;
                    applyButton.style.backgroundColor = '#6c757d';
                    applyMessage.textContent = '이미 이 스터디에 참여 신청을 완료했습니다.';
                    applyMessage.style.color = 'green';
                } else {
                    applyButton.addEventListener('click', () => {
                        if (study.currentMembersCount >= study.members) {
                            alert('모집 인원이 가득 찼습니다. 다음 스터디를 이용해주세요!');
                            study.status = '모집 완료';
                            saveStudies();
                            window.location.reload(); 
                            return;
                        }

                        alert(`${study.title} 스터디에 참여를 신청합니다!`);
                        if (!study.appliedMembers) {
                            study.appliedMembers = [];
                        }
                        study.appliedMembers.push(currentLeader); 
                        study.currentMembersCount++; 

                        if (study.currentMembersCount >= study.members) {
                            study.status = '모집 완료';
                        }

                        saveStudies();

                        applyMessage.textContent = '참여 신청이 완료되었습니다. 리더의 승인을 기다려주세요!';
                        applyMessage.style.color = 'green';
                        applyButton.disabled = true;
                        applyButton.textContent = '신청 완료';
                        applyButton.style.backgroundColor = '#6c757d';
                        
                        document.getElementById('detail-study-members').textContent = `${study.currentMembersCount}/${study.members}명`;
                        if (study.status === '모집 완료') {
                            document.getElementById('detail-study-members').style.color = '#dc3545';
                        }
                    });
                }
            }
        } else {
            document.getElementById('study-detail-content').innerHTML = '<h2>스터디를 찾을 수 없습니다.</h2><p>존재하지 않거나 삭제된 스터디입니다.</p>';
        }
    }

    // --- 내 스터디 페이지: 내가 개설한 스터디 로드 ---
    if (window.location.pathname.includes('my-studies.html')) {
        const myStudiesGrid = document.getElementById('my-studies-grid');
        const myStudiesMessage = document.getElementById('my-studies-message');
        const showCreatedBtn = document.getElementById('show-created');
        const showAppliedBtn = document.getElementById('show-applied');

        let currentMyStudiesView = 'created'; // 기본값: 내가 개설한 스터디

        function renderMyStudies() {
            let filteredMyStudies = [];
            if (currentMyStudiesView === 'created') {
                filteredMyStudies = studies.filter(study => myCreatedLeaders.includes(study.leader));
                myStudiesMessage.textContent = filteredMyStudies.length === 0 ? '아직 개설한 스터디가 없습니다. 새로운 스터디를 개설해보세요!' : '';
                document.getElementById('my-studies-title').textContent = '내가 개설한 스터디';
            } else if (currentMyStudiesView === 'applied') {
                filteredMyStudies = studies.filter(study => study.appliedMembers.includes(currentLeader));
                myStudiesMessage.textContent = filteredMyStudies.length === 0 ? '아직 신청한 스터디가 없습니다. 다른 스터디에 참여 신청을 해보세요!' : '';
                document.getElementById('my-studies-title').textContent = '내가 신청한 스터디';
            }

            if (myStudiesGrid) {
                myStudiesGrid.innerHTML = ''; 
                if (filteredMyStudies.length === 0) {
                    myStudiesGrid.style.display = 'none';
                } else {
                    myStudiesGrid.style.display = 'grid';
                    filteredMyStudies.forEach(study => {
                        const studyCard = document.createElement('div');
                        studyCard.classList.add('study-card');
                        studyCard.innerHTML = `
                            <span class="category">${study.category}</span>
                            <h4><a href="study-detail.html?id=${study.id}">${study.title}</a></h4>
                            <p>리더: ${study.leader}</p>
                            <p>모집현황: ${study.currentMembersCount}/${study.members}</p>
                            <p>${study.description.substring(0, 100)}...</p>
                            <p class="status ${study.status === '모집 완료' ? 'closed' : ''}">${study.status}</p>
                        `;
                        myStudiesGrid.appendChild(studyCard);
                    });
                }
            }
        }

        showCreatedBtn?.addEventListener('click', () => {
            currentMyStudiesView = 'created';
            showCreatedBtn.classList.add('active');
            showAppliedBtn.classList.remove('active');
            renderMyStudies();
        });

        showAppliedBtn?.addEventListener('click', () => {
            currentMyStudiesView = 'applied';
            showAppliedBtn.classList.add('active');
            showCreatedBtn.classList.remove('active');
            renderMyStudies();
        });

        renderMyStudies(); // 초기 로드
    }
});
