// AttendEase - Student Attendance Management System
// Beginner-friendly format for a 2nd-year BSIT project.
// This project uses plain JavaScript and localStorage (no backend server).
(() => {
    'use strict';
    // Browser storage key: keep this the same so existing records are not lost.
    const STORAGE = 'attendease_pt101_bsit2109_five_v2_day_month';
    // Demo users and their assigned roles.
    const ACCOUNTS = { admin: { email: 'admin@batstate-u.edu.ph', name: 'Maria Santos', role: 'admin' }, instructor: { email: 'instructor@batstate-u.edu.ph', name: 'Alex Reyes', role: 'instructor' }, student: { email: 'student@batstate-u.edu.ph', name: 'Andrea Villanueva', role: 'student', studentId: '25-10001' } };
    // Class information displayed in the application.
    const classes = [{ id: 'BSIT-2109', subject: 'Platform Technologies', room: 'Computer Laboratory 2', schedule: 'Mon / Wed · 8:00–10:00 AM', instructor: 'Alex Reyes' }];
    const seedNames = ['Andrea Villanueva', 'Miguel Bautista', 'Sofia Ramirez', 'Nathan Castillo', 'Isabella Mendoza'];
    const pad = n => String(n).padStart(2, '0');
    const today = () => { const d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
    const isoDaysAgo = n => { const d = new Date(); d.setDate(d.getDate() - n); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
    // Create the five sample students and their attendance history.
    function makeSeed() {
        const students = seedNames.map((name, i) => ({ id: '25-' + String(10001 + i), name, email: name.toLowerCase().replaceAll(' ', '').replace(/[^a-z]/g, '') + (i + 1) + '@example.edu', classId: 'BSIT-2109', course: 'BS Information Technology' }));
        const records = [];
        for (let day = 0; day < 65; day++) {
            const date = isoDaysAgo(day);
            if ([0, 6].includes(new Date(date + 'T12:00:00').getDay()))
                continue;
            students.forEach((s, i) => { const r = (i * 17 + day * 11) % 19; records.push({ studentId: s.id, date, classId: s.classId, status: r < 2 ? 'absent' : r < 4 ? 'late' : 'present', updatedAt: new Date(Date.now() - day * 86400000 + i * 1000).toISOString() }); });
        }
        return { students, records };
    }
    ;
    // Read saved browser data, or use sample records the first time.
    function load() {
        try {
            const data = JSON.parse(localStorage.getItem(STORAGE));
            if (data && Array.isArray(data.students) && Array.isArray(data.records))
                return data;
        }
        catch { }
        return makeSeed();
    }
    ;
    let db = load(), currentUser = null, currentPage = 'dashboard', editingStudentId = null, selectedStudentId = null, editingAttendance = null, pending = {}, selectedAttendanceClass = classes[0].id, selectedAttendanceDate = today(), reportData = [];
    const $ = id => document.getElementById(id), esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const clean = s => String(s ?? '').trim();
    const roleLabel = r => ({ admin: 'Administrator', instructor: 'Instructor', student: 'Student' }[r] || r);
    const initials = n => clean(n).split(/\s+/).slice(0, 2).map(v => v[0] || '').join('').toUpperCase();
    const fmt = d => {
        if (!d)
            return '—';
        const a = d.split('-');
        return new Date(+a[0], +a[1] - 1, +a[2]).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
    };
    const canEdit = () => currentUser?.role !== 'student';
    const isAdmin = () => currentUser?.role === 'admin';
    const visibleStudents = () => currentUser?.role === 'student' ? db.students.filter(s => s.id === currentUser.studentId) : db.students;
    const visibleRecords = () => { const ids = new Set(visibleStudents().map(s => s.id)); return db.records.filter(r => ids.has(r.studentId)); };
    const studentById = id => db.students.find(s => s.id === id);
    const save = () => {
        try {
            localStorage.setItem(STORAGE, JSON.stringify(db));
        }
        catch {
            notify('Browser storage is unavailable; changes may not persist.');
        }
    };
    // Display a short notification message on the screen.
    function notify(msg) { $('toast').textContent = msg; $('toast').classList.remove('hidden'); clearTimeout(notify.t); notify.t = setTimeout(() => $('toast').classList.add('hidden'), 3200); }
    function confirmDialog(title, message, callback) {
        const root = $('modalRoot');
        root.innerHTML = `<div class="modal-backdrop"><div class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}"><h2>${esc(title)}</h2><p>${esc(message)}</p><div class="btn-row"><button class="btn" id="modalCancel">Cancel</button><button class="btn btn-danger" id="modalYes">Confirm</button></div></div></div>`;
        $('modalCancel').onclick = () => root.innerHTML = '';
        $('modalYes').onclick = () => { root.innerHTML = ''; callback(); };
        root.querySelector('.modal-backdrop').addEventListener('click', e => {
            if (e.target.classList.contains('modal-backdrop'))
                root.innerHTML = '';
        });
    }
    // Change the visible page without reloading the website.
    function go(page) {
        if (!currentUser)
            return;
        if (currentUser.role === 'student' && ['student-form', 'attendance-edit', 'confirmation'].includes(page)) {
            notify('This page is restricted to staff.');
            return;
        }
        if (page === 'student-form' && !canEdit())
            return;
        currentPage = page;
        document.querySelectorAll('.page').forEach(el => el.classList.toggle('active', el.id === 'page-' + page));
        document.querySelectorAll('.nav-item[data-page]').forEach(el => el.classList.toggle('active', el.dataset.page === page || (page.startsWith('student-') && el.dataset.page === 'students') || (page === 'attendance-edit' && el.dataset.page === 'attendance')));
        $('crumb').textContent = ({ 'dashboard': 'Dashboard', 'attendance': 'Attendance', 'students': 'Students', 'student-form': 'Student form', 'student-details': 'Student details', 'attendance-edit': 'Edit attendance', 'confirmation': 'Confirmation', 'classes': 'Classes', 'reports': 'Reports', 'settings': 'Settings' })[page] || page;
        $('sidebar').classList.remove('open');
        $('mobileOverlay').classList.remove('show');
        window.scrollTo({ top: 0, behavior: 'instant' });
        if (page === 'dashboard')
            renderDashboard();
        if (page === 'attendance')
            renderAttendance();
        if (page === 'students')
            renderStudents();
        if (page === 'student-details')
            renderDetail();
        if (page === 'classes')
            renderClasses();
        if (page === 'reports')
            renderReports();
        if (page === 'settings')
            renderSettings();
    }
    const statsCard = (label, num, foot, icon, cl = '') => `<div class="card stat-card"><div class="stat-icon ${cl}">${icon}</div><div class="stat-label">${esc(label)}</div><div class="stat-num">${esc(num)}</div><div class="stat-foot">${esc(foot)}</div></div>`;
    function countStatuses(records) { return { present: records.filter(r => r.status === 'present').length, absent: records.filter(r => r.status === 'absent').length, late: records.filter(r => r.status === 'late').length, unmarked: records.filter(r => r.status === 'unmarked').length, total: records.length }; }
    function percent(num, den) { return den ? Math.round(num / den * 100) : 0; }
    function badge(status) { return `<span class="badge ${esc(status)}"><span class="status-dot"></span>${esc(status[0].toUpperCase() + status.slice(1))}</span>`; }
    function emptyRow(col, msg) { return `<tr><td colspan="${col}"><div class="empty"><span class="empty-symbol">▤</span><strong>No records found</strong>${esc(msg)}</div></td></tr>`; }
    // Show dashboard totals, charts, and the latest records.
    function renderDashboard() { const rs = visibleRecords().filter(r => r.date === today()); const counts = countStatuses(rs); const students = visibleStudents(); $('greeting').textContent = 'Good ' + (new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening') + ', ' + currentUser.name.split(' ')[0] + '!'; $('dashboardStats').innerHTML = statsCard('Total students', students.length, 'Across accessible classes', '♧') + statsCard('Present today', counts.present, 'Marked present', '✓', 'green') + statsCard('Absent today', counts.absent, 'Marked absent', '×', 'red') + statsCard('Attendance rate', percent(counts.present, counts.total) + '%', 'Present / recorded entries', '↗', 'orange'); const max = Math.max(1, ...Array.from({ length: 7 }, (_, i) => visibleRecords().filter(r => r.date === isoDaysAgo(6 - i) && r.status === 'present').length)); $('trendChart').innerHTML = Array.from({ length: 7 }, (_, i) => { const day = isoDaysAgo(6 - i), n = visibleRecords().filter(r => r.date === day && r.status === 'present').length; return `<div class="chart-col" title="${esc(fmt(day))}: ${n} present"><div class="chart-plot"><div class="chart-bar" style="height:${percent(n, max)}%"></div></div><span>${new Date(day + 'T12:00:00').toLocaleDateString('en-PH', { weekday: 'short' })}</span></div>`; }).join(''); $('breakdown').innerHTML = ['present', 'absent', 'late'].map(s => `<div class="progress-row"><div class="label"><span>${s[0].toUpperCase() + s.slice(1)}</span><span>${counts[s]} (${percent(counts[s], counts.total)}%)</span></div><div class="track"><div class="fill" style="width:${percent(counts[s], counts.total)}%;background:${{ present: '#16a174', absent: '#d7495b', late: '#e4a44d' }[s]}"></div></div></div>`).join('') + `<div class="notice" style="margin-top:19px">ⓘ Attendance data is sample information stored in your browser.</div>`; const recent = visibleRecords().filter(r => r.status !== 'unmarked').sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 6); $('recentRows').innerHTML = recent.map(r => { const s = studentById(r.studentId); return `<tr><td><div class="name-cell"><div class="small-avatar">${esc(initials(s?.name || '?'))}</div>${esc(s?.name || 'Unknown')}</div></td><td>${esc(r.classId)}</td><td>${esc(fmt(r.date))}</td><td>${badge(r.status)}</td></tr>`; }).join('') || emptyRow(4, 'No recent activity.'); $('dashTake').disabled = !canEdit(); }
    function setupOptions() { const opts = classes.map(c => `<option value="${esc(c.id)}">${esc(c.id)} · ${esc(c.subject)}</option>`).join(''); $('attendanceClass').innerHTML = opts; $('studentClass').innerHTML = opts; $('studentClassFilter').innerHTML = '<option value="all">All classes</option>' + opts; $('reportClass').innerHTML = '<option value="all">All classes</option>' + opts; $('attendanceClass').value = selectedAttendanceClass; $('attendanceDate').value = selectedAttendanceDate; $('reportEnd').value = today(); $('reportStart').value = isoDaysAgo(65); }
    // Show attendance for the class and date selected above the table.
    function renderAttendance() { selectedAttendanceClass = $('attendanceClass').value || classes[0].id; selectedAttendanceDate = $('attendanceDate').value || today(); const all = visibleStudents().filter(s => s.classId === selectedAttendanceClass); const q = clean($('attendanceSearch').value).toLowerCase(); const list = all.filter(s => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)); const getStatus = s => pending[s.id] ?? db.records.find(r => r.studentId === s.id && r.classId === selectedAttendanceClass && r.date === selectedAttendanceDate)?.status ?? 'unmarked'; const counts = countStatuses(all.map(s => ({ status: getStatus(s) }))); $('attendanceStats').innerHTML = statsCard('Enrolled students', all.length, 'Students in this class', '♧') + statsCard('Present', counts.present, 'Selected date', '✓', 'green') + statsCard('Absent', counts.absent, 'Selected date', '×', 'red') + statsCard('Late', counts.late, 'Selected date', '◷', 'orange'); $('attendanceSubtitle').textContent = fmt(selectedAttendanceDate) + ' · ' + selectedAttendanceClass; $('attendanceRows').innerHTML = list.map(s => `<tr><td><div class="name-cell"><div class="small-avatar">${esc(initials(s.name))}</div>${esc(s.name)}</div></td><td>${esc(s.id)}</td><td>${esc(s.classId)}</td><td><div class="status-options">${canEdit() ? ['present', 'absent', 'late'].map(k => `<button class="status-button ${getStatus(s) === k ? 'selected ' + k : ''}" data-mark="${k}" data-id="${esc(s.id)}">${{ present: '✓ Present', absent: '× Absent', late: '◷ Late' }[k]}</button>`).join('') : badge(getStatus(s))}</div></td></tr>`).join('') || emptyRow(4, 'Try a different search or class.'); $('attendanceFoot').textContent = `Showing ${list.length} of ${all.length} students · ${counts.unmarked} unmarked · ${Object.keys(pending).length} unsaved change(s)`; $('saveAttendance').disabled = !canEdit(); $('markAllPresent').disabled = !canEdit(); $('attendanceHistoryBtn').onclick = () => go('reports'); }
    // Use the same form to add or edit student information.
    function startStudentForm(id = null) {
        if (!canEdit()) {
            notify('Student records are read-only for this account.');
            return;
        }
        editingStudentId = id;
        const s = id ? studentById(id) : null;
        if (id && !s)
            return;
        $('studentForm').reset();
        $('studentFormTitle').textContent = s ? 'Edit student' : 'Add new student';
        $('studentFormSub').textContent = s ? 'Update the selected student profile.' : 'Create a student record in the directory.';
        $('studentFormSave').textContent = s ? '✓ Update student' : '＋ Save student';
        $('studentId').value = s?.id || '';
        $('studentId').disabled = !!s;
        $('studentName').value = s?.name || '';
        $('studentEmail').value = s?.email || '';
        $('studentClass').value = s?.classId || classes[0].id;
        $('studentCourse').value = s?.course || 'BS Information Technology';
        go('student-form');
    }
    // Update the student directory based on the search and class filter.
    function renderStudents() { const q = clean($('studentSearch').value).toLowerCase(), cl = $('studentClassFilter').value || 'all'; const list = visibleStudents().filter(s => (cl === 'all' || s.classId === cl) && [s.id, s.name, s.email].some(v => v.toLowerCase().includes(q))); $('studentCountLabel').textContent = `${visibleStudents().length} students in your directory`; $('studentCountBadge').textContent = list.length + ' results'; $('studentRows').innerHTML = list.map(s => `<tr><td><div class="name-cell"><div class="small-avatar">${esc(initials(s.name))}</div><div>${esc(s.name)}<span class="subtext">${esc(s.email)}</span></div></div></td><td>${esc(s.id)}</td><td>${esc(s.classId)}</td><td>${esc(s.course)}</td><td><div class="inline-actions"><button class="btn btn-sm" data-detail="${esc(s.id)}">View</button>${canEdit() ? `<button class="btn btn-sm" data-edit-student="${esc(s.id)}">Edit</button><button class="btn btn-sm btn-danger" data-delete-student="${esc(s.id)}">Delete</button>` : ''}</div></td></tr>`).join('') || emptyRow(5, 'Try adjusting the search or class filter.'); $('addStudentBtn').classList.toggle('hidden', !canEdit()); }
    function renderDetail() {
        const s = studentById(selectedStudentId);
        if (!s) {
            go('students');
            return;
        }
        if (currentUser.role === 'student' && s.id !== currentUser.studentId) {
            go('students');
            return;
        }
        const rs = visibleRecords().filter(r => r.studentId === s.id).sort((a, b) => b.date.localeCompare(a.date));
        const c = countStatuses(rs);
        $('detailEdit').classList.toggle('hidden', !canEdit());
        $('detailContainer').innerHTML = `<div class="details-hero"><div class="large-avatar">${esc(initials(s.name))}</div><div><h2>${esc(s.name)}</h2><p>${esc(s.id)} · ${esc(s.classId)}</p></div></div><div class="details-grid"><div class="detail-cell"><span>Email address</span><strong style="word-break:break-all">${esc(s.email)}</strong></div><div class="detail-cell"><span>Course</span><strong>${esc(s.course)}</strong></div><div class="detail-cell"><span>Attendance rate</span><strong>${percent(c.present, c.total)}%</strong></div><div class="detail-cell"><span>Present</span><strong style="color:var(--green)">${c.present}</strong></div><div class="detail-cell"><span>Absent</span><strong style="color:var(--red)">${c.absent}</strong></div><div class="detail-cell"><span>Late</span><strong style="color:var(--orange)">${c.late}</strong></div></div><h2 class="section-title" style="margin-bottom:14px">Attendance history</h2><div class="table-scroll"><table class="table"><thead><tr><th>Date</th><th>Class</th><th>Status</th><th>Action</th></tr></thead><tbody>${rs.map((r, i) => `${i === 0 || rs[i - 1].date.slice(0, 7) !== r.date.slice(0, 7) ? `<tr class="month-divider"><td colspan="4" style="background:#fff1f3;color:#9d1c2d;font-weight:850">▤ ${esc(monthLabel(r.date.slice(0, 7)))}</td></tr>` : ''}<tr><td>${esc(fmt(r.date))}</td><td>${esc(r.classId)}</td><td>${badge(r.status)}</td><td>${canEdit() ? `<button class="btn btn-sm" data-edit-att="${esc(s.id)}" data-att-date="${esc(r.date)}">Edit record</button>` : 'View only'}</td></tr>`).join('') || emptyRow(4, 'No attendance history for this student.')}</tbody></table></div>`;
        $('detailEdit').onclick = () => startStudentForm(s.id);
    }
    function editRecord(studentId, date) {
        if (!canEdit())
            return;
        const s = studentById(studentId), r = db.records.find(r => r.studentId === studentId && r.date === date);
        if (!s || !r)
            return;
        editingAttendance = { studentId, date, classId: r.classId };
        $('editAttStudent').value = s.name + ' (' + s.id + ')';
        $('editAttClass').value = r.classId;
        $('editAttDate').value = fmt(date);
        $('editAttStatus').value = r.status;
        go('attendance-edit');
    }
    function renderClasses() { $('classCards').innerHTML = classes.map(c => { const n = visibleStudents().filter(s => s.classId === c.id).length; return `<div class="card card-pad"><div class="meta-tag" style="display:inline-block;margin-bottom:20px">${esc(c.id)}</div><h2 class="section-title" style="font-size:18px;margin-bottom:7px">${esc(c.subject)}</h2><p class="subtitle" style="margin-bottom:20px">${esc(c.room)}</p><div class="setting-item"><div><strong>Schedule</strong><span>${esc(c.schedule)}</span></div></div><div class="setting-item"><div><strong>Instructor</strong><span>${esc(c.instructor)}</span></div></div><div class="setting-item"><div><strong>Enrolled</strong><span>${n} student(s)</span></div></div><button class="btn btn-primary" style="width:100%;margin-top:18px" data-class-attendance="${esc(c.id)}">${canEdit() ? 'Take attendance' : 'View attendance'} →</button></div>`; }).join(''); }
    function getReportRows() { const cl = $('reportClass').value || 'all', start = $('reportStart').value, end = $('reportEnd').value; const month = $('reportMonth').value, ids = new Set(visibleStudents().map(s => s.id)); return db.records.filter(r => ids.has(r.studentId) && (cl === 'all' || r.classId === cl) && (!month || r.date.startsWith(month)) && (!start || r.date >= start) && (!end || r.date <= end) && r.status !== 'unmarked').sort((a, b) => b.date.localeCompare(a.date) || a.studentId.localeCompare(b.studentId)); }
    // Generate attendance charts, totals, and report tables.
    function renderReports() {
        reportData = getReportRows();
        const counts = countStatuses(reportData), days = [...new Set(reportData.map(r => r.date))].sort();
        $('reportSummary').innerHTML = `<div class="card report-card"><span>Attendance entries</span><strong>${counts.total}</strong><span>Recorded student statuses</span></div><div class="card report-card"><span>Present rate</span><strong style="color:var(--green)">${percent(counts.present, counts.total)}%</strong><span>Present / recorded entries</span></div><div class="card report-card"><span>Dates recorded</span><strong>${days.length}</strong><span>Sessions in date range</span></div>`;
        $('reportChart').innerHTML = days.slice(-12).map(day => { const dr = reportData.filter(r => r.date === day), pct = percent(dr.filter(r => r.status === 'present').length, dr.length); return `<div class="report-bar-col" title="${esc(fmt(day))}: ${pct}% present"><div class="bar" style="height:${pct}%"></div><small>${day.slice(5)}</small></div>`; }).join('') || '<div class="empty" style="width:100%">No attendance records for this range.</div>';
        $('reportBreakdown').innerHTML = ['present', 'absent', 'late'].map(s => `<div class="progress-row"><div class="label"><span>${s[0].toUpperCase() + s.slice(1)}</span><span>${counts[s]} (${percent(counts[s], counts.total)}%)</span></div><div class="track"><div class="fill" style="width:${percent(counts[s], counts.total)}%;background:${{ present: '#16a174', absent: '#d7495b', late: '#e4a44d' }[s]}"></div></div></div>`).join('');
        $('reportRecordCount').textContent = reportData.length + ' entries';
        $('reportRows').innerHTML = reportData.slice(0, 100).map(r => `<tr><td>${esc(fmt(r.date))}</td><td>${esc(studentById(r.studentId)?.name || r.studentId)}</td><td>${esc(r.classId)}</td><td>${badge(r.status)}</td><td>${canEdit() ? `<button class="btn btn-sm" data-edit-att="${esc(r.studentId)}" data-att-date="${esc(r.date)}">Edit</button>` : 'View only'}</td></tr>`).join('') || emptyRow(5, 'Try a different date range or class.');
        if (reportData.length > 100)
            $('reportRecordCount').textContent += ' (first 100 shown)';
        renderGroupedRecords();
    }
    let reportGrouping = 'daily';
    const monthLabel = m => new Date(Number(m.slice(0, 4)), Number(m.slice(5, 7)) - 1, 1).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' });
    const summaryChips = rs => { const c = countStatuses(rs); return `<span class="att-count present">${c.present} present</span><span class="att-count absent">${c.absent} absent</span><span class="att-count late">${c.late} late</span><span class="att-count">${percent(c.present, c.total)}% present</span>`; };
    // Group attendance results into daily or monthly views.
    function renderGroupedRecords() {
        const root = $('groupedRecords');
        $('dailyView').classList.toggle('selected', reportGrouping === 'daily');
        $('monthlyView').classList.toggle('selected', reportGrouping === 'monthly');
        $('dailyView').setAttribute('aria-pressed', String(reportGrouping === 'daily'));
        $('monthlyView').setAttribute('aria-pressed', String(reportGrouping === 'monthly'));
        $('recordsHeading').textContent = reportGrouping === 'daily' ? 'Attendance by day' : 'Attendance by month';
        $('recordsDescription').textContent = reportGrouping === 'daily' ? 'Expand any date to view all student statuses' : 'Expand any month for student totals and its recorded days';
        if (!reportData.length) {
            root.innerHTML = '<div class="empty"><strong>No attendance for this period</strong>Choose a different month or date range.</div>';
            return;
        }
        if (reportGrouping === 'daily') {
            const dates = [...new Set(reportData.map(r => r.date))].sort().reverse();
            root.innerHTML = dates.map((day, index) => {
                const rs = reportData.filter(r => r.date === day);
                const rows = rs.map(r => `<tr><td>${esc(studentById(r.studentId)?.name || r.studentId)}</td><td>${esc(r.studentId)}</td><td>${badge(r.status)}</td><td>${canEdit() ? `<button class="btn btn-sm" data-edit-att="${esc(r.studentId)}" data-att-date="${esc(r.date)}">Edit</button>` : 'View only'}</td></tr>`).join('');
                return `<details class="att-group" ${index === 0 ? 'open' : ''}><summary><strong>▦ ${esc(new Date(day + 'T12:00:00').toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }))}</strong><span class="att-group-meta">${summaryChips(rs)} <b>▾</b></span></summary><div class="table-scroll"><table class="table"><thead><tr><th>Student</th><th>Student ID</th><th>Status</th><th>Action</th></tr></thead><tbody>${rows}</tbody></table></div></details>`;
            }).join('');
        }
        else {
            const months = [...new Set(reportData.map(r => r.date.slice(0, 7)))].sort().reverse();
            root.innerHTML = months.map((month, index) => {
                const rs = reportData.filter(r => r.date.startsWith(month));
                const studs = [...new Set(rs.map(r => r.studentId))].sort();
                const rows = studs.map(id => { const ss = rs.filter(r => r.studentId === id), c = countStatuses(ss); return `<tr><td><span class="month-grid-label"><span class="small-avatar">${esc(initials(studentById(id)?.name || '?'))}</span>${esc(studentById(id)?.name || id)}</span></td><td>${esc(id)}</td><td>${c.present}</td><td>${c.absent}</td><td>${c.late}</td><td><b>${percent(c.present, c.total)}%</b></td></tr>`; }).join('');
                const dates = [...new Set(rs.map(r => r.date))].sort().reverse();
                const daySummaries = dates.map(day => { const r = rs.filter(x => x.date === day); return `<tr><td>${esc(fmt(day))}</td><td>${r.length}</td><td>${countStatuses(r).present}</td><td>${countStatuses(r).absent}</td><td>${countStatuses(r).late}</td><td>${percent(countStatuses(r).present, r.length)}%</td></tr>`; }).join('');
                return `<details class="att-group" ${index === 0 ? 'open' : ''}><summary><strong>▤ ${esc(monthLabel(month))} · ${dates.length} recorded day(s)</strong><span class="att-group-meta">${summaryChips(rs)} <b>▾</b></span></summary><div class="month-matrix"><table><thead><tr><th>Student</th><th>ID</th><th>Present</th><th>Absent</th><th>Late</th><th>Present rate</th></tr></thead><tbody>${rows}</tbody></table></div><div style="padding:15px 15px 5px;font-size:12px;font-weight:800">Daily totals in ${esc(monthLabel(month))}</div><div class="month-matrix"><table><thead><tr><th>Date</th><th>Entries</th><th>Present</th><th>Absent</th><th>Late</th><th>Present rate</th></tr></thead><tbody>${daySummaries}</tbody></table></div></details>`;
            }).join('');
        }
    }
    function renderSettings() { $('settingName').textContent = currentUser.name; $('settingEmail').textContent = currentUser.email; $('settingRole').textContent = roleLabel(currentUser.role); $('resetData').classList.toggle('hidden', !isAdmin()); }
    function confirmation(title, msg, primaryPage = 'dashboard', secondaryPage = 'students') { $('confirmTitle').textContent = title; $('confirmMessage').textContent = msg; $('confirmPrimary').onclick = () => go(primaryPage); $('confirmSecondary').onclick = () => go(secondaryPage); $('confirmPrimary').textContent = 'Continue →'; $('confirmSecondary').textContent = 'Back to ' + secondaryPage; go('confirmation'); }
    function csvCell(v) { return '"' + String(v ?? '').replace(/^[\s]*[=+\-@]/, "'").replaceAll('"', '""') + '"'; }
    // Export rows to a CSV file that can be opened in Excel.
    function downloadCSV(name, headers, rows) { const lines = [headers, ...rows].map(row => row.map(csvCell).join(',')).join('\r\n'); const blob = new Blob(['\ufeff' + lines], { type: 'text/csv;charset=utf-8' }), url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 500); notify('CSV file exported successfully.'); }
    // Open the dashboard after checking the selected demo account.
    function login(role) {
        currentUser = ACCOUNTS[role];
        if (!currentUser)
            return;
        $('loginScreen').classList.add('hidden');
        $('application').classList.remove('hidden');
        const inits = initials(currentUser.name);
        $('sideName').textContent = currentUser.name;
        $('sideRole').textContent = roleLabel(role);
        $('sideAvatar').textContent = inits;
        $('topAvatar').textContent = inits;
        document.querySelector('[data-page="students"]').textContent = '';
        document.querySelector('[data-page="students"]').innerHTML = '<span class="nav-icon">♧</span> ' + (role === 'student' ? 'My profile' : 'Students');
        document.querySelector('[data-page="attendance"]').innerHTML = '<span class="nav-icon">☑</span> ' + (role === 'student' ? 'My attendance' : 'Attendance');
        $('topDate').textContent = new Date().toLocaleDateString('en-PH', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
        $('studentSearch').value = '';
        $('attendanceSearch').value = '';
        $('reportClass').value = 'all';
        setupOptions();
        go('dashboard');
    }
    $('loginForm').addEventListener('submit', e => {
        e.preventDefault();
        const email = clean($('loginEmail').value).toLowerCase();
        const role = Object.keys(ACCOUNTS).find(r => ACCOUNTS[r].email === email);
        if (!role || $('loginPassword').value !== 'demo123') {
            notify('Invalid demo credentials. Select an account below.');
            return;
        }
        login(role);
    });
    document.querySelectorAll('[data-demo]').forEach(b => b.onclick = () => { $('loginEmail').value = ACCOUNTS[b.dataset.demo].email; $('loginPassword').value = 'demo123'; $('loginPassword').focus(); });
    $('logoutBtn').onclick = () => { currentUser = null; pending = {}; $('loginPassword').value = ''; $('application').classList.add('hidden'); $('loginScreen').classList.remove('hidden'); notify('Signed out of the demo.'); };
    $('menuBtn').onclick = () => { $('sidebar').classList.toggle('open'); $('mobileOverlay').classList.toggle('show'); };
    $('mobileOverlay').onclick = () => { $('sidebar').classList.remove('open'); $('mobileOverlay').classList.remove('show'); };
    // Handle clicks on buttons created dynamically in the tables.
    document.addEventListener('click', e => {
        const nav = e.target.closest('[data-page],[data-go]');
        if (nav) {
            go(nav.dataset.page || nav.dataset.go);
            return;
        }
        const detail = e.target.closest('[data-detail]');
        if (detail) {
            selectedStudentId = detail.dataset.detail;
            go('student-details');
            return;
        }
        const studEdit = e.target.closest('[data-edit-student]');
        if (studEdit) {
            startStudentForm(studEdit.dataset.editStudent);
            return;
        }
        const studDelete = e.target.closest('[data-delete-student]');
        if (studDelete) {
            const id = studDelete.dataset.deleteStudent, s = studentById(id);
            if (!s)
                return;
            confirmDialog('Delete student?', `Remove ${s.name} and all of their attendance records? This cannot be undone.`, () => { db.students = db.students.filter(v => v.id !== id); db.records = db.records.filter(r => r.studentId !== id); save(); renderStudents(); notify('Student record deleted.'); });
            return;
        }
        const attEdit = e.target.closest('[data-edit-att]');
        if (attEdit) {
            editRecord(attEdit.dataset.editAtt, attEdit.dataset.attDate);
            return;
        }
        const status = e.target.closest('[data-mark]');
        if (status) {
            pending[status.dataset.id] = status.dataset.mark;
            renderAttendance();
            return;
        }
        const cl = e.target.closest('[data-class-attendance]');
        if (cl) {
            $('attendanceClass').value = cl.dataset.classAttendance;
            selectedAttendanceClass = cl.dataset.classAttendance;
            pending = {};
            go('attendance');
        }
    });
    $('dashReports').onclick = () => go('reports');
    $('dashTake').onclick = () => {
        if (canEdit())
            go('attendance');
    };
    $('addStudentBtn').onclick = () => startStudentForm();
    $('studentSearch').oninput = renderStudents;
    $('studentClassFilter').onchange = renderStudents;
    $('attendanceSearch').oninput = renderAttendance;
    $('attendanceClass').onchange = () => { selectedAttendanceClass = $('attendanceClass').value; pending = {}; renderAttendance(); };
    $('attendanceDate').onchange = () => { selectedAttendanceDate = $('attendanceDate').value; pending = {}; renderAttendance(); };
    $('markAllPresent').onclick = () => { visibleStudents().filter(s => s.classId === selectedAttendanceClass).forEach(s => pending[s.id] = 'present'); renderAttendance(); notify('All students marked present. Click Save attendance to keep changes.'); };
    $('saveAttendance').onclick = () => {
        if (!canEdit())
            return;
        const all = visibleStudents().filter(s => s.classId === selectedAttendanceClass);
        const stamp = new Date().toISOString();
        for (const s of all) {
            const status = pending[s.id] ?? db.records.find(r => r.studentId === s.id && r.date === selectedAttendanceDate && r.classId === selectedAttendanceClass)?.status ?? 'unmarked';
            if (status === 'unmarked')
                continue;
            const idx = db.records.findIndex(r => r.studentId === s.id && r.classId === selectedAttendanceClass && r.date === selectedAttendanceDate);
            const rec = { studentId: s.id, classId: selectedAttendanceClass, date: selectedAttendanceDate, status, updatedAt: stamp };
            if (idx >= 0)
                db.records[idx] = rec;
            else
                db.records.push(rec);
        }
        const changes = Object.keys(pending).length;
        pending = {};
        save();
        confirmation('Attendance saved!', `${changes} updated status(es) for ${selectedAttendanceClass} on ${fmt(selectedAttendanceDate)}. Records are stored locally in this browser.`, 'attendance', 'dashboard');
    };
    $('studentForm').addEventListener('submit', e => {
        e.preventDefault();
        if (!canEdit())
            return;
        const info = { id: clean($('studentId').value), name: clean($('studentName').value), email: clean($('studentEmail').value), classId: $('studentClass').value, course: clean($('studentCourse').value) };
        if (!info.id || !info.name || !info.email || !info.classId || !info.course) {
            notify('Complete all required fields.');
            return;
        }
        if (!editingStudentId && db.students.some(s => s.id.toLowerCase() === info.id.toLowerCase())) {
            notify('This student ID already exists.');
            return;
        }
        if (db.students.some(s => s.email.toLowerCase() === info.email.toLowerCase() && s.id !== editingStudentId)) {
            notify('This email address is already in use.');
            return;
        }
        if (editingStudentId) {
            const i = db.students.findIndex(s => s.id === editingStudentId);
            if (i < 0)
                return;
            const oldClass = db.students[i].classId;
            db.students[i] = info;
            if (oldClass !== info.classId)
                notify('Class changed. Historical attendance remains in its original class.');
        }
        else
            db.students.push(info);
        save();
        confirmation(editingStudentId ? 'Student updated!' : 'Student added!', `${info.name}'s information was saved to the local student directory.`, 'students', 'dashboard');
    });
    $('editAttendanceForm').addEventListener('submit', e => {
        e.preventDefault();
        if (!editingAttendance || !canEdit())
            return;
        const r = db.records.find(r => r.studentId === editingAttendance.studentId && r.date === editingAttendance.date && r.classId === editingAttendance.classId);
        if (!r) {
            notify('Attendance record no longer exists.');
            return;
        }
        r.status = $('editAttStatus').value;
        r.updatedAt = new Date().toISOString();
        save();
        confirmation('Attendance updated!', `The attendance entry for ${studentById(r.studentId)?.name || r.studentId} on ${fmt(r.date)} was updated.`, 'reports', 'attendance');
    });
    $('classesTake').onclick = () => go('attendance');
    $('reportStart').onchange = () => { $('reportMonth').value = ''; };
    $('reportEnd').onchange = () => { $('reportMonth').value = ''; };
    $('applyReport').onclick = () => {
        if ($('reportStart').value && $('reportEnd').value && $('reportStart').value > $('reportEnd').value) {
            notify('Start date must be before or equal to the end date.');
            return;
        }
        renderReports();
    };
    $('dailyView').onclick = () => { reportGrouping = 'daily'; renderGroupedRecords(); };
    $('monthlyView').onclick = () => { reportGrouping = 'monthly'; renderGroupedRecords(); };
    $('allMonths').onclick = () => { $('reportMonth').value = ''; $('reportStart').value = ''; $('reportEnd').value = ''; renderReports(); };
    $('reportMonth').onchange = () => {
        if ($('reportMonth').value) {
            $('reportStart').value = '';
            $('reportEnd').value = '';
        }
        renderReports();
    };
    $('printReports').onclick = () => window.print();
    $('exportAttendance').onclick = () => downloadCSV('attendance-report-' + today() + '.csv', ['Date', 'Student ID', 'Student name', 'Class', 'Status'], getReportRows().map(r => [r.date, r.studentId, studentById(r.studentId)?.name || '', r.classId, r.status]));
    $('exportStudents').onclick = () => downloadCSV('student-directory-' + today() + '.csv', ['Student ID', 'Name', 'Email', 'Class', 'Course'], visibleStudents().map(s => [s.id, s.name, s.email, s.classId, s.course]));
    $('resetData').onclick = () => {
        if (!isAdmin())
            return;
        confirmDialog('Reset sample data?', 'Restore the original demo students and attendance records? All edits and added student profiles will be lost.', () => { db = makeSeed(); save(); pending = {}; setupOptions(); go('dashboard'); notify('Sample data restored.'); });
    };
    setupOptions();
})();
