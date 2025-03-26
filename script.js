// الأسئلة المضمنة في الكود
const questions = [
    {
        question: "ما هي عاصمة المملكة العربية السعودية؟",
        answers: ["الرياض", "جدة", "مكة المكرمة", "الدمام"],
        correct: 0
    },
    {
        question: "كم عدد أيام الأسبوع؟",
        answers: ["5 أيام", "6 أيام", "7 أيام", "8 أيام"],
        correct: 2
    },
    {
        question: "ما هو الكوكب الأحمر في نظامنا الشمسي؟",
        answers: ["الزهرة", "المريخ", "المشتري", "زحل"],
        correct: 1
    },
    {
        question: "ما هي لغة البرمجة المستخدمة في هذه اللعبة؟",
        answers: ["بايثون", "جافا", "جافا سكريبت", "سي++"],
        correct: 2
    },
    {
        question: "ما هو أصغر عدد أولي؟",
        answers: ["0", "1", "2", "3"],
        correct: 2
    },
    {
        question: "ما هي عاصمة مصر؟",
        answers: ["الإسكندرية", "القاهرة", "الجيزة", "بورسعيد"],
        correct: 1
    },
    {
        question: "كم عدد أحرف اللغة العربية؟",
        answers: ["26", "28", "30", "32"],
        correct: 1
    },
    {
        question: "ما هو الحيوان الذي يسمى سفينة الصحراء؟",
        answers: ["الحصان", "الجمل", "الفيل", "الزرافة"],
        correct: 1
    },
    {
        question: "ما هو أطول نهر في العالم؟",
        answers: ["النيل", "الأمازون", "الميسيسيبي", "الدانوب"],
        correct: 1
    },
    {
        question: "ما هي العملة الرسمية لليابان؟",
        answers: ["الدولار", "اليورو", "الين", "الجنيه"],
        correct: 2
    }
];

// كلمة المرور للحذف
const DELETE_PASSWORD = "00000";

// رابط ملف النتائج على GitHub (استبدل بمعلومات مشروعك)
const GITHUB_LEADERBOARD_URL = 'https://raw.githubusercontent.com/[username]/[repo]/main/leaderboard.json';

// حالة اللعبة
const gameState = {
    currentScreen: 'main-menu',
    score: 0,
    currentQuestionIndex: 0,
    correctAnswers: 0,
    streak: 0,
    gameQuestions: [],
    leaderboard: [],
    playerName: localStorage.getItem('playerName') || 'لاعب',
    soundEnabled: true,
    selectedTheme: localStorage.getItem('theme') || 'default'
};

// عناصر الواجهة
const elements = {
    screens: {
        'main-menu': document.getElementById('main-menu'),
        'settings-screen': document.getElementById('settings-screen'),
        'quiz-screen': document.getElementById('quiz-screen'),
        'results-screen': document.getElementById('results-screen'),
        'leaderboard-screen': document.getElementById('leaderboard-screen')
    },
    buttons: {
        startGame: document.getElementById('start-game'),
        settings: document.getElementById('settings-btn'),
        leaderboard: document.getElementById('leaderboard-btn'),
        next: document.getElementById('next-btn'),
        quit: document.getElementById('quit-btn'),
        saveScore: document.getElementById('save-score-btn'),
        playAgain: document.getElementById('play-again-btn'),
        settingsBack: document.getElementById('settings-back-btn'),
        resultsBack: document.getElementById('results-back-btn'),
        leaderboardBack: document.getElementById('leaderboard-back-btn'),
        deleteScore: document.getElementById('delete-score-btn'),
        confirmDelete: document.getElementById('confirm-delete-btn'),
        cancelDelete: document.getElementById('cancel-delete-btn')
    },
    quizElements: {
        questionText: document.getElementById('question-text'),
        answersContainer: document.getElementById('answers-container'),
        resultMessage: document.getElementById('result-message'),
        score: document.getElementById('score'),
        questionCount: document.getElementById('question-count'),
        streak: document.getElementById('streak'),
        progressBar: document.getElementById('progress-bar')
    },
    resultsElements: {
        finalScore: document.getElementById('final-score'),
        correctAnswers: document.getElementById('correct-answers'),
        finalProgress: document.getElementById('final-progress'),
        performanceComment: document.getElementById('performance-comment')
    },
    leaderboardElements: {
        leaderboardList: document.getElementById('leaderboard-list'),
        deleteSection: document.getElementById('delete-section'),
        deletePassword: document.getElementById('delete-password')
    },
    audio: {
        correct: document.getElementById('correct-sound'),
        wrong: document.getElementById('wrong-sound'),
        background: document.getElementById('background-music')
    },
    soundToggle: document.getElementById('sound-toggle'),
    themeOptions: document.querySelectorAll('.theme-option')
};

// تهيئة اللعبة
async function initGame() {
    loadSettings();
    setupEventListeners();
    await loadLeaderboard();
    playBackgroundMusic();
    console.log('تم تهيئة اللعبة بنجاح');
}

// تحميل الإعدادات
function loadSettings() {
    if (localStorage.getItem('soundEnabled') !== null) {
        gameState.soundEnabled = localStorage.getItem('soundEnabled') === 'true';
    }
    updateSoundButton();

    if (localStorage.getItem('theme')) {
        changeTheme(localStorage.getItem('theme'));
    }
}

// تحميل لوحة الصدارة
async function loadLeaderboard() {
    try {
        // جلب النتائج من GitHub
        const response = await fetch(GITHUB_LEADERBOARD_URL);
        if (!response.ok) throw new Error('Failed to fetch leaderboard');
        const githubLeaderboard = await response.json();
        
        // جلب النتائج المحلية
        const localLeaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
        
        // دمج النتائج مع إزالة التكرارات
        const combinedLeaderboard = [...githubLeaderboard, ...localLeaderboard];
        combinedLeaderboard.sort((a, b) => b.score - a.score);
        
        // إزالة التكرارات بناءً على الاسم والنتيجة
        const uniqueLeaderboard = combinedLeaderboard.filter((item, index, self) =>
            index === self.findIndex(t => 
                t.name === item.name && t.score === item.score
            )
        );
        
        gameState.leaderboard = uniqueLeaderboard.slice(0, 10);
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        // استخدام النتائج المحلية فقط في حالة الخطأ
        gameState.leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    }
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    // التنقل بين الشاشات
    elements.buttons.startGame.addEventListener('click', startGame);
    elements.buttons.settings.addEventListener('click', () => showScreen('settings-screen'));
    elements.buttons.leaderboard.addEventListener('click', () => showScreen('leaderboard-screen'));
    elements.buttons.next.addEventListener('click', nextQuestion);
    
    // أزرار الرجوع والخروج
    elements.buttons.quit.addEventListener('click', () => showScreen('main-menu'));
    elements.buttons.settingsBack.addEventListener('click', () => showScreen('main-menu'));
    elements.buttons.resultsBack.addEventListener('click', () => showScreen('main-menu'));
    elements.buttons.leaderboardBack.addEventListener('click', () => showScreen('main-menu'));
    
    // أحداث أخرى
    elements.buttons.saveScore.addEventListener('click', saveScore);
    elements.buttons.playAgain.addEventListener('click', restartGame);
    
    // أحداث الحذف
    elements.buttons.deleteScore.addEventListener('click', showDeleteSection);
    elements.buttons.confirmDelete.addEventListener('click', confirmDeleteScore);
    elements.buttons.cancelDelete.addEventListener('click', hideDeleteSection);
    
    // تغيير المظهر
    elements.themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            const theme = option.dataset.theme;
            changeTheme(theme);
        });
    });
    
    // التحكم في الصوت
    elements.soundToggle.addEventListener('click', toggleSound);
    
    console.log('تم إعداد مستمعي الأحداث بنجاح');
}

// عرض قسم الحذف
function showDeleteSection() {
    if (gameState.leaderboard.length === 0) {
        alert('لا توجد نتائج مسجلة للحذف');
        return;
    }
    elements.leaderboardElements.deleteSection.style.display = 'block';
}

// إخفاء قسم الحذف
function hideDeleteSection() {
    elements.leaderboardElements.deleteSection.style.display = 'none';
    elements.leaderboardElements.deletePassword.value = '';
}

// تأكيد حذف النتيجة
async function confirmDeleteScore() {
    const password = elements.leaderboardElements.deletePassword.value;
    if (password !== DELETE_PASSWORD) {
        alert('كلمة المرور غير صحيحة');
        return;
    }

    const playerName = prompt('أدخل اسم اللاعب الذي تريد حذف نتيجته:');
    if (playerName && playerName.trim() !== '') {
        const index = gameState.leaderboard.findIndex(item => 
            item.name.toLowerCase() === playerName.toLowerCase());
        
        if (index !== -1) {
            await deleteScore(index);
        } else {
            alert('لا توجد نتيجة مسجلة لهذا اللاعب');
        }
    }
    hideDeleteSection();
}

// حذف النتيجة من القائمة
async function deleteScore(index) {
    if (confirm(`هل أنت متأكد من حذف نتيجة ${gameState.leaderboard[index].name}؟`)) {
        gameState.leaderboard.splice(index, 1);
        localStorage.setItem('leaderboard', JSON.stringify(gameState.leaderboard));
        await updateLeaderboard();
        alert('تم حذف النتيجة بنجاح');
    }
}

// تغيير الشاشة المعروضة
function showScreen(screenId) {
    console.log('محاولة عرض الشاشة:', screenId);
    
    // إخفاء جميع الشاشات
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // إظهار الشاشة المطلوبة
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        gameState.currentScreen = screenId;
        console.log('تم عرض الشاشة بنجاح:', screenId);
        
        // إيقاف الموسيقى إذا عدنا للقائمة الرئيسية
        if (screenId === 'main-menu') {
            stopBackgroundMusic();
        }
        
        // تحديث قائمة المتصدرين عند عرضها
        if (screenId === 'leaderboard-screen') {
            updateLeaderboard();
        }
    } else {
        console.error('لم يتم العثور على الشاشة:', screenId);
    }
}

// بدء اللعبة
function startGame() {
    gameState.score = 0;
    gameState.currentQuestionIndex = 0;
    gameState.correctAnswers = 0;
    gameState.streak = 0;
    
    gameState.gameQuestions = [...questions];
    shuffleArray(gameState.gameQuestions);
    
    showScreen('quiz-screen');
    showQuestion();
}

// عرض السؤال الحالي
function showQuestion() {
    if (gameState.currentQuestionIndex >= gameState.gameQuestions.length) {
        endGame();
        return;
    }
    
    const question = gameState.gameQuestions[gameState.currentQuestionIndex];
    elements.quizElements.questionText.textContent = question.question;
    elements.quizElements.answersContainer.innerHTML = '';
    
    question.answers.forEach((answer, index) => {
        const answerBtn = document.createElement('div');
        answerBtn.className = 'answer-btn';
        answerBtn.textContent = answer;
        answerBtn.dataset.correct = index === question.correct;
        answerBtn.addEventListener('click', () => selectAnswer(answerBtn));
        elements.quizElements.answersContainer.appendChild(answerBtn);
    });
    
    elements.quizElements.questionCount.textContent = `${gameState.currentQuestionIndex + 1}/${gameState.gameQuestions.length}`;
    elements.quizElements.progressBar.style.width = `${(gameState.currentQuestionIndex / gameState.gameQuestions.length) * 100}%`;
    elements.quizElements.score.textContent = gameState.score;
    elements.quizElements.streak.textContent = gameState.streak;
    elements.quizElements.resultMessage.textContent = '';
    elements.buttons.next.disabled = true;
}

// اختيار إجابة
function selectAnswer(selectedBtn) {
    if (selectedBtn.classList.contains('selected')) return;
    selectedBtn.classList.add('selected');
    
    const isCorrect = selectedBtn.dataset.correct === 'true';
    const answerBtns = elements.quizElements.answersContainer.querySelectorAll('.answer-btn');
    
    answerBtns.forEach(btn => {
        btn.style.pointerEvents = 'none';
        if (btn.dataset.correct === 'true') {
            btn.classList.add('correct');
        } else if (btn === selectedBtn && !isCorrect) {
            btn.classList.add('wrong');
        }
    });
    
    if (gameState.soundEnabled) {
        if (isCorrect) {
            elements.audio.correct.currentTime = 0;
            elements.audio.correct.play().catch(e => console.log("Error playing sound:", e));
        } else {
            elements.audio.wrong.currentTime = 0;
            elements.audio.wrong.play().catch(e => console.log("Error playing sound:", e));
        }
    }
    
    if (isCorrect) {
        gameState.correctAnswers++;
        gameState.streak++;
        const points = 10 * Math.min(gameState.streak, 5);
        gameState.score += points;
        elements.quizElements.resultMessage.textContent = `إجابة صحيحة! +${points} نقطة`;
        elements.quizElements.resultMessage.style.color = '#4CAF50';
    } else {
        gameState.streak = 0;
        elements.quizElements.resultMessage.textContent = 'إجابة خاطئة!';
        elements.quizElements.resultMessage.style.color = '#f44336';
    }
    
    elements.quizElements.score.textContent = gameState.score;
    elements.quizElements.streak.textContent = gameState.streak;
    elements.buttons.next.disabled = false;
}

// الانتقال إلى السؤال التالي
function nextQuestion() {
    gameState.currentQuestionIndex++;
    showQuestion();
}

// انتهاء اللعبة
function endGame() {
    showScreen('results-screen');
    
    elements.resultsElements.finalScore.textContent = gameState.score;
    elements.resultsElements.correctAnswers.textContent = `${gameState.correctAnswers}/${gameState.gameQuestions.length}`;
    
    const percentage = (gameState.correctAnswers / gameState.gameQuestions.length) * 100;
    elements.resultsElements.finalProgress.style.width = `${percentage}%`;
    
    let comment = '';
    if (percentage >= 90) comment = 'أداء رائع! أنت خبير في هذا المجال!';
    else if (percentage >= 70) comment = 'عمل جيد! لديك معرفة قوية.';
    else if (percentage >= 50) comment = 'ليس سيئاً! يمكنك التحسن بالممارسة.';
    else comment = 'حاول مرة أخرى! الممارسة تصنع الفرق.';
    
    elements.resultsElements.performanceComment.textContent = comment;
}

// إعادة اللعبة
function restartGame() {
    startGame();
}

// حفظ النتيجة
async function saveScore() {
    const playerName = prompt('أدخل اسمك لحفظ النتيجة:', gameState.playerName);
    
    if (playerName && playerName.trim() !== '') {
        gameState.playerName = playerName.trim();
        localStorage.setItem('playerName', gameState.playerName);
        
        const scoreEntry = {
            name: gameState.playerName,
            score: gameState.score,
            correct: gameState.correctAnswers,
            total: gameState.gameQuestions.length,
            date: new Date().toLocaleDateString()
        };
        
        // حفظ النتيجة محلياً
        const localLeaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
        localLeaderboard.push(scoreEntry);
        localStorage.setItem('leaderboard', JSON.stringify(localLeaderboard));
        
        // محاولة حفظ النتيجة على GitHub (هذه تحتاج إلى تطبيق أكثر تعقيداً)
        try {
            // هنا يمكنك إضافة كود لإرسال النتيجة إلى GitHub API
            console.log('Score would be saved to GitHub:', scoreEntry);
        } catch (error) {
            console.error('Error saving score to GitHub:', error);
        }
        
        alert('تم حفظ نتيجتك بنجاح!');
        await loadLeaderboard();
        showScreen('leaderboard-screen');
    }
}

// تحديث قائمة المتصدرين
async function updateLeaderboard() {
    elements.leaderboardElements.leaderboardList.innerHTML = '<p>جاري تحميل النتائج...</p>';
    
    try {
        await loadLeaderboard();
        
        if (gameState.leaderboard.length === 0) {
            elements.leaderboardElements.leaderboardList.innerHTML = '<p>لا توجد نتائج مسجلة بعد</p>';
            return;
        }
        
        elements.leaderboardElements.leaderboardList.innerHTML = '';
        
        gameState.leaderboard.forEach((entry, index) => {
            const scoreItem = document.createElement('div');
            scoreItem.className = 'leaderboard-item';
            
            if (entry.name === gameState.playerName) {
                scoreItem.style.fontWeight = 'bold';
                scoreItem.style.color = 'var(--primary-color)';
            }
            
            scoreItem.innerHTML = `
                <strong>${index + 1}. ${entry.name}</strong>
                <div>النقاط: ${entry.score} (${entry.correct}/${entry.total})</div>
                <small>${entry.date}</small>
                <button class="delete-btn" data-index="${index}">×</button>
            `;
            
            elements.leaderboardElements.leaderboardList.appendChild(scoreItem);
        });
        
        // إضافة مستمعي الأحداث لأزرار الحذف
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const password = prompt('أدخل كلمة المرور للحذف:');
                if (password === DELETE_PASSWORD) {
                    const index = parseInt(this.dataset.index);
                    deleteScore(index);
                } else {
                    alert('كلمة المرور غير صحيحة');
                }
            });
        });
    } catch (error) {
        console.error('Error updating leaderboard:', error);
        elements.leaderboardElements.leaderboardList.innerHTML = '<p>حدث خطأ في تحميل النتائج</p>';
    }
}

// تغيير المظهر
function changeTheme(theme) {
    gameState.selectedTheme = theme;
    localStorage.setItem('theme', theme);
    document.body.className = theme === 'default' ? '' : `theme-${theme}`;
    
    elements.themeOptions.forEach(option => {
        option.classList.toggle('selected', option.dataset.theme === theme);
    });
}

// تبديل الصوت
function toggleSound() {
    gameState.soundEnabled = !gameState.soundEnabled;
    localStorage.setItem('soundEnabled', gameState.soundEnabled);
    updateSoundButton();
    
    if (gameState.soundEnabled) {
        playBackgroundMusic();
    } else {
        stopBackgroundMusic();
    }
}

// تشغيل موسيقى الخلفية
function playBackgroundMusic() {
    if (gameState.soundEnabled) {
        elements.audio.background.volume = 0.3;
        elements.audio.background.play().catch(e => console.log('لا يمكن تشغيل الصوت:', e));
    }
}

// إيقاف موسيقى الخلفية
function stopBackgroundMusic() {
    elements.audio.background.pause();
}

// تحديث زر الصوت
function updateSoundButton() {
    if (gameState.soundEnabled) {
        elements.soundToggle.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
        `;
    } else {
        elements.soundToggle.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.74 2.5-2.26 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77zM3.27 2 2 3.27 5.73 7H3v10h4l5 5V9.27L18.73 21 20 19.73 3.27 2z"/>
            </svg>
        `;
    }
}

// دالة خلط المصفوفة
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// تشغيل اللعبة عند الضغط على زر "ابدأ اللعب"
if (elements.buttons.startGame) {
    elements.buttons.startGame.addEventListener('click', () => {
        console.log("زر البدء تم النقر عليه، بدء اللعبة...");
        startGame();
    });
} else {
    console.error("لم يتم العثور على زر بدء اللعبة!");
}

// التأكد من تشغيل اللعبة عند تحميل الصفحة
window.addEventListener('load', () => {
    console.log("جارٍ تحميل اللعبة...");
    initGame();
});
