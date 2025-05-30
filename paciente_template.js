document.addEventListener("DOMContentLoaded", () => {
    console.log('👤 Página do paciente carregada');

    // Carregar modo escuro
    if (localStorage.getItem('dark-mode') === 'true') {
        document.body.classList.add('dark-mode');
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) themeToggle.textContent = '☀️';
    }

    // Botão de tema
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            themeToggle.textContent = isDark ? '☀️' : '🌙';
            localStorage.setItem('dark-mode', isDark);
        });
    }

    // Elementos da página
    const patientPhotoElement = document.getElementById("patient-photo");
    const patientNameElement = document.getElementById("patient-name");
    const fichasDiv = document.getElementById("fichas");
    const newFichaTextarea = document.getElementById("new-ficha");
    const saveFichaButton = document.getElementById("save-ficha");
    const backToListButton = document.getElementById("back-to-list");
    const editPhotoInput = document.getElementById("edit-photo");
    const customPhotoBtn = document.getElementById("custom-photo-btn");
    const updatePhotoButton = document.getElementById("update-photo");

    // Elementos de atividades
    const criarAtividadeBtn = document.getElementById("criar-atividade");
    const verAtividadesBtn = document.getElementById("ver-atividades");
    const modalCriarAtividade = document.getElementById("modal-criar-atividade");
    const modalVerAtividades = document.getElementById("modal-ver-atividades");

    // Obter o nome do paciente da URL
    const urlParams = new URLSearchParams(window.location.search);
    const patientName = urlParams.get("name");

    if (!patientName) {
        console.error('❌ Nome do paciente não encontrado na URL');
        alert('Erro: Paciente não especificado');
        window.location.href = "index.html";
        return;
    }

    console.log('🔍 Procurando paciente:', patientName);

    // Carregar pacientes do LocalStorage
    let savedPatients = [];
    try {
        const patientsData = localStorage.getItem("patients");
        if (patientsData) {
            savedPatients = JSON.parse(patientsData);
            console.log('📊 Total de pacientes:', savedPatients.length);
        }
    } catch (error) {
        console.error('❌ Erro ao carregar pacientes:', error);
        savedPatients = [];
    }

    let patient = savedPatients.find(p => p.name === patientName);

    if (!patient) {
        console.error('❌ Paciente não encontrado:', patientName);
        console.log('📋 Pacientes disponíveis:', savedPatients.map(p => p.name));
        alert('Erro: Paciente não encontrado');
        window.location.href = "index.html";
        return;
    }

    // Inicialize arrays se não existirem (apenas fichas - atividades agora são globais)
    if (!patient.fichas) patient.fichas = [];
    if (!patient.customData) patient.customData = [];

    console.log('✅ Paciente carregado:', patient.name, 'com', patient.fichas.length, 'fichas');

    // SISTEMA DE ATIVIDADES GLOBAIS
    function carregarAtividadesGlobais() {
        try {
            const atividadesData = localStorage.getItem("atividades_globais");
            if (atividadesData) {
                return JSON.parse(atividadesData);
            }
            return [];
        } catch (error) {
            console.error('❌ Erro ao carregar atividades globais:', error);
            return [];
        }
    }

    function salvarAtividadesGlobais(atividades) {
        try {
            localStorage.setItem("atividades_globais", JSON.stringify(atividades));
            console.log('💾 Atividades globais salvas:', atividades.length);
            
            // Atualizar indicador de storage se existir
            if (typeof updateStorageIndicator === 'function') {
                updateStorageIndicator();
            }
        } catch (error) {
            console.error('❌ Erro ao salvar atividades globais:', error);
            alert('Erro ao salvar. Espaço de armazenamento pode estar cheio.');
        }
    }

    // Exibir nome e foto
    if (patientNameElement) {
        patientNameElement.textContent = patient.name;
        console.log('📝 Nome exibido:', patient.name);
    }
    
    if (patientPhotoElement) {
        patientPhotoElement.src = patient.photo || "imagens/default-patient.jpg";
        console.log('🖼️ Foto carregada');
    }

    // FUNÇÃO PARA SALVAR PACIENTE
    function salvarPaciente() {
        try {
            console.log('💾 Salvando paciente...');
            const patientIndex = savedPatients.findIndex(p => p.name === patientName);
            
            if (patientIndex !== -1) {
                savedPatients[patientIndex] = patient;
                localStorage.setItem("patients", JSON.stringify(savedPatients));
                console.log('✅ Paciente salvo com sucesso');
                
                // Atualizar indicador de storage se existir
                if (typeof updateStorageIndicator === 'function') {
                    updateStorageIndicator();
                }
            } else {
                console.error('❌ Índice do paciente não encontrado');
            }
        } catch (error) {
            console.error('❌ Erro ao salvar paciente:', error);
            alert('Erro ao salvar. Espaço de armazenamento pode estar cheio.');
        }
    }

    // FUNÇÃO PARA RENDERIZAR FICHAS (mantida igual)
    function renderFichas() {
        console.log('📄 Renderizando fichas...');
        
        if (!fichasDiv) {
            console.error('❌ Div de fichas não encontrada');
            return;
        }
        
        fichasDiv.innerHTML = '';
        const fichas = patient.fichas || [];
        
        console.log('📊 Total de fichas:', fichas.length);
        
        if (fichas.length === 0) {
            fichasDiv.innerHTML = '<p style="color: #666; font-style: italic; padding: 20px; text-align: center;">Nenhuma ficha registrada ainda.</p>';
            return;
        }
        
        fichas.forEach((ficha, index) => {
            const fichaDiv = document.createElement('div');
            fichaDiv.className = 'ficha-item';
            
            fichaDiv.innerHTML = `
                <div class="ficha-header">
                    <div class="ficha-info">
                        <strong>Ficha ${index + 1}</strong>
                    </div>
                </div>
                <div class="ficha-content">
                    <div class="ficha-text"></div>
                    <div class="ficha-actions">
                        <button onclick="editarFicha(${index})" title="Editar">✏️</button>
                        <button onclick="removerFicha(${index})" title="Remover">🗑️</button>
                    </div>
                </div>
            `;
            
            // Definir o texto preservando quebras de linha
            const fichaTextDiv = fichaDiv.querySelector('.ficha-text');
            fichaTextDiv.textContent = ficha.text;
            
            fichasDiv.appendChild(fichaDiv);
        });
        
        console.log('✅ Fichas renderizadas:', fichas.length);
    }

    // FUNÇÕES GLOBAIS PARA EDITAR/REMOVER FICHAS (mantidas iguais)
    window.editarFicha = function(index) {
        console.log('✏️ Editando ficha:', index);
        
        const fichas = patient.fichas || [];
        const ficha = fichas[index];
        
        if (!ficha || !newFichaTextarea) {
            console.error('❌ Erro ao editar ficha:', index);
            alert('Erro ao editar ficha');
            return;
        }
        
        // Colocar texto da ficha no textarea
        newFichaTextarea.value = ficha.text;
        newFichaTextarea.focus();
        
        // Remover a ficha atual (será substituída ao salvar)
        patient.fichas.splice(index, 1);
        salvarPaciente();
        renderFichas();
        
        // Feedback visual
        newFichaTextarea.style.background = '#fff3cd';
        setTimeout(() => {
            newFichaTextarea.style.background = '';
        }, 2000);
        
        console.log('✅ Ficha colocada para edição');
    };

    window.removerFicha = function(index) {
        console.log('🗑️ Removendo ficha:', index);
        
        const ficha = patient.fichas[index];
        if (!ficha) {
            console.error('❌ Ficha não encontrada:', index);
            return;
        }
        
        const textoPreview = ficha.text.length > 50 ? 
            ficha.text.substring(0, 50) + '...' : 
            ficha.text;
            
        if (confirm(`Tem certeza que deseja remover esta ficha?\n\n"${textoPreview}"`)) {
            patient.fichas.splice(index, 1);
            salvarPaciente();
            renderFichas();
            
            console.log('✅ Ficha removida com sucesso');
        }
    };

    // SISTEMA DE ATIVIDADES GLOBAIS
    function criarModalCriarAtividade() {
        console.log('🔧 Criando modal criar atividade...');
        
        if (!modalCriarAtividade) {
            console.error('❌ Element modalCriarAtividade não encontrado!');
            return;
        }
        
        modalCriarAtividade.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🎯 Criar Nova Atividade</h3>
                    <button class="close-btn" id="close-criar-atividade">&times;</button>
                </div>
                <div class="modal-body">
                    <input type="text" id="atividade-nome" placeholder="Nome da atividade..." maxlength="50">
                    <textarea id="atividade-texto" placeholder="Descrição da atividade..." rows="4"></textarea>
                    <div class="modal-buttons">
                        <button class="btn-cancelar" id="cancelar-atividade">Cancelar</button>
                        <button class="btn-salvar" id="salvar-atividade">Salvar Atividade</button>
                    </div>
                </div>
            </div>
        `;

        // Event listeners do modal
        const closeBtn = modalCriarAtividade.querySelector('#close-criar-atividade');
        const cancelarBtn = modalCriarAtividade.querySelector('#cancelar-atividade');
        const salvarBtn = modalCriarAtividade.querySelector('#salvar-atividade');
        const nomeInput = modalCriarAtividade.querySelector('#atividade-nome');
        const textoTextarea = modalCriarAtividade.querySelector('#atividade-texto');

        function fecharModal() {
            modalCriarAtividade.classList.add('hidden');
            nomeInput.value = '';
            textoTextarea.value = '';
        }

        closeBtn.addEventListener('click', fecharModal);
        cancelarBtn.addEventListener('click', fecharModal);

        salvarBtn.addEventListener('click', () => {
            const nome = nomeInput.value.trim();
            const texto = textoTextarea.value.trim();

            console.log('💾 Tentando salvar atividade:', { nome, texto });

            if (!nome) {
                alert('Por favor, digite um nome para a atividade.');
                nomeInput.focus();
                return;
            }

            if (!texto) {
                alert('Por favor, digite uma descrição para a atividade.');
                textoTextarea.focus();
                return;
            }

            // Carregar atividades globais atuais
            const atividadesGlobais = carregarAtividadesGlobais();

            // Criar nova atividade
            const novaAtividade = {
                id: Date.now(),
                nome: nome,
                texto: texto,
                timestamp: Date.now(),
                date: new Date().toLocaleDateString('pt-BR'),
                completed: false,
                criadoPor: patientName, // Adicionar quem criou a atividade
                criadoEm: new Date().toLocaleString('pt-BR')
            };

            console.log('📝 Nova atividade criada:', novaAtividade);
            console.log('📊 Atividades globais antes:', atividadesGlobais.length);

            atividadesGlobais.push(novaAtividade);
            salvarAtividadesGlobais(atividadesGlobais);
            
            console.log('📊 Atividades globais depois:', atividadesGlobais.length);

            // Feedback
            salvarBtn.textContent = '✅ Salvo!';
            salvarBtn.style.background = '#4caf50';

            setTimeout(() => {
                fecharModal();
                salvarBtn.textContent = 'Salvar Atividade';
                salvarBtn.style.background = '';
            }, 1500);

            console.log('✅ Atividade global salva com sucesso:', nome);
        });

        // Fechar modal clicando fora
        modalCriarAtividade.addEventListener('click', (e) => {
            if (e.target === modalCriarAtividade) {
                fecharModal();
            }
        });
        
        console.log('✅ Modal criar atividade configurado');
    }

    function criarModalVerAtividades() {
        console.log('🔧 Criando modal ver atividades...');
        
        if (!modalVerAtividades) {
            console.error('❌ Element modalVerAtividades não encontrado!');
            return;
        }
        
        const atividadesGlobais = carregarAtividadesGlobais();
        
        modalVerAtividades.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🌐 Minhas Atividades (${atividadesGlobais.length})</h3>
                    <button class="close-btn" id="close-ver-atividades">&times;</button>
                </div>
                <div class="modal-body">
                    <div id="lista-atividades"></div>
                    <div class="modal-buttons" style="margin-top: 20px;">
                        <button class="btn-cancelar" id="fechar-atividades">Fechar</button>
                    </div>
                </div>
            </div>
        `;

        const closeBtn = modalVerAtividades.querySelector('#close-ver-atividades');
        const fecharBtn = modalVerAtividades.querySelector('#fechar-atividades');
        const listaDiv = modalVerAtividades.querySelector('#lista-atividades');

        function fecharModal() {
            modalVerAtividades.classList.add('hidden');
        }

        function renderizarAtividades() {
            console.log('🎨 Renderizando atividades globais...');
            const atividades = carregarAtividadesGlobais();
            
            console.log('📊 Atividades para renderizar:', atividades.length);
            console.log('📋 Lista de atividades:', atividades);
            
            if (atividades.length === 0) {
                listaDiv.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Nenhuma atividade criada ainda.</p>';
                return;
            }

            listaDiv.innerHTML = '';
            
            // Ordenar por mais recente primeiro
            atividades.sort((a, b) => b.timestamp - a.timestamp);
            
            atividades.forEach((atividade, index) => {
                console.log(`📝 Renderizando atividade ${index}:`, atividade);
                
                const atividadeDiv = document.createElement('div');
                atividadeDiv.className = 'atividade-item';
                atividadeDiv.innerHTML = `
                    <div class="atividade-nome">${atividade.nome}</div>
                    <div class="atividade-texto">${atividade.texto}</div>
                    <div style="margin-top: 8px; font-size: 11px; color: #999;">
                        Criada em: ${atividade.date} | Por: ${atividade.criadoPor || 'Sistema'}
                        <button onclick="removerAtividadeGlobal(${atividade.id})" title="Remover" style="
                            float: right; 
                            background: #dc3545; 
                            color: white; 
                            border: none; 
                            border-radius: 3px; 
                            padding: 2px 6px; 
                            font-size: 10px; 
                            cursor: pointer;
                        ">🗑️</button>
                    </div>
                `;
                listaDiv.appendChild(atividadeDiv);
            });
            
            console.log('✅ Atividades globais renderizadas:', atividades.length);
        }

        closeBtn.addEventListener('click', fecharModal);
        fecharBtn.addEventListener('click', fecharModal);

        // Fechar modal clicando fora
        modalVerAtividades.addEventListener('click', (e) => {
            if (e.target === modalVerAtividades) {
                fecharModal();
            }
        });

        // Renderizar atividades
        renderizarAtividades();

        // Função global para remover atividade
        window.removerAtividadeGlobal = function(atividadeId) {
            console.log('🗑️ Removendo atividade global:', atividadeId);
            
            const atividades = carregarAtividadesGlobais();
            const atividade = atividades.find(a => a.id === atividadeId);
            
            if (!atividade) {
                console.error('❌ Atividade não encontrada:', atividadeId);
                return;
            }

            if (confirm(`Tem certeza que deseja remover a atividade "${atividade.nome}"?`)) {
                const novasAtividades = atividades.filter(a => a.id !== atividadeId);
                salvarAtividadesGlobais(novasAtividades);
                renderizarAtividades();
                console.log('✅ Atividade global removida:', atividade.nome);
            }
        };
        
        console.log('✅ Modal ver atividades globais configurado');
    }

    // Event listeners para atividades
    if (criarAtividadeBtn) {
        criarAtividadeBtn.addEventListener('click', () => {
            console.log('🎯 Abrindo modal criar atividade');
            if (!modalCriarAtividade) {
                console.error('❌ Modal criar atividade não encontrado!');
                return;
            }
            criarModalCriarAtividade();
            modalCriarAtividade.classList.remove('hidden');
        });
    } else {
        console.error('❌ Botão criar atividade não encontrado!');
    }

    if (verAtividadesBtn) {
        verAtividadesBtn.addEventListener('click', () => {
            console.log('📋 Abrindo modal ver atividades globais');
            const atividadesGlobais = carregarAtividadesGlobais();
            console.log('📊 Atividades globais:', atividadesGlobais);
            
            if (!modalVerAtividades) {
                console.error('❌ Modal ver atividades não encontrado!');
                return;
            }
            criarModalVerAtividades();
            modalVerAtividades.classList.remove('hidden');
        });
    } else {
        console.error('❌ Botão ver atividades não encontrado!');
    }

    // SALVAR NOVA FICHA (mantido igual)
    if (saveFichaButton && newFichaTextarea) {
        saveFichaButton.addEventListener('click', () => {
            console.log('💾 Salvando nova ficha...');
            
            const fichaText = newFichaTextarea.value.trim();
            
            if (!fichaText) {
                alert('Por favor, escreva algo na ficha antes de salvar.');
                return;
            }
            
            const novaFicha = {
                text: fichaText,
                timestamp: Date.now(),
                date: new Date().toLocaleDateString('pt-BR')
            };
            
            // Adicionar à lista de fichas
            patient.fichas.push(novaFicha);
            salvarPaciente();
            
            // Limpar textarea
            newFichaTextarea.value = '';
            
            // Renderizar novamente
            renderFichas();
            
            // Feedback visual
            const originalText = saveFichaButton.textContent;
            const originalBg = saveFichaButton.style.background;
            
            saveFichaButton.textContent = '✅ Salvo!';
            saveFichaButton.style.background = '#4caf50';
            
            setTimeout(() => {
                saveFichaButton.textContent = originalText;
                saveFichaButton.style.background = originalBg;
            }, 2000);
            
            console.log('✅ Nova ficha salva');
        });
    } else {
        console.warn('⚠️ Botão de salvar ou textarea não encontrados');
    }

    // ATUALIZAR FOTO DO PACIENTE (mantido igual)
    if (updatePhotoButton && editPhotoInput) {
        updatePhotoButton.addEventListener("click", async () => {
            const file = editPhotoInput.files[0];
            if (!file) {
                alert("Selecione uma nova foto para atualizar.");
                return;
            }
            
            try {
                // Mostrar indicador de carregamento (opcional)
                updatePhotoButton.textContent = "Processando...";
                updatePhotoButton.disabled = true;
                
                // Processar a imagem
                const processedImage = await processImage(file);
                
                // Atualizar o paciente com a imagem processada
                patient.photo = processedImage;
                if (patientPhotoElement) patientPhotoElement.src = processedImage;
                
                // Salvar no localStorage
                salvarPaciente();
                
                // Feedback de sucesso
                updatePhotoButton.textContent = "✅ Atualizado!";
                setTimeout(() => {
                    updatePhotoButton.textContent = "Atualizar Foto";
                    updatePhotoButton.disabled = false;
                }, 2000);
            } catch (error) {
                console.error('❌ Erro ao processar imagem:', error);
                alert('Erro ao processar imagem. Tente novamente.');
                updatePhotoButton.textContent = "Atualizar Foto";
                updatePhotoButton.disabled = false;
            }
        });
    }

    // BOTÃO PERSONALIZADO PARA FOTO (mantido igual)
    if (customPhotoBtn && editPhotoInput) {
        customPhotoBtn.addEventListener("click", () => {
            editPhotoInput.click();
        });
    }

    // VOLTAR PARA LISTA (mantido igual)
    if (backToListButton) {
        backToListButton.addEventListener("click", () => {
            window.location.href = "index.html";
        });
    }

    // CARD DE LEMBRETE SIMPLIFICADO (mantido igual)
    function initReminderCard() {
        const reminderCard = document.getElementById('reminder-card');
        const closeBtn = document.getElementById('close-reminder');
        const markDoneBtn = document.getElementById('mark-consultation-done');
        const lastConsultationInfo = document.getElementById('last-consultation-info');

        if (!reminderCard || !lastConsultationInfo) {
            console.warn('⚠️ Elementos do card de lembrete não encontrados');
            return;
        }

        // Função simplificada para atualizar info
        function updateLastConsultationInfo() {
            lastConsultationInfo.innerHTML = `
                <strong>📋 Informações da consulta</strong><br>
                <span style="color: #666;">Sistema de consultas não ativo</span>
            `;
            
            if (markDoneBtn) markDoneBtn.style.display = 'none';
        }

        // Event Listeners
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                reminderCard.classList.add('hidden');
                localStorage.setItem('reminder_hidden', 'true');
            });
        }

        // Verificar se card deve ser mostrado
        const isHidden = localStorage.getItem('reminder_hidden') === 'true';
        if (isHidden) {
            reminderCard.classList.add('hidden');
        }

        // Atualizar info inicial
        updateLastConsultationInfo();
    }

    // RENDERIZAR INICIAL E INICIALIZAR
    console.log('🚀 Inicializando componentes...');
    renderFichas();
    initReminderCard();
    
    const atividadesGlobaisCount = carregarAtividadesGlobais().length;
    console.log('🎯 Página do paciente inicializada com sucesso');
    console.log('🌐 Atividades globais disponíveis:', atividadesGlobaisCount);
});

// Adicione esta função no início do seu arquivo após o DOMContentLoaded
function processImage(file, maxWidth = 800, maxHeight = 600, quality = 0.7) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(event) {
            const img = new Image();
            
            img.onload = function() {
                // Calcular as novas dimensões mantendo a proporção
                let width = img.width;
                let height = img.height;
                
                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }
                
                // Criar canvas para redimensionar
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                
                // Desenhar imagem redimensionada
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Converter para formato comprimido
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                
                // Log para debug
                const originalSize = Math.round(file.size / 1024);
                const newSize = Math.round((dataUrl.length * 0.75) / 1024);
                console.log(`Imagem redimensionada: ${originalSize}KB → ${newSize}KB (${Math.round(newSize/originalSize*100)}%)`);
                
                resolve(dataUrl);
            };
            
            img.onerror = reject;
            img.src = event.target.result;
        };
        
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}