
const API_TOKEN = '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';
const COMMON_CORE_MAX = 11;

let currentUser = null;

// Event listeners
document.getElementById('loadBtn').addEventListener('click', loadProgress);
document.getElementById('username').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        loadProgress();
    }
});

async function loadProgress() {
    const username = document.getElementById('username').value.trim();
    if (!username) return;
    
    const loadBtn = document.getElementById('loadBtn');
    const errorDiv = document.getElementById('error');
    const setupDiv = document.getElementById('setup');
    const progressContainer = document.getElementById('progressContainer');
    
    // Reset UI
    loadBtn.disabled = true;
    loadBtn.innerHTML = '<span class="loading"></span>';
    errorDiv.innerHTML = '';
    setupDiv.innerHTML = '';
    progressContainer.style.display = 'none';
    
    try {
        const response = await fetch(`https://api.intra.42.fr/v2/users/${username}`, {
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`
            }
        });
        
        if (!response.ok) {
            throw new Error('No se pudieron obtener los datos. Verifica tu token.');
        }
        
        const data = await response.json();
        const cursus = data.cursus_users?.find(c => c.cursus?.slug === '42cursus');
        
        currentUser = {
            login: data.login,
            displayName: data.displayname || data.login,
            level: cursus?.level || 0,
            image: data.image?.versions?.small
        };
        
        renderProgress();
        progressContainer.style.display = 'block';
        
    } catch (error) {
        errorDiv.innerHTML = `
            <div class="error" style="display: block;">
                <p><strong>Error:</strong> ${error.message}</p>
            </div>
        `;
        
        if (API_TOKEN === 'YOUR_ACCESS_TOKEN') {
            setupDiv.innerHTML = `
                <div class="setup-info" style="display: block;">
                    <p><strong>⚠️ Configuración necesaria:</strong></p>
                    <p>1. Ve a <a href="https://profile.intra.42.fr/oauth/applications" target="_blank">profile.intra.42.fr/oauth/applications</a></p>
                    <p>2. Crea una aplicación OAuth</p>
                    <p>3. Reemplaza <code>YOUR_ACCESS_TOKEN</code> en el JavaScript con tu token</p>
                </div>
            `;
        }
    } finally {
        loadBtn.disabled = false;
        loadBtn.textContent = 'Cargar';
    }
}

function renderProgress() {
    if (!currentUser) return;
    
    const progress = (currentUser.level / COMMON_CORE_MAX) * 100;
    const remaining = COMMON_CORE_MAX - currentUser.level;
    
    const progressContainer = document.getElementById('progressContainer');
    
    progressContainer.innerHTML = `
        <div class="user-info">
            ${currentUser.image ? `<img src="${currentUser.image}" alt="${currentUser.displayName}">` : ''}
            <div class="user-details">
                <h2>${currentUser.displayName}</h2>
                <p>@${currentUser.login}</p>
            </div>
            <button class="refresh-btn" onclick="loadProgress()" style="margin-left: auto;">🔄</button>
        </div>
        
        <div class="stats">
            <div class="stat-card current">
                <div class="stat-label">Actual</div>
                <div class="stat-value">${currentUser.level.toFixed(2)}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Objetivo</div>
                <div class="stat-value">${COMMON_CORE_MAX}</div>
            </div>
            <div class="stat-card remaining">
                <div class="stat-label">Faltan</div>
                <div class="stat-value">${remaining.toFixed(2)}</div>
            </div>
        </div>
        
        <div class="progress-section">
            <div class="progress-header">
                <span class="progress-label">Progreso Common Core</span>
                <span class="progress-percentage">${progress.toFixed(1)}%</span>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${Math.min(progress, 100)}%">
                    ${progress > 15 ? `<span class="progress-text">Nivel ${currentUser.level.toFixed(2)}</span>` : ''}
                </div>
            </div>
            <div class="progress-markers">
                <span>Nivel 0</span>
                <span>Nivel ${COMMON_CORE_MAX}</span>
            </div>
        </div>
        
        <div class="message">
            <p>${currentUser.level >= COMMON_CORE_MAX 
                ? '🎉 ¡Felicitaciones! Has completado el Common Core' 
                : `💪 ¡Sigue adelante! Te quedan ${remaining.toFixed(2)} niveles para completar el Common Core`}
            </p>
        </div>
    `;
}
