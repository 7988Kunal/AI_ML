import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
        import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

        // 1. Firebase Config
        const firebaseConfig = {
            apiKey: "AIzaSyAz-yo7PmFo0eFyzfjQwCP3yiB5GqqpTp0",
            authDomain: "studentdashboard-681a8.firebaseapp.com",
            databaseURL: "https://studentdashboard-681a8-default-rtdb.firebaseio.com",
            projectId: "studentdashboard-681a8",
            storageBucket: "studentdashboard-681a8.appspot.com",
            messagingSenderId: "171483691299",
            appId: "1:171483691299:web:f2bc4e00b696c55b4cf496"
        };
        const app = initializeApp(firebaseConfig);
        const db = getDatabase(app);

        // 2. Real-Time Clock & Last Modified
        setInterval(() => {
            const now = new Date();
            const opts = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
            document.getElementById('real-time-clock').innerHTML = `<i class="fa-regular fa-clock"></i> ${now.toLocaleString('en-US', opts)}`;
        }, 1000);
        document.getElementById('last-mod').innerText = new Date(document.lastModified).toLocaleDateString();

       // 3. UI Controls
        document.getElementById('mobile-menu').onclick = () => {
            document.getElementById('nav-links').classList.toggle('active');
            const icon = document.querySelector('#mobile-menu i');
            icon.classList.toggle('fa-bars-staggered');
            icon.classList.toggle('fa-xmark');
        };

        // Close mobile menu when a link is clicked
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                document.getElementById('nav-links').classList.remove('active');
                const icon = document.querySelector('#mobile-menu i');
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars-staggered');
            });
        });

        /*document.getElementById('theme-toggle').onclick = () => {
            document.body.classList.toggle('dark-theme');
            const icon = document.querySelector('#theme-toggle i');
            if(document.body.classList.contains('dark-theme')){
                icon.classList.replace('fa-moon', 'fa-sun');
            } else {
                icon.classList.replace('fa-sun', 'fa-moon');
            }
        };*/
        const themeToggle = document.getElementById('theme-toggle');

if(localStorage.getItem('theme') === 'dark'){
    document.body.classList.add('dark-theme');
    document.querySelector('#theme-toggle i')
      .classList.replace('fa-moon','fa-sun');
}

themeToggle.onclick = () => {
    document.body.classList.toggle('dark-theme');

    if(document.body.classList.contains('dark-theme')){
        localStorage.setItem('theme','dark');
        document.querySelector('#theme-toggle i')
          .classList.replace('fa-moon','fa-sun');
    } else {
        localStorage.setItem('theme','light');
        document.querySelector('#theme-toggle i')
          .classList.replace('fa-sun','fa-moon');
    }
};

        let currentSize = 16;
        document.getElementById('font-inc').onclick = () => {
            if(currentSize < 22) { currentSize += 2; document.documentElement.style.setProperty('--base-size', currentSize + 'px'); }
        };
        document.getElementById('font-dec').onclick = () => {
            if(currentSize > 12) { currentSize -= 2; document.documentElement.style.setProperty('--base-size', currentSize + 'px'); }
        };

        // 4. YouTube Search
        document.getElementById('yt-btn').onclick = () => {
            let q = document.getElementById('yt-input').value;
            if(q.trim()) window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`, '_blank');
        };

        // 5. Form Submit (No Reload)
       /* document.getElementById('feedback-form').onsubmit = (e) => {
            e.preventDefault();
            alert("Feedback submitted successfully!");
            e.target.reset();
        };*/
        document.getElementById('feedback-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.querySelector('input[placeholder="Your Full Name"]').value;
    const roll = document.querySelector('input[placeholder="University Roll No."]').value;
    const feedback = document.querySelector('textarea').value;

    try {
        const response = await fetch('https://formspree.io/f/xeoanplj', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                roll: roll,
                message: feedback
            })
        });

        if (response.ok) {
            alert('Feedback sent successfully!');
            e.target.reset();
        } else {
            alert('Failed to send feedback.');
        }
    } catch (error) {
        alert('Network error. Please try again.');
    }
});

        // 6. Time Locked Exam Logic (Unlocks on Nov 15, 2026)
        const unlockDate = new Date("2026-11-15T10:00:00").getTime();
        const examContent = document.getElementById('exam-content');
        
        if(new Date().getTime() >= unlockDate) {
            examContent.innerHTML = `
                <ul class="item-list">
                    <li><div><div class="item-title">Dec 01, 2026</div><div class="item-sub">Machine Learning (CS-501)</div></div></li>
                    <li><div><div class="item-title">Dec 05, 2026</div><div class="item-sub">Deep Learning (CS-502)</div></div></li>
                </ul>`;
        } else {
            examContent.innerHTML = `
                <div class="locked-state">
                    <i class="fa-solid fa-lock"></i>
                    <h3>Schedule Locked</h3>
                    <p style="font-size: 0.85rem; color: var(--text-secondary);">The semester datesheet will reveal in <strong>Dec, 2026</strong>.</p>
                </div>`;
        }

        // 7. Secure Visitor Tracking & IP (Using LocalStorage)
        async function runTracking() {
            try {
                const ipRes = await fetch('https://api.ipify.org?format=json');
                const ip = (await ipRes.json()).ip;
                document.getElementById('ip-address').innerText = ip;

                const counterRef = ref(db, 'v3_modern_portal/visitor_count');
                const hasVisited = localStorage.getItem('aiml_v3_visited');

                if (!hasVisited) {
                    get(counterRef).then(snapshot => {
                        let count = snapshot.exists() ? snapshot.val() + 1 : 1;
                        set(counterRef, count);
                        document.getElementById('visitor-count').innerText = count;
                        
                        localStorage.setItem('aiml_v3_visited', 'true'); 
                        set(ref(db, `v3_modern_portal/ips/${ip.replace(/\./g, '_')}`), new Date().toISOString());
                    });
                } else {
                    get(counterRef).then(snapshot => {
                        document.getElementById('visitor-count').innerText = snapshot.exists() ? snapshot.val() : 0;
                    });
                }
            } catch(e) {
                document.getElementById('visitor-count').innerText = "Offline";
            }
        }
        runTracking();