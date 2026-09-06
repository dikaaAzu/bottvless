// ==========================================
// PENGAMANAN DATABASE FILE (ANTI-CRASH)
// ==========================================

// Fungsi Aman Rekam User
function saveUser(userId) {
    try {
        let users = [ADMIN_ID];
        if (fs.existsSync(USERS_FILE)) {
            const data = fs.readFileSync(USERS_FILE, 'utf8');
            if (data && data.trim().startsWith('[')) {
                users = JSON.parse(data);
            }
        }
        if (!users.includes(userId)) {
            users.push(userId);
            fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
        }
    } catch (e) {
        console.log("Catatan sistem (users):", e.message);
    }
}

// Daftar Bug Host Default
const defaultBugList = [
    { id: 'bug1', name: 'ava.game.naver.com', host: 'ava.game.naver.com' },
    { id: 'bug2', name: 'support.zoom.us', host: 'support.zoom.us' },
    { id: 'bug3', name: 'media-sin6-3.cdn.whatsapp.net', host: 'media-sin6-3.cdn.whatsapp.net' },
    { id: 'bug4', name: 'listen.noice.id', host: 'listen.noice.id' },
    { id: 'bug5', name: 'api24-normal.tiktokv.com', host: 'api24-normal.tiktokv.com' },
    { id: 'bug6', name: 'graph.instagram.com', host: 'graph.instagram.com' }
];

// Fungsi Aman Memuat Bug List (Anti-Crash jika file korup/kosong)
function getBugList() {
    try {
        if (fs.existsSync(BUGS_FILE)) {
            const data = fs.readFileSync(BUGS_FILE, 'utf8');
            if (data && data.trim().startsWith('[')) {
                return JSON.parse(data);
            }
        }
        // Jika file tidak ada atau kosong, buat baru dengan data default
        fs.writeFileSync(BUGS_FILE, JSON.stringify(defaultBugList, null, 2));
    } catch (e) {
        console.log("Catatan sistem (bugs):", e.message);
    }
    return defaultBugList;
}
