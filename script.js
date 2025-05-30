/* filepath: c:\Users\dougl\Desktop\Gestão de rotina\script.js */

// ===== VERIFICAÇÃO DE LOGIN SIMPLES =====
// Verificar se está logado apenas ao acessar o index
if (sessionStorage.getItem('logado') !== 'true') {
    window.location.href = 'login.html';
    // Parar execução do resto do script
    throw new Error('Redirecionando para login...');
}

document.addEventListener("DOMContentLoaded", () => {
    console.log('📋 Sistema de pacientes carregado');

    // ===== SISTEMA DE GERENCIAMENTO DO LOCALSTORAGE =====
    
    class StorageManager {
        constructor(key) {
            this.key = key;
        }

        // Obter item do storage
        get() {
            try {
                const value = localStorage.getItem(this.key);
                return value ? JSON.parse(value) : null;
            } catch (error) {
                console.error(`❌ Erro ao obter ${this.key}:`, error);
                return null;
            }
        }

        // Setar item no storage
        set(data) {
            try {
                localStorage.setItem(this.key, JSON.stringify(data));
                console.log(`💾 ${this.key} salvo com sucesso`);
            } catch (error) {
                console.error(`❌ Erro ao salvar ${this.key}:`, error);
            }
        }

        // Remover item do storage
        remove() {
            try {
                localStorage.removeItem(this.key);
                console.log(`🗑️ ${this.key} removido com sucesso`);
            } catch (error) {
                console.error(`❌ Erro ao remover ${this.key}:`, error);
            }
        }

        // Limpar todos os dados do storage
        clear() {
            try {
                localStorage.clear();
                console.log(`🧹 Todos os dados do storage foram limpos`);
            } catch (error) {
                console.error(`❌ Erro ao limpar o storage:`, error);
            }
        }
    }

    // Instância do gerenciador de storage para pacientes
    const patientStorage = new StorageManager('patients');

    // Elementos da página
    const patientList = document.getElementById("patient-list");
    const addPatientForm = document.getElementById("add-patient-form");
    const patientNameInput = document.getElementById("patient-name");
    const patientAgeInput = document.getElementById("patient-age");
    const patientGenderInput = document.getElementById("patient-gender");
    const patientPhotoInput = document.getElementById("patient-photo");

    // ===== SISTEMA DE PACIENTES =====

    // Função para carregar pacientes do LocalStorage
    const loadPatients = () => {
        try {
            const savedPatients = patientStorage.get() || [];
            console.log('📊 Pacientes carregados:', savedPatients.length);
            
            // Limpar lista antes de recarregar
            if (patientList) patientList.innerHTML = '';
            
            savedPatients.forEach((patient) => {
                addPatientToList(patient);
            });
        } catch (error) {
            console.error('❌ Erro ao carregar pacientes:', error);
        }
    };

    // Função para salvar pacientes no LocalStorage
    const savePatients = (patients) => {
        try {
            patientStorage.set(patients);
            
            // Atualizar indicador de storage
            if (typeof updateStorageIndicator === 'function') {
                updateStorageIndicator();
            }
        } catch (error) {
            console.error('❌ Erro ao salvar pacientes:', error);
            alert('Erro ao salvar. Espaço de armazenamento pode estar cheio.');
        }
    };

    // Função para adicionar paciente à lista
    const addPatientToList = (patient) => {
        if (!patientList) return;

        const li = document.createElement("li");

        // Link do paciente
        const patientLink = document.createElement("a");
        patientLink.textContent = `${patient.name} (${patient.age} anos)`;
        patientLink.href = `paciente_template.html?name=${encodeURIComponent(patient.name)}`;
        patientLink.style.cssText = `
            text-decoration: none;
            color: white;
            border: 2px solid black;
            padding: 10px;
            border-radius: 5px;
            background-color: ${patient.gender === "masculino" ? "rgb(95, 151, 200)" : patient.gender === "feminino" ? "#ff69b4" : "#6c757d"};
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 250px;
            height: 80px;
            transition: all 0.3s ease;
        `;

        // Hover effect
        patientLink.addEventListener('mouseenter', () => {
            patientLink.style.transform = 'scale(1.05)';
            patientLink.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
        });

        patientLink.addEventListener('mouseleave', () => {
            patientLink.style.transform = 'scale(1)';
            patientLink.style.boxShadow = 'none';
        });

        // Botão remover
        const removeButton = document.createElement("button");
        removeButton.textContent = "🗑️";
        removeButton.title = "Remover paciente";
        removeButton.style.cssText = `
            margin-left: 10px;
            background: #dc3545;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 8px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.3s ease;
        `;

        removeButton.addEventListener("click", (e) => {
            e.stopPropagation();
            e.preventDefault();

            if (confirm(`Tem certeza que deseja remover o paciente "${patient.name}"?\n\nTodos os dados serão perdidos!`)) {
                const savedPatients = patientStorage.get() || [];
                const updatedPatients = savedPatients.filter((p) => p.name !== patient.name);
                savePatients(updatedPatients);
                li.remove();
                console.log('🗑️ Paciente removido:', patient.name);
            }
        });

        removeButton.addEventListener('mouseenter', () => {
            removeButton.style.background = '#c82333';
            removeButton.style.transform = 'scale(1.1)';
        });

        removeButton.addEventListener('mouseleave', () => {
            removeButton.style.background = '#dc3545';
            removeButton.style.transform = 'scale(1)';
        });

        li.appendChild(patientLink);
        li.appendChild(removeButton);
        li.style.cssText = `
            display: flex;
            align-items: center;
            margin-bottom: 10px;
            padding: 5px;
        `;

        patientList.appendChild(li);
    };

    // Evento de envio do formulário
    if (addPatientForm) {
        addPatientForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const name = patientNameInput?.value.trim();
            const age = patientAgeInput?.value.trim();
            const gender = patientGenderInput?.value;
            const photoFile = patientPhotoInput?.files[0];

            if (!name || !age || !gender) {
                alert('Por favor, preencha todos os campos obrigatórios.');
                return;
            }

            const savedPatients = patientStorage.get() || [];
            
            // Verificar se já existe
            if (savedPatients.find((patient) => patient.name === name)) {
                alert("Paciente já existe!");
                return;
            }

            const processNewPatient = (photoData = null) => {
                const newPatient = { 
                    name, 
                    age, 
                    gender, 
                    photo: photoData, 
                    fichas: [],
                    timestamp: Date.now()
                };
                
                savedPatients.push(newPatient);
                savePatients(savedPatients);
                addPatientToList(newPatient);
                
                // Limpar formulário
                addPatientForm.reset();
                
                console.log('✅ Novo paciente adicionado:', name);
            };

            // Processar com ou sem foto
            if (photoFile) {
                // Validar arquivo
                if (!photoFile.type.startsWith('image/')) {
                    alert('Por favor, selecione apenas arquivos de imagem.');
                    return;
                }

                if (photoFile.size > 2 * 1024 * 1024) { // 2MB limite
                    alert('A imagem deve ter no máximo 2MB.');
                    return;
                }

                const reader = new FileReader();
                reader.onload = (event) => processNewPatient(event.target.result);
                reader.onerror = () => {
                    alert('Erro ao carregar a imagem. Tente novamente.');
                };
                reader.readAsDataURL(photoFile);
            } else {
                processNewPatient();
            }
        });
    }

    // ===== SISTEMA DE LOGO =====

    function initLogoChanger() {
        const mainLogo = document.getElementById('main-logo');
        const logoInput = document.getElementById('logo-input');

        if (!mainLogo || !logoInput) return;

        // Carregar logo salvo
        const savedLogo = localStorage.getItem('main-logo-src');
        if (savedLogo) {
            mainLogo.src = savedLogo;
        }

        // Clique no logo
        mainLogo.addEventListener('click', () => {
            logoInput.click();
        });

        // Alterar logo
        logoInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) return;

            if (!file.type.startsWith('image/')) {
                alert('Por favor, selecione apenas arquivos de imagem.');
                return;
            }

            if (file.size > 1 * 1024 * 1024) { // 1MB limite
                alert('A imagem deve ter no máximo 1MB.');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                mainLogo.src = e.target.result;
                localStorage.setItem('main-logo-src', e.target.result);
                
                // Feedback visual
                mainLogo.style.borderColor = '#4caf50';
                setTimeout(() => {
                    mainLogo.style.borderColor = '';
                }, 2000);

                console.log('🖼️ Logo atualizado');
            };
            reader.readAsDataURL(file);
        });
    }

    // ===== SISTEMA DE TEMA =====

    function initThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        if (!themeToggle) return;

        // Carregar tema salvo
        if (localStorage.getItem('dark-mode') === 'true') {
            document.body.classList.add('dark-mode');
            themeToggle.textContent = '☀️';
        }

        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            
            themeToggle.textContent = isDark ? '☀️' : '🌙';
            localStorage.setItem('dark-mode', isDark);
            
            console.log('🎨 Tema alterado:', isDark ? 'escuro' : 'claro');
        });
    }

    // ===== INICIALIZAÇÃO =====

    loadPatients();
    initLogoChanger();
    initThemeToggle();
    
    // Inicializar indicador de storage
    if (typeof updateStorageIndicator === 'function') {
        updateStorageIndicator();
    }

    console.log('🎯 Sistema inicializado com sucesso');
});

// ===== INDICADOR DE STORAGE =====

function updateStorageIndicator() {
    let totalSize = 0;
    let details = {};
    
    // Calcular tamanho de cada item
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            const value = localStorage.getItem(key);
            const size = new Blob([value]).size;
            totalSize += size;
            
            if (key === 'patients' && value) {
                try {
                    const count = JSON.parse(value).length;
                    details.pacientes = { size, count };
                } catch (e) {
                    details.pacientes = { size, count: 0 };
                }
            }
        }
    }
    
    const limit = 5 * 1024 * 1024; // 5MB
    const usedMB = (totalSize / 1024 / 1024).toFixed(1);
    const percentage = Math.min((totalSize / limit) * 100, 100);
    
    // Atualizar elementos
    const usedElement = document.getElementById('storage-used');
    const progressElement = document.getElementById('storage-progress');
    const indicatorElement = document.getElementById('storage-indicator');
    
    if (usedElement) usedElement.textContent = `${usedMB} MB`;
    
    if (progressElement) {
        progressElement.style.width = `${percentage}%`;
        
        // Remover classes anteriores
        progressElement.classList.remove('low', 'medium', 'high', 'critical');
        
        // Adicionar classe baseada no uso
        if (percentage < 40) {
            progressElement.classList.add('low');
        } else if (percentage < 70) {
            progressElement.classList.add('medium');
        } else if (percentage < 90) {
            progressElement.classList.add('high');
        } else {
            progressElement.classList.add('critical');
        }
    }
    
    // Criar tooltip com detalhes
    let tooltip = `Uso detalhado:\n`;
    if (details.pacientes) {
        tooltip += `👥 ${details.pacientes.count} pacientes: ${(details.pacientes.size / 1024 / 1024).toFixed(1)}MB\n`;
    }
    tooltip += `📊 Total: ${usedMB}MB / 5MB (${percentage.toFixed(1)}%)`;
    
    if (indicatorElement) {
        indicatorElement.setAttribute('data-tooltip', tooltip);
        
        // Clique para mostrar detalhes
        indicatorElement.onclick = function() {
            let detailMessage = `📊 DETALHES DO ARMAZENAMENTO\n\n`;
            detailMessage += `💾 Usado: ${usedMB}MB de 5MB (${percentage.toFixed(1)}%)\n\n`;
            
            if (details.pacientes) {
                detailMessage += `👥 Pacientes: ${details.pacientes.count} itens (${(details.pacientes.size / 1024 / 1024).toFixed(1)}MB)\n`;
            }
            
            const otherSize = totalSize - (details.pacientes?.size || 0);
            detailMessage += `🔧 Outros dados: ${(otherSize / 1024).toFixed(1)}KB`;
            
            if (percentage > 80) {
                detailMessage += `\n\n⚠️ ATENÇÃO: Espaço quase cheio!`;
                detailMessage += `\nConsidere remover alguns pacientes.`;
            }
            
            alert(detailMessage);
        };
    }
    
    console.log(`💾 Storage: ${usedMB}MB (${percentage.toFixed(1)}%)`);
}

// ===== INTERCEPTAR LOCALSTORAGE =====

// Atualizar indicador quando localStorage muda
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
    originalSetItem.apply(this, arguments);
    setTimeout(() => {
        if (typeof updateStorageIndicator === 'function') {
            updateStorageIndicator();
        }
    }, 100);
};

const originalRemoveItem = localStorage.removeItem;
localStorage.removeItem = function(key) {
    originalRemoveItem.apply(this, arguments);
    setTimeout(() => {
        if (typeof updateStorageIndicator === 'function') {
            updateStorageIndicator();
        }
    }, 100);
};

// ===== INICIALIZAÇÃO GLOBAL =====

// Atualizar indicador quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (typeof updateStorageIndicator === 'function') {
            updateStorageIndicator();
        }
    }, 500);
    
    // Atualizar a cada 30 segundos
    setInterval(() => {
        if (typeof updateStorageIndicator === 'function') {
            updateStorageIndicator();
        }
    }, 30000);
});
