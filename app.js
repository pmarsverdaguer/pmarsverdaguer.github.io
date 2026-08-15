/**
 * LÓGICA PRINCIPAL DE LA APLICACIÓN - PORTAL DE TEST Y CORRECCIONES AENA
 * Soporta navegación de atrás/adelante del navegador (History API), visualización y filtrado dinámico de exámenes pasados.
 */

const app = {
  // Estado de la aplicación
  mode: 'simulacion', // 'simulacion' | 'practica'
  questions: [],
  userAnswers: {},
  practiceChecked: {},
  currentIndex: 0,
  timerInterval: null,
  secondsRemaining: 0,
  currentExamTitle: '',
  activeStatsTab: 'global', // 'global' | 'aptitudes' | 'ingles'
  activeSubFilter: null, // null | 'Razonamiento Verbal' | 'Listening' | etc.

  // Inicialización
  init() {
    this.populatePracticaDropdowns();
    
    // Configuración del Historial de Navegación del Navegador (Botones Atrás / Adelante)
    const hash = window.location.hash.replace('#', '');
    const validViews = ['landing', 'config-simulacion', 'config-practica', 'history-corrections', 'past-exam-detail', 'exam', 'results'];
    const initialView = validViews.includes(hash) ? hash : 'landing';
    
    history.replaceState({ view: initialView }, '', '#' + initialView);
    this.showView(initialView, true);

    window.addEventListener('popstate', (event) => {
      const targetView = (event.state && event.state.view) ? event.state.view : 'landing';
      app.showView(targetView, true);
    });
  },

  // --------------------------------------------------------------------------
  // NAVEGACIÓN Y CONTROL DE VISTAS CON HISTORIAL DE NAVEGADOR
  // --------------------------------------------------------------------------
  showView(viewName, isPopState = false) {
    if (!isPopState) {
      history.pushState({ view: viewName }, '', '#' + viewName);
    }

    if (viewName !== 'exam') {
      this.stopTimer();
    }

    document.querySelectorAll('.section-view').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));

    const targetView = document.getElementById(`view-${viewName}`);
    if (targetView) {
      targetView.classList.add('active');
    }

    const activeNav = document.getElementById(`nav-${viewName}`);
    if (activeNav) {
      activeNav.classList.add('active');
    }

    if (viewName === 'history-corrections') {
      this.renderHistoryCorrections();
    }

    window.scrollTo({ top: 0, behavior: 'instant' });
  },

  // --------------------------------------------------------------------------
  // LÓGICA DE CONFIGURACIÓN DE PRÁCTICA (DESPLEGABLES EN CASCADA ESTRICTA)
  // --------------------------------------------------------------------------
  populatePracticaDropdowns() {
    this.onPracticaCategoryChange();
  },

  onPracticaCategoryChange() {
    const cat = document.getElementById('prac-category').value;
    const typeSelect = document.getElementById('prac-type');
    typeSelect.innerHTML = '<option value="all">Todos los Tipos</option>';

    let pool = [];
    if (cat === 'all') {
      pool = [...DB_AENA.test_aptitudes, ...DB_AENA.test_ingles];
    } else if (DB_AENA[cat]) {
      pool = DB_AENA[cat];
    }

    const types = [...new Set(pool.map(q => q.tipo))];
    types.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t;
      opt.textContent = t;
      typeSelect.appendChild(opt);
    });

    this.onPracticaTypeChange();
  },

  onPracticaTypeChange() {
    const cat = document.getElementById('prac-category').value;
    const selectedType = document.getElementById('prac-type').value;
    const subSelect = document.getElementById('prac-subtype');
    subSelect.innerHTML = '<option value="all">Todos los Subtipos</option>';

    let pool = [];
    if (cat === 'all') {
      pool = [...DB_AENA.test_aptitudes, ...DB_AENA.test_ingles];
    } else if (DB_AENA[cat]) {
      pool = DB_AENA[cat];
    }

    if (selectedType !== 'all') {
      pool = pool.filter(q => q.tipo === selectedType);
    }

    const subtypes = [...new Set(pool.map(q => q.subtipo))];
    subtypes.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s;
      opt.textContent = s;
      subSelect.appendChild(opt);
    });
  },

  onPracticaQuestionCountChange() {
    const val = document.getElementById('prac-questions-count').value;
    const manualBox = document.getElementById('prac-questions-manual-box');
    if (manualBox) {
      manualBox.style.display = (val === 'custom') ? 'flex' : 'none';
    }
  },

  // --------------------------------------------------------------------------
  // INICIO DE TESTS (DESDE CONFIGURACIÓN DEDICADA)
  // --------------------------------------------------------------------------
  startSimulacion() {
    this.mode = 'simulacion';
    const cat = document.getElementById('sim-category').value;
    const count = parseInt(document.getElementById('sim-questions-count').value, 10);

    let pool = [];
    if (cat === 'all') {
      pool = [...DB_AENA.test_aptitudes, ...DB_AENA.test_ingles];
    } else if (DB_AENA[cat]) {
      pool = DB_AENA[cat];
    }

    const selectedQuestions = this.shuffleArray([...pool]).slice(0, count);
    this.launchTestEngine(selectedQuestions, `Simulación Oficial (${selectedQuestions.length} Preguntas)`);
  },

  startPractica() {
    this.mode = 'practica';
    const cat = document.getElementById('prac-category').value;
    const type = document.getElementById('prac-type').value;
    const subtype = document.getElementById('prac-subtype').value;

    let count = 10;
    const countSelectVal = document.getElementById('prac-questions-count').value;

    if (countSelectVal === 'custom') {
      const manualInput = document.getElementById('prac-questions-manual');
      count = parseInt(manualInput ? manualInput.value : '10', 10);
      if (isNaN(count) || count < 1) {
        alert('Por favor, introduce un número válido de preguntas (mínimo 1).');
        return;
      }
    } else {
      count = parseInt(countSelectVal, 10);
    }

    let pool = [];
    if (cat === 'all') {
      pool = [...DB_AENA.test_aptitudes, ...DB_AENA.test_ingles];
    } else if (DB_AENA[cat]) {
      pool = DB_AENA[cat];
    }

    if (type !== 'all') {
      pool = pool.filter(q => q.tipo === type);
    }
    if (subtype !== 'all') {
      pool = pool.filter(q => q.subtipo === subtype);
    }

    if (pool.length === 0) {
      alert('No existen preguntas disponibles para la combinación seleccionada.');
      return;
    }

    const selectedQuestions = this.shuffleArray([...pool]).slice(0, count);
    let title = 'Práctica Personalizada';
    if (type !== 'all') title += `: ${type}`;
    if (subtype !== 'all') title += ` (${subtype})`;

    this.launchTestEngine(selectedQuestions, title);
  },

  launchTestEngine(questionsList, titleText) {
    this.questions = questionsList;
    this.userAnswers = {};
    this.practiceChecked = {};
    this.currentIndex = 0;
    this.currentExamTitle = titleText;

    document.getElementById('exam-current-title').textContent = titleText;
    const modeBadge = document.getElementById('exam-mode-badge');

    if (this.mode === 'simulacion') {
      modeBadge.textContent = '⏱️ Simulación Oficial';
      modeBadge.style.backgroundColor = 'var(--aena-navy)';
      modeBadge.style.color = '#ffffff';
      this.secondsRemaining = questionsList.length * 60;
      this.startTimer();
    } else {
      modeBadge.textContent = '🎯 Práctica Libre';
      modeBadge.style.backgroundColor = 'var(--aena-lime)';
      modeBadge.style.color = 'var(--aena-navy)';
      this.stopTimer();
      document.getElementById('exam-timer').textContent = 'SIN TIEMPO';
    }

    this.renderPaletteGrid();
    this.renderQuestion(0);
    this.showView('exam');
  },

  // --------------------------------------------------------------------------
  // TEMPORIZADOR DE SIMULACIÓN
  // --------------------------------------------------------------------------
  startTimer() {
    this.stopTimer();
    this.updateTimerDisplay();
    this.timerInterval = setInterval(() => {
      this.secondsRemaining--;
      this.updateTimerDisplay();
      if (this.secondsRemaining <= 0) {
        this.stopTimer();
        alert('⏰ El tiempo del examen ha finalizado. Se entregará el examen automáticamente.');
        this.finishTest();
      }
    }, 1000);
  },

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  },

  updateTimerDisplay() {
    const timerBox = document.getElementById('exam-timer');
    if (this.mode !== 'simulacion') return;

    const mins = Math.floor(this.secondsRemaining / 60);
    const secs = this.secondsRemaining % 60;
    timerBox.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    if (this.secondsRemaining < 60) {
      timerBox.classList.add('warning');
    } else {
      timerBox.classList.remove('warning');
    }
  },

  // --------------------------------------------------------------------------
  // RENDERIZADO Y CONTROL DE PREGUNTAS EN EXAMEN
  // --------------------------------------------------------------------------
  renderQuestion(index) {
    if (index < 0 || index >= this.questions.length) return;
    this.currentIndex = index;

    const q = this.questions[index];
    const pct = ((index + 1) / this.questions.length) * 100;
    document.getElementById('exam-progress-fill').style.width = `${pct}%`;

    document.getElementById('q-badge-tipo').textContent = q.tipo;
    document.getElementById('q-badge-subtipo').textContent = q.subtipo;
    document.getElementById('q-number-indicator').textContent = `Pregunta ${index + 1} de ${this.questions.length}`;
    document.getElementById('q-text-body').innerHTML = q.pregunta;

    // Reproductor de Audio si es Listening
    const audioBox = document.getElementById('audio-container');
    const transcriptBox = document.getElementById('audio-transcript-box');
    transcriptBox.style.display = 'none';

    if (q.tipo === 'Listening' || q.audio_text) {
      audioBox.style.display = 'flex';
      document.getElementById('audio-status-msg').textContent = 'Haz clic para escuchar el audio en inglés';
      transcriptBox.textContent = q.audio_text || 'Sin transcripción.';
    } else {
      audioBox.style.display = 'none';
    }

    // Opciones A, B, C, D
    const optionsContainer = document.getElementById('q-options-container');
    optionsContainer.innerHTML = '';

    const selectedAns = this.userAnswers[index];
    const isChecked = this.practiceChecked[index];

    ['A', 'B', 'C', 'D'].forEach(letter => {
      const optionText = q[`opcion_${letter.toLowerCase()}`];
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option-btn';

      if (selectedAns === letter) {
        btn.classList.add('selected');
      }

      if (this.mode === 'practica' && isChecked) {
        if (letter === q.respuesta_correcta) {
          btn.classList.add('correct');
        } else if (selectedAns === letter && selectedAns !== q.respuesta_correcta) {
          btn.classList.add('wrong');
        }
      }

      btn.onclick = () => this.selectOption(letter);
      btn.innerHTML = `
        <span class="option-letter">${letter}</span>
        <span class="option-text">${optionText}</span>
      `;
      optionsContainer.appendChild(btn);
    });

    const explanationBox = document.getElementById('q-explanation-container');
    const btnCheckPractice = document.getElementById('btn-check-practice');

    if (this.mode === 'practica') {
      btnCheckPractice.style.display = 'inline-block';
      if (isChecked) {
        explanationBox.style.display = 'block';
        document.getElementById('q-explanation-text').textContent = q.explicacion;
      } else {
        explanationBox.style.display = 'none';
      }
    } else {
      btnCheckPractice.style.display = 'none';
      explanationBox.style.display = 'none';
    }

    document.getElementById('btn-prev-q').style.visibility = index === 0 ? 'hidden' : 'visible';
    const btnNext = document.getElementById('btn-next-q');
    btnNext.style.display = (index === this.questions.length - 1) ? 'none' : 'inline-block';

    this.updatePaletteHighlight();
  },

  selectOption(letter) {
    this.userAnswers[this.currentIndex] = letter;
    this.renderQuestion(this.currentIndex);
  },

  checkAnswerPractice() {
    if (!this.userAnswers[this.currentIndex]) {
      alert('Selecciona primero una respuesta para comprobar.');
      return;
    }
    this.practiceChecked[this.currentIndex] = true;
    this.renderQuestion(this.currentIndex);
  },

  nextQuestion() {
    if (this.currentIndex < this.questions.length - 1) {
      this.renderQuestion(this.currentIndex + 1);
    }
  },

  prevQuestion() {
    if (this.currentIndex > 0) {
      this.renderQuestion(this.currentIndex - 1);
    }
  },

  // --------------------------------------------------------------------------
  // AUDIO LISTENING (WEB SPEECH API)
  // --------------------------------------------------------------------------
  playListeningAudio() {
    const q = this.questions[this.currentIndex];
    if (!q || !q.audio_text) return;

    if (!('speechSynthesis' in window)) {
      alert('Sintetizador no disponible. Transcripción: ' + q.audio_text);
      return;
    }

    const statusMsg = document.getElementById('audio-status-msg');
    statusMsg.textContent = '🔊 Reproduciendo locución...';
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(q.audio_text);
    utterance.lang = 'en-US';
    utterance.rate = 0.88;

    utterance.onend = () => { statusMsg.textContent = '✅ Locución completada'; };
    utterance.onerror = () => { statusMsg.textContent = '❌ Error de audio'; };

    window.speechSynthesis.speak(utterance);
  },

  toggleTranscription() {
    const box = document.getElementById('audio-transcript-box');
    box.style.display = (box.style.display === 'none' || !box.style.display) ? 'block' : 'none';
  },

  // --------------------------------------------------------------------------
  // PALETA LATERAL
  // --------------------------------------------------------------------------
  renderPaletteGrid() {
    const grid = document.getElementById('palette-grid-container');
    grid.innerHTML = '';

    this.questions.forEach((_, idx) => {
      const item = document.createElement('div');
      item.className = 'palette-item';
      item.id = `palette-item-${idx}`;
      item.textContent = idx + 1;
      item.onclick = () => this.renderQuestion(idx);
      grid.appendChild(item);
    });

    this.updatePaletteHighlight();
  },

  updatePaletteHighlight() {
    this.questions.forEach((_, idx) => {
      const item = document.getElementById(`palette-item-${idx}`);
      if (!item) return;

      item.className = 'palette-item';
      if (this.userAnswers[idx]) item.classList.add('answered');
      if (idx === this.currentIndex) item.classList.add('current');
    });
  },

  confirmFinishTest() {
    const answeredCount = Object.keys(this.userAnswers).length;
    const totalCount = this.questions.length;

    if (confirm(`¿Entregar el test ahora?\n- Respondidas: ${answeredCount}/${totalCount}`)) {
      this.finishTest();
    }
  },

  cancelTest() {
    if (confirm('¿Cancelar el test en curso?')) {
      this.stopTimer();
      this.showView('landing');
    }
  },

  // --------------------------------------------------------------------------
  // FINALIZACIÓN Y GUARDADO DE EXAMEN COMPLETO PARA CORRECCIONES
  // --------------------------------------------------------------------------
  finishTest() {
    this.stopTimer();

    let correct = 0;
    let wrong = 0;
    let blank = 0;

    this.questions.forEach((q, idx) => {
      const ans = this.userAnswers[idx];
      if (!ans) blank++;
      else if (ans === q.respuesta_correcta) correct++;
      else wrong++;
    });

    let netScore = correct - (wrong / 3);
    if (netScore < 0) netScore = 0;
    const finalScoreTen = ((netScore / this.questions.length) * 10).toFixed(2);

    document.getElementById('res-total-score').textContent = `${finalScoreTen} / 10`;
    document.getElementById('res-correct-count').textContent = correct;
    document.getElementById('res-wrong-count').textContent = wrong;
    document.getElementById('res-blank-count').textContent = blank;

    this.renderResultsReview();

    const examRecord = {
      id: 'exam_' + Date.now(),
      title: this.currentExamTitle,
      date: new Date().toLocaleDateString('es-ES') + ' ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      mode: this.mode,
      questions: this.questions,
      userAnswers: this.userAnswers,
      correct,
      wrong,
      blank,
      total: this.questions.length,
      score: finalScoreTen
    };

    this.saveExamToHistory(examRecord);
    this.showView('results');
  },

  renderResultsReview() {
    const container = document.getElementById('results-review-container');
    container.innerHTML = '';

    this.questions.forEach((q, idx) => {
      const userAns = this.userAnswers[idx];
      const isCorrect = userAns === q.respuesta_correcta;
      const isBlank = !userAns;

      let statusClass = 'is-correct';
      let statusText = '✅ CORRECTA';

      if (isBlank) {
        statusClass = 'is-blank';
        statusText = '⚪ SIN RESPONDER';
      } else if (!isCorrect) {
        statusClass = 'is-wrong';
        statusText = '❌ INCORRECTA';
      }

      const item = document.createElement('div');
      item.className = `review-item ${statusClass}`;
      item.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-weight: 700; font-size: 0.9rem;">Pregunta ${idx + 1} (${q.tipo} - ${q.subtipo})</span>
          <span class="badge" style="background-color: white; border: 1px solid var(--border-color);">${statusText}</span>
        </div>
        <div style="font-weight: 600; margin-bottom: 10px;">${q.pregunta}</div>
        <div style="font-size: 0.9rem; margin-bottom: 8px;">
          <strong>Tu respuesta:</strong> ${userAns ? `${userAns}) ${q[`opcion_${userAns.toLowerCase()}`]}` : '<em>No respondida</em>'}<br>
          <strong>Respuesta correcta:</strong> <span style="color: var(--color-success); font-weight: 700;">${q.respuesta_correcta}) ${q[`opcion_${q.respuesta_correcta.toLowerCase()}`]}</span>
        </div>
        <div class="explanation-box">
          <div class="explanation-title">💡 Explicación Técnica:</div>
          <div>${q.explicacion}</div>
        </div>
      `;
      container.appendChild(item);
    });
  },

  repeatTest() {
    this.launchTestEngine(this.questions, this.currentExamTitle);
  },

  // --------------------------------------------------------------------------
  // HISTORIAL Y PESTAÑAS DE CORRECCIONES CON FILTRADO SINCRONIZADO
  // --------------------------------------------------------------------------
  saveExamToHistory(examRecord) {
    const history = JSON.parse(localStorage.getItem('aena_exam_history_v2') || '[]');
    history.unshift(examRecord);
    localStorage.setItem('aena_exam_history_v2', JSON.stringify(history));
  },

  switchStatsTab(tabName) {
    this.activeStatsTab = tabName;
    this.activeSubFilter = null; // Reiniciar filtro secundario al cambiar de categoría
    ['global', 'aptitudes', 'ingles'].forEach(t => {
      const btn = document.getElementById(`tab-btn-${t}`);
      if (btn) {
        if (t === tabName) btn.classList.add('active');
        else btn.classList.remove('active');
      }
    });
    this.renderCoverageStats();
    this.renderHistoryCorrections();
  },

  filterBySubApartado(tipoName) {
    if (this.activeSubFilter === tipoName) {
      this.activeSubFilter = null; // Alternar / Desmarcar si se vuelve a pulsar
    } else {
      this.activeSubFilter = tipoName;
    }
    this.renderCoverageStats();
    this.renderHistoryCorrections();
  },

  clearSubFilter() {
    this.activeSubFilter = null;
    this.renderCoverageStats();
    this.renderHistoryCorrections();
  },

  renderHistoryCorrections() {
    this.renderCoverageStats();

    const history = JSON.parse(localStorage.getItem('aena_exam_history_v2') || '[]');
    const container = document.getElementById('history-list-container');
    const filterBadge = document.getElementById('history-filter-badge');
    container.innerHTML = '';

    const aptitudesTipos = ['Razonamiento Verbal', 'Razonamiento Numérico', 'Razonamiento Lógico-Abstracto'];
    const inglesTipos = ['Listening', 'Gramática'];

    // Lógica de Filtrado Sincronizado por Pestaña Activa y Sub-apartado
    const filteredHistory = history.filter(exam => {
      if (!exam.questions || exam.questions.length === 0) return false;

      // 1. Filtrar según pestaña principal activa (Global / Aptitudes / Inglés)
      if (this.activeStatsTab === 'aptitudes') {
        const hasApt = exam.questions.some(q => aptitudesTipos.includes(q.tipo));
        if (!hasApt) return false;
      } else if (this.activeStatsTab === 'ingles') {
        const hasIng = exam.questions.some(q => inglesTipos.includes(q.tipo));
        if (!hasIng) return false;
      }

      // 2. Filtrar por sub-apartado secundario activo si se seleccionó
      if (this.activeSubFilter) {
        const hasSub = exam.questions.some(q => q.tipo === this.activeSubFilter || q.subtipo === this.activeSubFilter);
        if (!hasSub) return false;
      }

      return true;
    });

    // Actualizar indicador visual del filtro aplicado
    if (filterBadge) {
      let filterText = 'Mostrando: 🌐 Todos los exámenes realizados';
      if (this.activeStatsTab === 'aptitudes') filterText = 'Mostrando: 📊 Exámenes de Aptitudes';
      if (this.activeStatsTab === 'ingles') filterText = 'Mostrando: ✈️ Exámenes de Inglés';

      if (this.activeSubFilter) {
        filterText += ` > Sub-apartado: <strong>"${this.activeSubFilter}"</strong> <button type="button" class="btn-secondary" style="padding: 2px 8px; font-size: 0.75rem; margin-left: 6px; background: white;" onclick="app.clearSubFilter()">❌ Limpiar filtro</button>`;
      }

      filterBadge.innerHTML = filterText;
    }

    if (filteredHistory.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 30px; background: #f8fafc; border: 1px dashed var(--border-color); border-radius: 6px; color: var(--text-muted);">
          📌 No se encontraron exámenes realizados para la categoría seleccionada (${this.activeSubFilter || (this.activeStatsTab === 'global' ? 'Global' : this.activeStatsTab)}).
        </div>
      `;
      return;
    }

    const table = document.createElement('table');
    table.className = 'history-table';
    table.innerHTML = `
      <thead>
        <tr>
          <th>Fecha y Hora</th>
          <th>Tipo / Modo</th>
          <th>Nota Final</th>
          <th>A / F / B</th>
          <th>Acciones de Corrección</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tbody = table.querySelector('tbody');

    filteredHistory.forEach(exam => {
      const isPassed = parseFloat(exam.score) >= 5.0;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${exam.date}</strong><br><span style="font-size: 0.8rem; color: var(--text-muted);">${exam.title}</span></td>
        <td><span class="badge badge-subtipo">${exam.mode === 'simulacion' ? 'Simulación' : 'Práctica'}</span></td>
        <td><span class="badge-score ${isPassed ? 'pass' : 'fail'}">${exam.score} / 10</span></td>
        <td>
          <span style="color: var(--color-success); font-weight:700;">${exam.correct}</span> / 
          <span style="color: var(--color-error); font-weight:700;">${exam.wrong}</span> / 
          <span style="color: var(--color-warning); font-weight:700;">${exam.blank}</span>
        </td>
        <td>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <button type="button" class="btn-secondary" style="padding: 4px 8px; font-size: 0.8rem;" onclick="app.viewPastExamDetail('${exam.id}')">
              🔍 Revisar Examen
            </button>
            ${exam.wrong > 0 ? `
              <button type="button" class="btn-secondary" style="padding: 4px 8px; font-size: 0.8rem; background-color: #fff7ed; border-color: #fdba74; color: #c2410c; font-weight:700;" onclick="app.repeatOnlyErrors('${exam.id}')">
                🔁 Repetir solo fallos (${exam.wrong})
              </button>
            ` : ''}
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    container.appendChild(table);
  },

  renderCoverageStats() {
    const container = document.getElementById('coverage-stats-container');
    if (!container) return;

    const aptitudesQuestions = DB_AENA.test_aptitudes || [];
    const inglesQuestions = DB_AENA.test_ingles || [];
    const allQuestions = [...aptitudesQuestions, ...inglesQuestions];

    const history = JSON.parse(localStorage.getItem('aena_exam_history_v2') || '[]');

    const uniqueGlobal = new Set();
    const uniqueAptitudes = new Set();
    const uniqueIngles = new Set();
    const uniqueByTipo = {};
    const uniqueBySubtipo = {};

    const accGlobal = { correct: 0, wrong: 0, total: 0 };
    const accAptitudes = { correct: 0, wrong: 0, total: 0 };
    const accIngles = { correct: 0, wrong: 0, total: 0 };
    const accByTipo = {};
    const accBySubtipo = {};

    allQuestions.forEach(q => {
      if (!accByTipo[q.tipo]) accByTipo[q.tipo] = { correct: 0, wrong: 0, total: 0, dbCount: 0 };
      accByTipo[q.tipo].dbCount++;
      if (!uniqueByTipo[q.tipo]) uniqueByTipo[q.tipo] = new Set();

      if (!accBySubtipo[q.subtipo]) accBySubtipo[q.subtipo] = { correct: 0, wrong: 0, total: 0, dbCount: 0, tipo: q.tipo };
      accBySubtipo[q.subtipo].dbCount++;
      if (!uniqueBySubtipo[q.subtipo]) uniqueBySubtipo[q.subtipo] = new Set();
    });

    history.forEach(exam => {
      if (!exam.questions || !exam.userAnswers) return;

      const isAptitudesTable = (q) => aptitudesQuestions.some(aq => aq.id === q.id && aq.pregunta === q.pregunta);

      exam.questions.forEach((q, idx) => {
        const userAns = exam.userAnswers[idx];
        const isApt = isAptitudesTable(q);

        if (userAns) {
          const key = `${q.id}_${q.tipo}`;
          uniqueGlobal.add(key);
          if (isApt) uniqueAptitudes.add(key);
          else uniqueIngles.add(key);

          if (uniqueByTipo[q.tipo]) uniqueByTipo[q.tipo].add(q.id);
          if (uniqueBySubtipo[q.subtipo]) uniqueBySubtipo[q.subtipo].add(q.id);
        }

        accGlobal.total++;
        if (isApt) accAptitudes.total++;
        else accIngles.total++;

        if (accByTipo[q.tipo]) accByTipo[q.tipo].total++;
        if (accBySubtipo[q.subtipo]) accBySubtipo[q.subtipo].total++;

        if (userAns === q.respuesta_correcta) {
          accGlobal.correct++;
          if (isApt) accAptitudes.correct++;
          else accIngles.correct++;
          if (accByTipo[q.tipo]) accByTipo[q.tipo].correct++;
          if (accBySubtipo[q.subtipo]) accBySubtipo[q.subtipo].correct++;
        } else if (userAns) {
          accGlobal.wrong++;
          if (isApt) accAptitudes.wrong++;
          else accIngles.wrong++;
          if (accByTipo[q.tipo]) accByTipo[q.tipo].wrong++;
          if (accBySubtipo[q.subtipo]) accBySubtipo[q.subtipo].wrong++;
        }
      });
    });

    const calcGrade = (acc) => {
      if (!acc || acc.total === 0) return '-';
      const net = acc.correct - (acc.wrong / 3);
      return Math.max(0, (net / acc.total) * 10).toFixed(1) + ' / 10';
    };

    const globalGrade = calcGrade(accGlobal);
    const aptitudesGrade = calcGrade(accAptitudes);
    const inglesGrade = calcGrade(accIngles);

    const badgeGlobal = document.getElementById('badge-tab-global');
    const badgeAptitudes = document.getElementById('badge-tab-aptitudes');
    const badgeIngles = document.getElementById('badge-tab-ingles');

    if (badgeGlobal) badgeGlobal.textContent = globalGrade;
    if (badgeAptitudes) badgeAptitudes.textContent = aptitudesGrade;
    if (badgeIngles) badgeIngles.textContent = inglesGrade;

    let html = '';

    if (this.activeStatsTab === 'global') {
      const covPct = allQuestions.length > 0 ? ((uniqueGlobal.size / allQuestions.length) * 100).toFixed(1) : 0;
      const aptCovPct = aptitudesQuestions.length > 0 ? ((uniqueAptitudes.size / aptitudesQuestions.length) * 100).toFixed(1) : 0;
      const ingCovPct = inglesQuestions.length > 0 ? ((uniqueIngles.size / inglesQuestions.length) * 100).toFixed(1) : 0;

      html = `
        <div style="background-color: #f8fafc; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 20px; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap;">
            <div>
              <h3 style="font-size: 1.15rem; color: var(--aena-navy); font-weight: 800;">Score Global de Preparación</h3>
              <p style="font-size: 0.85rem; color: var(--text-muted);">Media acumulada de todos tus exámenes y simulacros realizados</p>
            </div>
            <span class="badge-score ${globalGrade !== '-' && parseFloat(globalGrade) >= 5 ? 'pass' : 'fail'}" style="font-size: 1.3rem; padding: 6px 14px;">
              ${globalGrade}
            </span>
          </div>
          
          <div style="margin-top: 14px;">
            <div style="display: flex; justify-content: space-between; font-size: 0.9rem; font-weight: 700; margin-bottom: 4px;">
              <span>Cobertura Total del Banco Oficial</span>
              <span>${uniqueGlobal.size} de ${allQuestions.length} preguntas (${covPct}%)</span>
            </div>
            <div class="metric-progress-bar" style="height: 10px;">
              <div class="metric-progress-fill" style="width: ${covPct}%;"></div>
            </div>
          </div>
        </div>

        <h4 style="font-size: 1rem; font-weight: 700; color: var(--aena-navy); margin-bottom: 12px;">Resumen por Categoría Principal (haz clic para filtrar la lista abajo):</h4>
        <div class="dashboard-stats-grid">
          
          <div class="metric-card" style="cursor: pointer;" onclick="app.switchStatsTab('aptitudes')">
            <div>
              <div class="metric-header">
                <span class="metric-title">📊 Test de Aptitudes</span>
                <span class="badge-score ${aptitudesGrade !== '-' && parseFloat(aptitudesGrade) >= 5 ? 'pass' : 'fail'}">${aptitudesGrade}</span>
              </div>
              <div class="metric-value">${aptCovPct}%</div>
              <div class="metric-sub">${uniqueAptitudes.size} de ${aptitudesQuestions.length} preguntas practicadas</div>
            </div>
            <div class="metric-progress-bar">
              <div class="metric-progress-fill" style="width: ${aptCovPct}%;"></div>
            </div>
            <div style="font-size: 0.8rem; font-weight: 700; color: var(--aena-navy); margin-top: 6px; text-align: right;">Ver y filtrar por Aptitudes →</div>
          </div>

          <div class="metric-card" style="cursor: pointer;" onclick="app.switchStatsTab('ingles')">
            <div>
              <div class="metric-header">
                <span class="metric-title">✈️ Test de Inglés</span>
                <span class="badge-score ${inglesGrade !== '-' && parseFloat(inglesGrade) >= 5 ? 'pass' : 'fail'}">${inglesGrade}</span>
              </div>
              <div class="metric-value">${ingCovPct}%</div>
              <div class="metric-sub">${uniqueIngles.size} de ${inglesQuestions.length} preguntas practicadas</div>
            </div>
            <div class="metric-progress-bar">
              <div class="metric-progress-fill" style="width: ${ingCovPct}%;"></div>
            </div>
            <div style="font-size: 0.8rem; font-weight: 700; color: var(--aena-navy); margin-top: 6px; text-align: right;">Ver y filtrar por Inglés →</div>
          </div>

        </div>
      `;
    } else if (this.activeStatsTab === 'aptitudes') {
      const aptCovPct = aptitudesQuestions.length > 0 ? ((uniqueAptitudes.size / aptitudesQuestions.length) * 100).toFixed(1) : 0;
      const aptTipos = ['Razonamiento Verbal', 'Razonamiento Numérico', 'Razonamiento Lógico-Abstracto'];

      html = `
        <div style="background-color: var(--aena-lime-light); border: 1px solid var(--aena-lime-border); border-radius: var(--radius-md); padding: 18px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
            <div>
              <h3 style="font-size: 1.1rem; color: var(--aena-navy); font-weight: 800;">📊 Categoría: Test de Aptitudes</h3>
              <p style="font-size: 0.85rem; color: var(--text-muted);">Cobertura: ${uniqueAptitudes.size}/${aptitudesQuestions.length} preguntas (${aptCovPct}%)</p>
            </div>
            <span class="badge-score ${aptitudesGrade !== '-' && parseFloat(aptitudesGrade) >= 5 ? 'pass' : 'fail'}" style="font-size: 1.2rem; padding: 4px 12px;">
              Score Aptitudes: ${aptitudesGrade}
            </span>
          </div>
        </div>

        <h4 style="font-size: 1rem; font-weight: 700; color: var(--aena-navy); margin-bottom: 12px;">Sub-apartados de Aptitudes (haz clic en cualquiera para filtrar la tabla abajo):</h4>
        <div class="dashboard-stats-grid">
      `;

      aptTipos.forEach(tipo => {
        const dbQs = aptitudesQuestions.filter(q => q.tipo === tipo);
        const dbCount = dbQs.length;
        const ansCount = uniqueByTipo[tipo] ? uniqueByTipo[tipo].size : 0;
        const pct = dbCount > 0 ? ((ansCount / dbCount) * 100).toFixed(0) : 0;
        const grade = calcGrade(accByTipo[tipo]);
        const isSelectedSub = this.activeSubFilter === tipo;

        const subtipos = [...new Set(dbQs.map(q => q.subtipo))];
        let subtiposHtml = '';
        subtipos.forEach(st => {
          const stAns = uniqueBySubtipo[st] ? uniqueBySubtipo[st].size : 0;
          const stTotal = dbQs.filter(q => q.subtipo === st).length;
          subtiposHtml += `<div style="font-size: 0.78rem; color: var(--text-muted); display: flex; justify-content: space-between; margin-top: 2px;"><span>- ${st}</span> <span>${stAns}/${stTotal}</span></div>`;
        });

        html += `
          <div class="metric-card" style="cursor: pointer; ${isSelectedSub ? 'border: 2px solid var(--aena-navy); background-color: #f0fdf4;' : ''}" onclick="app.filterBySubApartado('${tipo}')">
            <div>
              <div class="metric-header">
                <span class="metric-title">${tipo} ${isSelectedSub ? '🔍' : ''}</span>
                <span class="badge-score ${grade !== '-' && parseFloat(grade) >= 5 ? 'pass' : 'fail'}" style="font-size: 0.8rem;">${grade}</span>
              </div>
              <div class="metric-value">${pct}%</div>
              <div class="metric-sub">${ansCount} de ${dbCount} preguntas practicadas</div>
              <div class="metric-progress-bar">
                <div class="metric-progress-fill" style="width: ${pct}%;"></div>
              </div>
              <div style="margin-top: 10px; border-top: 1px dashed var(--border-color); padding-top: 6px;">
                <div style="font-size: 0.8rem; font-weight: 700; color: var(--aena-navy);">Subtipos:</div>
                ${subtiposHtml}
              </div>
              <div style="font-size: 0.8rem; font-weight: 700; color: var(--aena-navy); margin-top: 8px; text-align: right;">
                ${isSelectedSub ? '✔️ Filtro Aplicado' : '🔍 Filtrar Tabla Abajo'}
              </div>
            </div>
          </div>
        `;
      });

      html += `</div>`;
    } else if (this.activeStatsTab === 'ingles') {
      const ingCovPct = inglesQuestions.length > 0 ? ((uniqueIngles.size / inglesQuestions.length) * 100).toFixed(1) : 0;
      const ingTipos = ['Listening', 'Gramática'];

      html = `
        <div style="background-color: var(--aena-lime-light); border: 1px solid var(--aena-lime-border); border-radius: var(--radius-md); padding: 18px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
            <div>
              <h3 style="font-size: 1.1rem; color: var(--aena-navy); font-weight: 800;">✈️ Categoría: Test de Inglés</h3>
              <p style="font-size: 0.85rem; color: var(--text-muted);">Cobertura: ${uniqueIngles.size}/${inglesQuestions.length} preguntas (${ingCovPct}%)</p>
            </div>
            <span class="badge-score ${inglesGrade !== '-' && parseFloat(inglesGrade) >= 5 ? 'pass' : 'fail'}" style="font-size: 1.2rem; padding: 4px 12px;">
              Score Inglés: ${inglesGrade}
            </span>
          </div>
        </div>

        <h4 style="font-size: 1rem; font-weight: 700; color: var(--aena-navy); margin-bottom: 12px;">Sub-apartados de Inglés (haz clic en cualquiera para filtrar la tabla abajo):</h4>
        <div class="dashboard-stats-grid">
      `;

      ingTipos.forEach(tipo => {
        const dbQs = inglesQuestions.filter(q => q.tipo === tipo);
        const dbCount = dbQs.length;
        const ansCount = uniqueByTipo[tipo] ? uniqueByTipo[tipo].size : 0;
        const pct = dbCount > 0 ? ((ansCount / dbCount) * 100).toFixed(0) : 0;
        const grade = calcGrade(accByTipo[tipo]);
        const isSelectedSub = this.activeSubFilter === tipo;

        const subtipos = [...new Set(dbQs.map(q => q.subtipo))];
        let subtiposHtml = '';
        subtipos.forEach(st => {
          const stAns = uniqueBySubtipo[st] ? uniqueBySubtipo[st].size : 0;
          const stTotal = dbQs.filter(q => q.subtipo === st).length;
          subtiposHtml += `<div style="font-size: 0.78rem; color: var(--text-muted); display: flex; justify-content: space-between; margin-top: 2px;"><span>- ${st}</span> <span>${stAns}/${stTotal}</span></div>`;
        });

        html += `
          <div class="metric-card" style="cursor: pointer; ${isSelectedSub ? 'border: 2px solid var(--aena-navy); background-color: #f0fdf4;' : ''}" onclick="app.filterBySubApartado('${tipo}')">
            <div>
              <div class="metric-header">
                <span class="metric-title">${tipo} ${isSelectedSub ? '🔍' : ''}</span>
                <span class="badge-score ${grade !== '-' && parseFloat(grade) >= 5 ? 'pass' : 'fail'}" style="font-size: 0.8rem;">${grade}</span>
              </div>
              <div class="metric-value">${pct}%</div>
              <div class="metric-sub">${ansCount} de ${dbCount} preguntas practicadas</div>
              <div class="metric-progress-bar">
                <div class="metric-progress-fill" style="width: ${pct}%;"></div>
              </div>
              <div style="margin-top: 10px; border-top: 1px dashed var(--border-color); padding-top: 6px;">
                <div style="font-size: 0.8rem; font-weight: 700; color: var(--aena-navy);">Subtipos:</div>
                ${subtiposHtml}
              </div>
              <div style="font-size: 0.8rem; font-weight: 700; color: var(--aena-navy); margin-top: 8px; text-align: right;">
                ${isSelectedSub ? '✔️ Filtro Aplicado' : '🔍 Filtrar Tabla Abajo'}
              </div>
            </div>
          </div>
        `;
      });

      html += `</div>`;
    }

    container.innerHTML = html;
  },

  viewPastExamDetail(examId) {
    const history = JSON.parse(localStorage.getItem('aena_exam_history_v2') || '[]');
    const exam = history.find(e => e.id === examId);

    if (!exam) {
      alert('Examen no encontrado.');
      return;
    }

    document.getElementById('past-exam-title').textContent = `Revisión: ${exam.title}`;
    document.getElementById('past-exam-meta-banner').innerHTML = `
      Fecha: <strong>${exam.date}</strong> | Modo: <strong>${exam.mode}</strong> | Nota: <strong style="color: var(--aena-lime-dark);">${exam.score} / 10</strong> 
      (Aciertos: ${exam.correct}, Fallos: ${exam.wrong}, Blancos: ${exam.blank})
    `;

    const container = document.getElementById('past-exam-questions-list');
    container.innerHTML = '';

    exam.questions.forEach((q, idx) => {
      const userAns = exam.userAnswers[idx];
      const isCorrect = userAns === q.respuesta_correcta;
      const isBlank = !userAns;

      let statusClass = 'is-correct';
      let statusText = '✅ CORRECTA';

      if (isBlank) {
        statusClass = 'is-blank';
        statusText = '⚪ SIN RESPONDER';
      } else if (!isCorrect) {
        statusClass = 'is-wrong';
        statusText = '❌ INCORRECTA';
      }

      const item = document.createElement('div');
      item.className = `review-item ${statusClass}`;
      item.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-weight: 700; font-size: 0.9rem;">Pregunta ${idx + 1} (${q.tipo} - ${q.subtipo})</span>
          <span class="badge" style="background-color: white; border: 1px solid var(--border-color);">${statusText}</span>
        </div>
        <div style="font-weight: 600; margin-bottom: 10px;">${q.pregunta}</div>
        <div style="font-size: 0.9rem; margin-bottom: 8px;">
          <strong>Tu respuesta elegida en este examen:</strong> ${userAns ? `${userAns}) ${q[`opcion_${userAns.toLowerCase()}`]}` : '<em>No respondida</em>'}<br>
          <strong>Respuesta correcta:</strong> <span style="color: var(--color-success); font-weight: 700;">${q.respuesta_correcta}) ${q[`opcion_${q.respuesta_correcta.toLowerCase()}`]}</span>
        </div>
        <div class="explanation-box">
          <div class="explanation-title">💡 Explicación Técnica:</div>
          <div>${q.explicacion}</div>
        </div>
      `;
      container.appendChild(item);
    });

    this.showView('past-exam-detail');
  },

  repeatOnlyErrors(examId) {
    const history = JSON.parse(localStorage.getItem('aena_exam_history_v2') || '[]');
    const exam = history.find(e => e.id === examId);

    if (!exam) return;

    const failedQuestions = exam.questions.filter((q, idx) => {
      const ans = exam.userAnswers[idx];
      return ans && ans !== q.respuesta_correcta;
    });

    if (failedQuestions.length === 0) {
      alert('Este examen no tiene preguntas falladas.');
      return;
    }

    this.mode = 'practica';
    this.launchTestEngine(failedQuestions, `Repetición de Fallos (${failedQuestions.length} Preguntas)`);
  },

  confirmResetAllData() {
    if (confirm('⚠️ ¿Estás seguro de que deseas borrar TODOS los exámenes pasados y resetear tus datos e historial?\n\nEsta acción no se puede deshacer.')) {
      localStorage.removeItem('aena_exam_history_v2');
      localStorage.removeItem('aena_test_history');
      alert('Se han borrado todos los datos del historial correctamente.');
      this.renderHistoryCorrections();
    }
  },

  shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
