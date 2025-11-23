// script.js - JavaScript functionalities will be added in the future.

document.addEventListener('DOMContentLoaded', () => {
    console.log('StudyBuddy website loaded.');

    // --- Data Management (Temporary) ---
    // Simple logic for data management without a real backend
    let studies = JSON.parse(localStorage.getItem('studies')) || [];
    let myCreatedLeaders = JSON.parse(localStorage.getItem('myCreatedLeaders')) || []; // List of study leader names created in this browser
    let currentLeader = localStorage.getItem('currentLeader') || null; // Leader name who last created or applied for a study (virtual user of this browser)

    // Unique ID for this browser (for identifying study applicants)
    let browserUserId = localStorage.getItem('browserUserId');
    if (!browserUserId) {
        browserUserId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('browserUserId', browserUserId);
    }

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

    // Initialize example studies (only if no studies exist in localStorage)
    if (studies.length === 0) {
        const exampleStudies = [
            { id: 'ex1', leader: 'Kim Min-jun', title: 'Python Basic Grammar Study', category: 'Coding', description: 'This is a Python basic study for programming beginners. It will be conducted online twice a week.', members: 5, currentMembersCount: 0, appliedMembers: [], method: 'Online', schedule: 'Mon, Wed 8 PM every week', deadline: '2025-12-31', status: 'Open for applications', createdAt: new Date().toISOString() },
            { id: 'ex2', leader: 'Lee Seo-yeon', title: 'TOEIC 900+ Target Study', category: 'Language', description: 'This is a practical problem-solving and error analysis study for high TOEIC scores. It will be conducted offline.', members: 3, currentMembersCount: 1, appliedMembers: ['Park Ji-hoon'], method: 'Offline', schedule: 'Sat 10 AM every week', deadline: '2025-11-30', status: 'Open for applications', createdAt: new Date().toISOString() },
            { id: 'ex3', leader: 'Park Ji-hoon', title: 'Mastering Modern JavaScript', category: 'Coding', description: 'This study covers ES6+ syntax and asynchronous programming. It uses a mixed online/offline method.', members: 7, currentMembersCount: 7, appliedMembers: ['Kim Min-jun','Lee Seo-yeon','Choi Yu-jin','Han Ah-reum','Jung Dae-hyun','Song Ji-eun','Kang Dong-won'], method: 'Hybrid', schedule: 'Tue 7 PM every week', deadline: '2026-01-15', status: 'Recruitment completed', createdAt: new Date().toISOString() },
            { id: 'ex4', leader: 'Choi Yu-jin', title: 'Drawing Basics & Portrait Drawing', category: 'Hobbies/Culture', description: 'This study improves drawing skills and teaches portrait drawing. Weekly offline meetings.', members: 4, currentMembersCount: 2, appliedMembers: ['Kim Min-jun','Lee Seo-yeon'], method: 'Offline', schedule: 'Sun 2 PM every week', deadline: '2025-12-10', status: 'Open for applications', createdAt: new Date().toISOString() }
        ];
        studies = exampleStudies; // 예시 스터디로 초기화
        saveStudies();
        saveMyCreatedLeaders(); // 초기화 시 빈 배열 저장

        // Add example study creation leaders to myCreatedLeaders (optional)
        // exampleStudies.forEach(s => {
        //     if (!myCreatedLeaders.includes(s.leader)) {
        //         myCreatedLeaders.push(s.leader);
        //     }
        // });
        // saveMyCreatedLeaders();
    }

    // --- Contact Form Submission Handling (Example) ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            console.log('Contact details:', { name, email, message });

            const formMessage = document.getElementById('form-message');
            formMessage.textContent = 'Thank you for your inquiry! We will reply as soon as possible.';
            contactForm.reset();
        });
    }

    // --- Main Page: Load Featured Studies ---
    const featuredStudiesGrid = document.querySelector('#featured-studies .study-grid');
    if (featuredStudiesGrid) {
        const featured = studies.slice(0, 3); 
        if (featured.length === 0) {
            featuredStudiesGrid.innerHTML = '<p>No studies have been created yet. Try creating a new study!</p>';
        } else {
            featured.forEach(study => {
                const studyCard = document.createElement('div');
                studyCard.classList.add('study-card');
                studyCard.innerHTML = `
                    <span class="category">${study.category}</span>
                    <h4><a href="study-detail.html?id=${study.id}">${study.title}</a></h4>
                    <p>Leader: ${study.leader}</p>
                    <p>Recruitment Status: ${study.currentMembersCount}/${study.members}</p>
                    <p>${study.description.substring(0, 100)}...</p>
                    <p class="status ${study.status === 'Recruitment completed' ? 'closed' : ''}">${study.status}</p>
                `;
                featuredStudiesGrid.appendChild(studyCard);
            });
        }
    }

    // --- Create Study Page: Form Submission Handling ---
    const createStudyForm = document.getElementById('create-study-form');
    if (createStudyForm) {
        createStudyForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const leaderName = document.getElementById('study-leader').value.trim();
            const isEditing = !!document.getElementById('create-study-form').dataset.editingId; // Check if in edit mode

            if (!leaderName) {
                alert('Please enter the study leader\'s name.');
                return;
            }
            
            const newStudyId = isEditing ? document.getElementById('create-study-form').dataset.editingId : `study_${Date.now()}`; // Generate new ID

            const newStudyData = {
                id: newStudyId,
                leader: leaderName,
                title: document.getElementById('study-title').value,
                category: document.getElementById('study-category').value,
                description: document.getElementById('study-description').value,
                members: parseInt(document.getElementById('study-members').value),
                currentMembersCount: isEditing ? studies.find(s => s.id === newStudyId).currentMembersCount : 0, // Retain existing value on edit, 0 on creation
                appliedMembers: isEditing ? studies.find(s => s.id === newStudyId).appliedMembers : [], // Retain existing value on edit, empty array on creation
                method: document.getElementById('study-method').value,
                schedule: document.getElementById('study-schedule').value,
                deadline: document.getElementById('study-deadline').value,
                status: 'Open for applications', // Initial status
                createdAt: new Date().toISOString()
            };

            // Automatic recruitment completion status update (on edit)
            if (newStudyData.currentMembersCount >= newStudyData.members) {
                newStudyData.status = 'Recruitment completed';
            } else {
                newStudyData.status = 'Open for applications';
            }

            if (isEditing) {
                // Update existing study
                const editingId = document.getElementById('create-study-form').dataset.editingId;
                studies = studies.map(s => (s.id === editingId ? { ...s, ...newStudyData } : s));
                alert('Study successfully updated!');
            } else {
                // Add new study
                studies.unshift(newStudyData); // Latest study at the top
                alert('New study successfully created!');
                if (!myCreatedLeaders.includes(leaderName)) {
                    myCreatedLeaders.push(leaderName);
                    saveMyCreatedLeaders();
                }
                saveCurrentLeader(leaderName); // Save the name of the last created leader
            }
            saveStudies();

            createStudyForm.reset();
            console.log('Processed study:', newStudyData);

            setTimeout(() => {
                window.location.href = 'my-studies.html'; // Redirect to My Studies page
            }, 1000);
        });

        // Fill form when accessing page in edit mode
        const urlParams = new URLSearchParams(window.location.search);
        const editStudyId = urlParams.get('editId');
        if (editStudyId) {
            const studyToEdit = studies.find(s => s.id === editStudyId);
            if (studyToEdit) {
                document.getElementById('study-leader').value = studyToEdit.leader;
                document.getElementById('study-leader').readOnly = true; // Leader name cannot be edited
                document.getElementById('study-title').value = studyToEdit.title;
                document.getElementById('study-category').value = studyToEdit.category;
                document.getElementById('study-description').value = studyToEdit.description;
                document.getElementById('study-members').value = studyToEdit.members;
                document.getElementById('study-method').value = studyToEdit.method;
                document.getElementById('study-schedule').value = studyToEdit.schedule;
                document.getElementById('study-deadline').value = studyToEdit.deadline;
                document.querySelector('#create-study-content h2').textContent = 'Edit Study';
                document.querySelector('#create-study-form button[type="submit"]').textContent = 'Save Changes';
                createStudyForm.dataset.editingId = editStudyId; // Indicate edit mode
            } else {
                alert('Could not find study to edit.');
                window.location.href = 'my-studies.html';
            }
        }
    }

    // --- Study List Page: Load and Filter Studies ---
    const allStudiesGrid = document.getElementById('all-studies-grid');
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const methodFilter = document.getElementById('method-filter');
    const statusFilter = document.getElementById('status-filter');
    const myStudiesFilter = document.getElementById('my-studies-filter'); // Add new filter
    const applyFiltersBtn = document.getElementById('apply-filters');

    function renderStudies(filteredStudies, targetGrid) {
        if (targetGrid) {
            targetGrid.innerHTML = ''; // Clear existing list
            if (filteredStudies.length === 0) {
                targetGrid.innerHTML = '<p style="text-align: center; margin-top: 20px; color: #555;">No studies match the criteria.</p>';
                return;
            }
            filteredStudies.forEach(study => {
                const studyCard = document.createElement('div');
                studyCard.classList.add('study-card');
                studyCard.innerHTML = `
                    <span class="category">${study.category}</span>
                    <h4><a href="study-detail.html?id=${study.id}">${study.title}</a></h4>
                    <p>Leader: ${study.leader}</p>
                    <p>Recruitment Status: ${study.currentMembersCount}/${study.members}</p>
                    <p>${study.description.substring(0, 100)}...</p>
                    <p class="status ${study.status === 'Recruitment completed' ? 'closed' : ''}">${study.status}</p>
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
        const selectedMyStudiesFilter = myStudiesFilter ? myStudiesFilter.value : 'all'; // New filter value

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

    // --- Study Detail Page: Load Info and Apply for Study ---
    if (window.location.pathname.includes('study-detail.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const studyId = urlParams.get('id'); 
        let study = studies.find(s => s.id === studyId); 

        if (study) {
            document.getElementById('detail-study-title').textContent = study.title;
            document.getElementById('detail-study-category').textContent = study.category;
            document.getElementById('detail-study-members').textContent = `${study.currentMembersCount}/${study.members} members`; 
            document.getElementById('detail-study-method').textContent = study.method;
            document.getElementById('detail-study-schedule').textContent = study.schedule || 'N/A';
            document.getElementById('detail-study-deadline').textContent = study.deadline || 'Always Recruiting';
            document.getElementById('detail-study-description').textContent = study.description;
            document.getElementById('detail-study-leader').textContent = study.leader; 

            const applyButton = document.getElementById('apply-for-study');
            const applyMessage = document.getElementById('apply-message');

            // --- Display Edit/Delete buttons if it's a study I created ---
            if (myCreatedLeaders.includes(study.leader)) { 
                applyButton.textContent = 'Edit';
                applyButton.style.backgroundColor = '#28a745'; 
                applyButton.style.borderColor = '#28a745';
                applyButton.onclick = () => {
                    window.location.href = `create-study.html?editId=${study.id}`;
                };

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.classList.add('btn'); 
                deleteButton.style.backgroundColor = '#dc3545'; 
                deleteButton.style.borderColor = '#dc3545';
                deleteButton.style.marginLeft = '10px';
                deleteButton.addEventListener('click', () => {
                    if (confirm('Are you sure you want to delete this study?')) {
                        studies = studies.filter(s => s.id !== study.id);
                        saveStudies();
                        alert('Study deleted.');
                        window.location.href = 'my-studies.html'; 
                    }
                });
                applyButton.parentNode.insertBefore(deleteButton, applyButton.nextSibling); 

            } else { // If it's a study created by someone else (or not by me)
                const isApplied = study.appliedMembers && study.appliedMembers.includes(browserUserId); // Using browserUserId

                if (study.status === 'Recruitment completed') {
                    applyButton.textContent = 'Recruitment completed';
                    applyButton.disabled = true;
                    applyButton.style.backgroundColor = '#6c757d'; 
                    applyMessage.textContent = 'This study has completed recruitment.';
                    applyMessage.style.color = '#dc3545';
                } else if (isApplied) {
                    applyButton.textContent = 'Application Complete';
                    applyButton.disabled = true;
                    applyButton.style.backgroundColor = '#6c757d';
                    applyMessage.textContent = 'You have already applied to join this study.';
                    applyMessage.style.color = 'green';
                } else {
                    applyButton.addEventListener('click', () => {
                        if (study.currentMembersCount >= study.members) {
                            alert('Recruitment is full. Please try another study!');
                            study.status = 'Recruitment completed';
                            saveStudies();
                            window.location.reload(); 
                            return;
                        }

                        alert(`Applying to join the ${study.title} study!`);
                        if (!study.appliedMembers) {
                            study.appliedMembers = [];
                        }
                        study.appliedMembers.push(browserUserId); // Using browserUserId
                        study.currentMembersCount++; 

                        if (study.currentMembersCount >= study.members) {
                            study.status = 'Recruitment completed';
                        }

                        saveStudies();

                        applyMessage.textContent = 'Application submitted. Please await leader\'s approval!';
                        applyMessage.style.color = 'green';
                        applyButton.disabled = true;
                        applyButton.textContent = 'Application Complete';
                        applyButton.style.backgroundColor = '#6c757d';
                        
                        document.getElementById('detail-study-members').textContent = `${study.currentMembersCount}/${study.members} members`;
                        if (study.status === 'Recruitment completed') {
                            document.getElementById('detail-study-members').style.color = '#dc3545';
                        }
                    });
                }
            }
        } else {
            document.getElementById('study-detail-content').innerHTML = '<h2>Study not found.</h2><p>The study does not exist or has been deleted.</p>';
        }
    }

    // --- My Studies Page: Load Studies I Created ---
    if (window.location.pathname.includes('my-studies.html')) {
        const myStudiesGrid = document.getElementById('my-studies-grid');
        const myStudiesMessage = document.getElementById('my-studies-message');
        const showCreatedBtn = document.getElementById('show-created');
        const showAppliedBtn = document.getElementById('show-applied');

        let currentMyStudiesView = 'created'; // Default: Studies I created

        function renderMyStudies() {
            let filteredMyStudies = [];
            if (currentMyStudiesView === 'created') {
                filteredMyStudies = studies.filter(study => myCreatedLeaders.includes(study.leader));
                myStudiesMessage.textContent = filteredMyStudies.length === 0 ? 'You haven\'t created any studies yet. Try creating a new one!' : '';
                document.getElementById('my-studies-title').textContent = 'Studies I Created';
            } else if (currentMyStudiesView === 'applied') {
                filteredMyStudies = studies.filter(study => study.appliedMembers.includes(browserUserId)); // Using browserUserId
                myStudiesMessage.textContent = filteredMyStudies.length === 0 ? 'You haven\'t applied for any studies yet. Try applying to other studies!' : '';
                document.getElementById('my-studies-title').textContent = 'Studies I Applied For';
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
                            <p>Leader: ${study.leader}</p>
                            <p>Recruitment Status: ${study.currentMembersCount}/${study.members}</p>
                            <p>${study.description.substring(0, 100)}...</p>
                            <p class="status ${study.status === 'Recruitment completed' ? 'closed' : ''}">${study.status}</p>
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

        renderMyStudies(); // Initial load
    }
});
