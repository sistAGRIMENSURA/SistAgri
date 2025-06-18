// --- CONFIGURACIÓN ---
// ¡¡¡DEBES REEMPLAZAR ESTA URL CON LA URL DE TU APLICACIÓN WEB DE APPS SCRIPT DESPLEGADA!!!
const SCRIPT_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwobqcLH9-DlLhFlO3k0B8LX1beMO-1qCNhDV-JZL4dV4ciLayLLlwLVUoxvlGJL1-vZg/exec';

// Define la estructura de tus secciones principales y sus sub-hojas (pestañas) con sus encabezados.
// Asegúrate de que los nombres de las hojas (claves del objeto 'sheets') y los encabezados
// (valores de los arrays) coincidan EXACTAMENTE con los de tus Google Sheets (mayúsculas, minúsculas, espacios).
const SECTION_HEADERS = {
    "Presupuestos": {
        defaultSheet: "Presupuestos", // Nombre de la hoja por defecto en el archivo de Presupuestos
        sheets: {
            "Presupuesto": [ // Nombre EXACTO de la pestaña en Google Sheets
                "Nombre Cliente", "Celular", "Nomenclatura Catastral",
                "Tipo de Trámite Necesario", "Presupuesto Enviado (Si/No)", "Fecha Envío Presupuesto",
                "Presupuesto Aceptado (Si/No)", "Fecha Aceptación", "Observaciones"
            ]
        }
    },
    "Certificados": {
        defaultSheet: "CertificadosGRAL", // Nombre de la hoja por defecto en el archivo de Certificados
        sheets: {
            "CertificadosGRAL": [ // Nombre EXACTO de la pestaña
                "Nombre Cliente", "Celular", "Nomenclatura Catastral",
                "Fecha de Aceptación Presupuesto", "Medido (Sí/No)", "Fecha Medición",
                "Dibujado (Sí/No)", "Dibujado por", "Fecha Dibujo",
                "Presentado (Sí/No)", "Fecha de Presentación", "Observaciones",
                "Terminado (Sí/No)", "Cobrado (Sí/No)", "Fecha Cobro"
            ],
            "MEDIR": [ // Nombre EXACTO de la pestaña "MEDIR" dentro del archivo "Certificados" (MAYÚSCULAS)
                "Nombre cliente", "Telefono", "nomenclatura", "CERTIFICADO"
            ],
            "DIBUJAR": [ // Nombre EXACTO de la pestaña "DIBUJAR" dentro del archivo "Certificados" (MAYÚSCULAS)
                "Nombre cliente", "Telefono", "nomenclatura", "CERTIFICADO"
            ]
        }
    },
    "Mensuras": {
        defaultSheet: "MensurasGRAL", // Nombre de la hoja por defecto en el archivo de Mensuras
        sheets: {
            "MensurasGRAL": [ // **ENCABEZADOS COMBINADOS ESPERADOS DEL APPS SCRIPT**
                "Nombre Cliente", "Celular", "Nomenclatura Catastral",
                "Fecha de Aceptación Presupuesto", "Medido (Sí/No)", "Fecha Medición",
                "Dibujado (Sí/No)", "Dibujado por:", "Fecha Dibujo",
                "libre deuda municipal", // Columna J (Fila 2)
                "Fecha libre deuda",     // Columna K (Fila 2)
                "Municipal",             // Columna L (Fila 2)
                "Fecha de Presentación", // Columna M (Fila 2)
                "Visto bueno Muni",      // Columna N (Fila 2)
                "Fecha Visto Bueno",     // Columna O (Fila 2)
                "RPI pedido",            // Columna P (Fila 2)
                "RPI recibido",          // Columna Q (Fila 2)
                "SIREC - SOLICITUD Nº",  // Columna R (SIREC - SOLICITUD Nº)
                "SIREC - N EXPEDIENTE",  // Columna S (SIREC - N EXPEDIENTE)
                "SIREC - NOMENCLATURA NUEVA", // Columna T (SIREC - NOMENCLATURA NUEVA)
                "SIREC - ESTADO",        // Columna U (SIREC - ESTADO)
                "SIREC - detalles / observaciones", // Columna V (SIREC - detalles / observaciones)
                "DEFINITIVO - PEDIR NOTA",      // Columna W (DEFINITIVO - PEDIR NOTA)
                "DEFINITIVO - ENTREGA NOTA",    // Columna X (DEFINITIVO - ENTREGA NOTA)
                "DEFINITIVO - LIBRE DEUDA",     // Columna Y (DEFINITIVO - LIBRE DEUDA)
                "DEFINITIVO - CORRECCION DE PLANO", // Columna Z (DEFINITIVO - CORRECCION DE PLANO)
                "DEFINITIVO - PRESENTACION DEFINITIVA", // Columna AA (DEFINITIVO - PRESENTACION DEFINITIVA)
                "DEFINITIVO - FECHA PRESENTACION", // Columna AB (DEFINITIVO - FECHA PRESENTACION)
                "Observaciones",        // Columna AC (Fila 2)
                "Terminado (Sí/No)",    // Columna AD (Fila 2)
                "Fecha Terminación",    // Columna AE (Fila 2)
                "Cobrado (Sí/No)",      // Columna AF (Fila 2)
                "Fecha Cobro"           // Columna AG (Fila 2)
            ],
            "Medir": [ // Nombre EXACTO de la pestaña "MEDIR" dentro del archivo "Mensuras" (MAYÚSCULAS)
                "Nombre cliente", "Telefono", "nomenclatura", "MENSURA"
            ],
            "Dibujar": [ // Nombre EXACTO de la pestaña "DIBUJAR" dentro del archivo "Mensuras" (MAYÚSCULAS)
                "Nombre cliente", "Telefono", "nomenclatura", "MENSURA"
            ]
        }
    }
};

// --- REFERENCIAS DOM ---
const appContainer = document.getElementById('app-container');
const mainNav = document.getElementById('main-nav');
const modal = document.getElementById('modal');
const modalContent = modal.querySelector('.modal-content');
const closeButton = modal.querySelector('.close-button');
const modalTitle = document.getElementById('modalTitle');
const modalForm = document.getElementById('modalForm');
const modalSubmitBtn = document.getElementById('modalSubmitBtn'); // Este botón ahora estará dentro del formulario
const modalMessage = document.getElementById('modalMessage');

// Variables para mantener el estado de la sección y hoja actual
let currentSection = ''; // Ej. "Presupuestos", "Certificados"
let currentSheet = '';   // Ej. "Presupuestos", "CertificadosGRAL", "MEDIR", "DIBUJAR", "MensurasGRAL"

// Variables para paginación (ahora controladas por el frontend basado en la respuesta del backend)
let currentPage = 1;
const itemsPerPage = 10; // Número de elementos por página para Presupuestos
let totalPages = 0; // Se actualizará con la respuesta del backend
let totalRows = 0; // Se actualizará con la respuesta del backend

// --- UTILIDADES ---

/**
 * Muestra un mensaje en un elemento DOM específico.
 * @param {HTMLElement} element El elemento donde mostrar el mensaje.
 * @param {string} message El texto del mensaje.
 * @param {string} type 'success' o 'error'.
 */
function showMessage(element, message, type) {
    element.textContent = message;
    element.className = `message ${type}`;
    element.style.display = 'block';
    setTimeout(() => {
        element.style.display = 'none'; // Oculta el mensaje después de 3 segundos
    }, 3000);
}

/**
 * Formatea una fecha de string a AAAA-MM-DD para compatibilidad con input type="date".
 * Maneja tanto objetos Date como strings de fecha, y valores vacíos.
 * @param {any} dateValue El valor de la fecha (puede ser Date object, string, o null/undefined).
 * @returns {string} Fecha formateada 'YYYY-MM-DD' o cadena vacía si no es una fecha válida.
 */
function formatDateForInput(dateValue) {
    if (!dateValue) return '';

    let date;
    // Apps Script retorna fechas como objetos Date o como strings en formato "dd/mm/yyyy" o "yyyy-mm-dd"
    if (dateValue instanceof Date) {
        date = dateValue;
    } else if (typeof dateValue === 'string') {
        // Intentar parsear "DD/MM/YYYY" a "MM/DD/YYYY" para Date constructor
        const parts = dateValue.split('/');
        if (parts.length === 3) {
            date = new Date(`${parts[1]}/${parts[0]}/${parts[2]}`);
        } else {
            date = new Date(dateValue); // Intenta parsear directamente (ej.聯盟-MM-DD)
        }
    } else {
        return '';
    }

    if (isNaN(date.getTime())) {
        return ''; // Retorna vacío si la fecha es inválida
    }

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}


// --- INTERACCIÓN CON APPS SCRIPT (API) ---

/**
 * Obtiene datos de una hoja específica dentro de una sección.
 * Ahora envía parámetros de paginación para Presupuestos.
 * @param {string} sectionName El nombre de la sección principal (ej. "Presupuestos").
 * @param {string} sheetName El nombre de la pestaña dentro del archivo de Google Sheet (ej. "MEDIR").
 * @returns {Object} Un objeto con 'headers' (array de strings) y 'data' (array de objetos).
 */
async function fetchData(sectionName, sheetName) {
    try {
        let url = `${SCRIPT_WEB_APP_URL}?section=${sectionName}&sheetName=${sheetName}`;

        // Añadir parámetros de paginación si es la sección de Presupuestos
        if (sectionName === "Presupuestos" && sheetName === "Presupuesto") {
            url += `&page=${currentPage}&limit=${itemsPerPage}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Error HTTP! Status: ${response.status}`);
        }
        const result = await response.json();

        if (result.error) {
            throw new Error(result.error);
        }
        return result;
    } catch (error) {
        console.error(`Error al obtener datos de ${sectionName} (${sheetName}):`, error);
        showMessage(appContainer, `Error al cargar los datos: ${error.message}. Por favor, verifica tu conexión o la configuración del script.`, 'error');
        // Para Presupuestos, devuelve también los totales para evitar errores en paginación
        if (sectionName === "Presupuestos" && sheetName === "Presupuesto") {
            return { headers: [], data: [], totalRows: 0, totalPages: 0, currentPage: 1 };
        }
        return { headers: [], data: [] };
    }
}

/**
 * Obtiene los datos consolidados para la landing page.
 * @returns {Object} Un objeto con presupuestosPendientes, trabajosMedir, trabajosDibujar.
 */
async function fetchLandingData() {
    try {
        const response = await fetch(`${SCRIPT_WEB_APP_URL}?action=getLandingData`);
        if (!response.ok) {
            throw new Error(`Error HTTP! Status: ${response.status}`);
        }
        const result = await response.json();
        if (result.error) {
            throw new Error(result.error);
        }
        return result;
    } catch (error) {
        console.error("Error al obtener datos de la landing page:", error);
        showMessage(appContainer, `Error al cargar el resumen: ${error.message}. Verifica logs de Apps Script.`, 'error');
        return { presupuestosPendientes: [], trabajosMedir: [], trabajosDibujar: [] };
    }
}

/**
 * Envía datos a una hoja específica dentro de una sección (añadir o actualizar).
 * @param {string} sectionName La sección principal.
 * @param {string} sheetName La pestaña específica.
 * @param {Object} formData Un objeto con los datos a enviar.
 * @param {number|null} rowIndex El número de fila para actualizar, null para añadir.
 * @returns {Object} La respuesta del servidor (éxito o error).
 */
async function sendData(sectionName, sheetName, formData, rowIndex = null) {
    let url = `${SCRIPT_WEB_APP_URL}?section=${sectionName}&sheetName=${sheetName}`;
    if (rowIndex) {
        url += `&rowIndex=${rowIndex}`;
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        if (!response.ok) {
            throw new Error(`Error HTTP! Status: ${response.status}`);
        }
        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error al enviar datos:", error);
        return { success: false, error: `Error de red al enviar datos: ${error.message}` };
    }
}

// --- RENDERIZADO DE UI ---

/**
 * Renderiza la landing page inicial con el nuevo panel de estado.
 */
async function renderLandingPage() {
    currentSection = ''; // Resetear sección y hoja
    currentSheet = '';

    appContainer.innerHTML = `
        <div class="landing-content">
            <p>Selecciona una sección en el menú superior para ver y administrar tu información.</p>
            <button id="refreshLandingBtn" class="refresh-button">Actualizar Resumen</button> <!-- Nuevo botón -->
            <div class="status-panel">
                <div class="status-column">
                    <h3>Presupuestos Pendientes</h3>
                    <ul id="presupuestos-pendientes-list">
                        <li>Cargando...</li>
                    </ul>
                </div>
                <div class="status-column">
                    <h3>Trabajos por Medir</h3>
                    <ul id="trabajos-medir-list">
                        <li>Cargando...</li>
                    </ul>
                </div>
                <div class="status-column">
                    <h3>Trabajos por Dibujar</h3>
                    <ul id="trabajos-dibujar-list">
                        <li>Cargando...</li>
                    </ul>
                </div>
            </div>
        </div>
    `;

    // AHORA, después de que el HTML está en el DOM, busca los elementos
    const presupuestosList = document.getElementById('presupuestos-pendientes-list');
    const medirList = document.getElementById('trabajos-medir-list');
    const dibujarList = document.getElementById('trabajos-dibujar-list');
    const refreshLandingBtn = document.getElementById('refreshLandingBtn'); // Referencia al nuevo botón

    // Asignar el event listener al botón
    if (refreshLandingBtn) {
        refreshLandingBtn.addEventListener('click', renderLandingPage);
    }

    const landingData = await fetchLandingData(); // Espera la respuesta del Apps Script

    presupuestosList.innerHTML = ''; // Limpia el "Cargando..."
    if (landingData.presupuestosPendientes && landingData.presupuestosPendientes.length > 0) {
        landingData.presupuestosPendientes.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            presupuestosList.appendChild(li);
        });
    } else {
        presupuestosList.innerHTML = '<li>No hay presupuestos pendientes.</li>';
    }

    medirList.innerHTML = '';
    if (landingData.trabajosMedir && landingData.trabajosMedir.length > 0) {
        landingData.trabajosMedir.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.info} / ${item.source}`;
            medirList.appendChild(li);
        });
    } else {
        medirList.innerHTML = '<li>No hay trabajos por medir.</li>';
    }

    dibujarList.innerHTML = '';
    if (landingData.trabajosDibujar && landingData.trabajosDibujar.length > 0) {
        landingData.trabajosDibujar.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.info} / ${item.source}`;
            dibujarList.appendChild(li);
        });
    } else {
        dibujarList.innerHTML = '<li>No hay trabajos por dibujar.</li>';
    }
}

/**
 * Renderiza los campos del formulario dinámicamente.
 * @param {HTMLElement} formElement El elemento <form> donde inyectar los campos.
 * @param {string[]} headers_actuales Los encabezados de la hoja específica actual.
 * @param {Object} [data={}] Datos preexistentes para precargar el formulario (para edición).
 */
function renderFormFields(formElement, headers_actuales, data = {}) {
    formElement.innerHTML = ''; // Limpiar campos existentes

    if (!headers_actuales || headers_actuales.length === 0) {
        formElement.innerHTML = '<p class="message error">Error: No se encontraron encabezados para esta hoja. Verifica la configuración de SECTION_HEADERS en script.js o tu Google Sheet.</p>';
        return;
    }

    headers_actuales.forEach(header => {
        // Excluir metadatos internos y campos específicos que no deben ser editables si los tienes
        if (header === '__rowIndex' || header === '__sheetName' || header === 'SIRECDEFINITIVO') return;

        // Crear un div para agrupar label e input
        const fieldGroup = document.createElement('div');
        fieldGroup.classList.add('form-field-group'); // Clase para estilos de grid internos

        const label = document.createElement('label');
        label.setAttribute('for', header.replace(/[^a-zA-Z0-9]/g, ''));
        label.textContent = `${header}:`;
        fieldGroup.appendChild(label);

        let inputElement;
        const value = data[header] !== undefined ? data[header] : '';

        // Determinar tipo de input basado en el nombre del encabezado
        if (header.toLowerCase().includes('fecha')) {
            inputElement = document.createElement('input');
            inputElement.type = 'date';
            inputElement.value = formatDateForInput(value);
        } else if (header.toLowerCase().includes('(s/n)') || header.toLowerCase().includes('si/no')) {
            inputElement = document.createElement('select');
            const optionEmpty = document.createElement('option');
            optionEmpty.value = '';
            optionEmpty.textContent = 'Seleccionar...';
            inputElement.add(optionEmpty);
            const optionYes = document.createElement('option');
            optionYes.value = 'Sí';
            optionYes.textContent = 'Sí';
            const optionNo = document.createElement('option');
            optionNo.value = 'No';
            optionNo.textContent = 'No';
            inputElement.add(optionYes);
            inputElement.add(optionNo);

            // Asegurarse de que el valor seleccionado coincida
            if (value === 'Sí' || value === true) { // Apps Script ahora envía 'Sí'/'No'
                inputElement.value = 'Sí';
            } else if (value === 'No' || value === false) {
                inputElement.value = 'No';
            } else {
                inputElement.value = '';
            }
        } else if (header.toLowerCase().includes('observaciones') || header.toLowerCase().includes('detalles / observaciones')) {
            inputElement = document.createElement('textarea');
            inputElement.rows = 3;
            inputElement.value = value;
            fieldGroup.classList.add('full-width-field'); // Para que ocupe ancho completo
        } else {
            inputElement = document.createElement('input');
            inputElement.type = 'text';
            inputElement.value = value;
        }

        inputElement.id = header.replace(/[^a-zA-Z0-9]/g, '');
        inputElement.name = header;
        fieldGroup.appendChild(inputElement);
        formElement.appendChild(fieldGroup);
    });

    // Asegurarse de que el botón de submit esté dentro del formulario
    // Se asume que modalSubmitBtn es una referencia a un elemento que existirá en el DOM
    // y lo movemos/añadimos al formulario.
    // **IMPORTANTE**: El modalSubmitBtn debe ser un elemento real en index.html DENTRO del modalForm.
    // Si no lo está, se creará uno aquí.
    if (!modalForm.querySelector('#modalSubmitBtn')) {
        const submitButton = document.createElement('button');
        submitButton.id = 'modalSubmitBtn';
        submitButton.type = 'submit'; // Fundamental para que active el onsubmit del form
        submitButton.classList.add('modal-submit-button'); // Clase para estilos
        submitButton.textContent = `Guardar`; // Texto inicial, se actualiza en openModalForAdd/Edit
        modalForm.appendChild(submitButton);
    }
}

/**
 * Renderiza la vista de una sección específica, incluyendo los selectores de sub-hojas.
 * @param {string} sectionName La sección principal (ej. 'Certificados').
 * @param {string} [initialSheetName] La hoja específica a cargar inicialmente.
 */
async function renderSectionPage(sectionName, initialSheetName) {
    currentSection = sectionName;
    const sectionConfig = SECTION_HEADERS[sectionName];

    if (!sectionConfig) {
        appContainer.innerHTML = `<p class="message error">Error: Configuración de sección '${sectionName}' no encontrada en SECTION_HEADERS.</p>`;
        return;
    }

    currentSheet = initialSheetName || sectionConfig.defaultSheet;
    if (!sectionConfig.sheets[currentSheet]) {
        const availableSheets = Object.keys(sectionConfig.sheets);
        currentSheet = availableSheets.length > 0 ? availableSheets[0] : null;
        if (!currentSheet) {
            appContainer.innerHTML = `<p class="message error">Error: No se encontraron hojas configuradas para la sección '${sectionName}'.</p>`;
            return;
        }
    }

    appContainer.innerHTML = `<h2 style="text-align:center; color: var(--color-primary-green);">Cargando ${currentSheet} de ${currentSection}...</h2>`;

    // fetchData ahora devuelve totalRows, totalPages, currentPage para Presupuestos
    const { headers, data, totalRows: fetchedTotalRows, totalPages: fetchedTotalPages, currentPage: fetchedCurrentPage } = await fetchData(currentSection, currentSheet);

    // Actualizar variables de paginación si es Presupuestos
    if (currentSection === "Presupuestos" && currentSheet === "Presupuesto") {
        totalRows = fetchedTotalRows;
        totalPages = fetchedTotalPages;
        currentPage = fetchedCurrentPage; // Esto es útil si el backend ajusta la página
    }

    let htmlContent = `
        <div class="section-content">
            <h2>${currentSection} <span class="current-sheet-name">(${currentSheet})</span></h2>
    `;

    // Selector de hojas si hay múltiples
    const sheetNames = Object.keys(sectionConfig.sheets);
    if (sheetNames.length > 1) {
        htmlContent += `
            <div class="sheet-selector">
                <label for="sheetSelector">Ver hoja:</label>
                <select id="sheetSelector">
        `;
        sheetNames.forEach(sheet => {
            htmlContent += `<option value="${sheet}" ${sheet === currentSheet ? 'selected' : ''}>${sheet}</option>`;
        });
        htmlContent += `
                </select>
            </div>
        `;
    }

    // Botón para Añadir Nuevo Registro (solo para la hoja principal de Presupuestos, Certificados y Mensuras)
    if ((currentSection === "Presupuestos" && currentSheet === "Presupuesto") ||
        (currentSection === "Certificados" && currentSheet === "CertificadosGRAL") ||
        (currentSection === "Mensuras" && currentSheet === "MensurasGRAL")) {
        htmlContent += `
            <div class="section-actions">
                <button id="addNewRecordBtn">Añadir Nuevo ${currentSheet.replace('GRAL', '')}</button>
            </div>
        `;
    }

    // Mostrar Datos Existentes
    if (data.length === 0) {
        htmlContent += '<p class="message">No hay datos disponibles para esta hoja con los filtros aplicados.</p>';
    } else {
        // --- Lógica de Paginación para Presupuestos ---
        if (currentSection === "Presupuestos" && currentSheet === "Presupuesto") {
            if (totalPages > 1) { // Mostrar paginación solo si hay más de 1 página
                htmlContent += `
                    <div class="pagination-controls top-pagination">
                        <button id="prevPageBtnTop" ${currentPage === 1 ? 'disabled' : ''}>Anterior</button>
                        <span>Página ${currentPage} de ${totalPages}</span>
                        <button id="nextPageBtnTop" ${currentPage === totalPages ? 'disabled' : ''}>Siguiente</button>
                    </div>
                `;
            }
        }

        htmlContent += `<div class="data-grid">`;
        data.forEach(item => { // Iterar directamente sobre 'data' que ya viene paginada y filtrada
            htmlContent += `
                <div class="data-card" data-row-index="${item.__rowIndex}" data-sheet-name="${item.__sheetName}">
                    <button class="edit-button">Editar</button>
            `;
            // Usar los encabezados devueltos por el Apps Script para renderizar las tarjetas de datos
            // Esto asegura que la visualización coincida con la lógica de combinación del backend
            headers.forEach(header => {
                if (header !== '__rowIndex' && header !== '__sheetName' && header !== 'SIRECDEFINITIVO') {
                    let displayValue = item[header];
                    // Formateo para visualización (con ícono ☑️)
                    if (header.toLowerCase().includes('(s/n)') || header.toLowerCase().includes('si/no')) {
                        if (displayValue === 'Sí') { // Apps Script ya devuelve 'Sí' o 'No'
                            displayValue = 'Sí ☑️';
                        } else if (displayValue === 'No') {
                            displayValue = 'No ❌';
                        } else {
                            displayValue = '-'; // Valor vacío o inesperado
                        }
                    } else if (header.toLowerCase().includes('fecha')) {
                        displayValue = formatDateForInput(displayValue);
                    }
                    // NUEVA ESTRUCTURA PARA MEJORAR LA VISUALIZACIÓN
                    htmlContent += `<div class="data-field"><strong>${header}:</strong> <span>${displayValue || '-'}</span></div>`;
                }
            });
            htmlContent += `</div>`;
        });
        htmlContent += `</div>`; // Cierre de data-grid

        // Repetir controles de paginación al final si aplica
        if (currentSection === "Presupuestos" && currentSheet === "Presupuesto") {
            if (totalPages > 1) { // Mostrar paginación solo si hay más de 1 página
                htmlContent += `
                    <div class="pagination-controls bottom-pagination">
                        <button id="prevPageBtnBottom" ${currentPage === 1 ? 'disabled' : ''}>Anterior</button>
                        <span>Página ${currentPage} de ${totalPages}</span>
                        <button id="nextPageBtnBottom" ${currentPage === totalPages ? 'disabled' : ''}>Siguiente</button>
                    </div>
                `;
            }
        }
    }

    htmlContent += `</div>`; // Cierre de section-content
    appContainer.innerHTML = htmlContent;

    // --- Lógica de eventos después de renderizar ---

    // Event listener para el selector de hojas
    const sheetSelector = document.getElementById('sheetSelector');
    if (sheetSelector) {
        sheetSelector.addEventListener('change', (event) => {
            currentPage = 1; // Resetear paginación al cambiar de hoja
            renderSectionPage(currentSection, event.target.value);
        });
    }

    // Botón "Añadir Nuevo Registro" (para Presupuestos, Certificados y Mensuras)
    const addNewRecordBtn = document.getElementById('addNewRecordBtn');
    if (addNewRecordBtn) {
        addNewRecordBtn.addEventListener('click', () => {
            openModalForAdd(currentSection, currentSheet, headers);
        });
    }

    // Botones "Editar"
    document.querySelectorAll('.edit-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const card = event.target.closest('.data-card');
            const rowIndex = card.dataset.rowIndex;
            // Busca el registro en 'data' que ya contiene la página actual
            const recordToEdit = data.find(item => item.__rowIndex == rowIndex);
            if (recordToEdit) {
                openModalForEdit(currentSection, currentSheet, recordToEdit, headers);
            }
        });
    });

    // Controladores de Paginación
    if (currentSection === "Presupuestos" && currentSheet === "Presupuesto") {
        const attachPaginationListeners = (prefix) => {
            const prevBtn = document.getElementById(`${prefix}prevPageBtn`);
            const nextBtn = document.getElementById(`${prefix}nextPageBtn`);

            if (prevBtn) {
                prevBtn.addEventListener('click', () => {
                    if (currentPage > 1) {
                        currentPage--;
                        renderSectionPage(currentSection, currentSheet);
                    }
                });
            }
            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    if (currentPage < totalPages) {
                        currentPage++;
                        renderSectionPage(currentSection, currentSheet);
                    }
                });
            }
        };

        attachPaginationListeners('top'); // Para los botones de arriba
        attachPaginationListeners('bottom'); // Para los botones de abajo
    }
}

/**
 * Abre el modal para añadir un nuevo registro.
 * @param {string} sectionName
 * @param {string} sheetName La hoja específica donde añadir.
 * @param {string[]} headers_actuales Los encabezados de la hoja específica (obtenidos del servidor).
 */
function openModalForAdd(sectionName, sheetName, headers_actuales) {
    modalTitle.textContent = `Añadir Nuevo en ${sheetName.replace('GRAL', '')}`;
    renderFormFields(modalForm, headers_actuales, {});
    // Obtener la referencia al botón que ahora está DENTRO del modalForm
    const submitBtn = modalForm.querySelector('#modalSubmitBtn');
    if (submitBtn) {
        submitBtn.textContent = `Guardar`;
    }
    modal.style.display = 'block';
    modalMessage.style.display = 'none';

    // El evento onsubmit se adjunta al formulario, no al botón directamente
    // El botón dentro del formulario con type="submit" lo activará.
    modalForm.onsubmit = async (event) => {
        event.preventDefault(); // Evitar el envío estándar del formulario
        modalMessage.style.display = 'none';

        const formData = {};
        // Recorrer los grupos de campos para obtener los valores
        modalForm.querySelectorAll('.form-field-group').forEach(group => {
            const inputElement = group.querySelector('input, select, textarea');
            if (inputElement && inputElement.name) {
                formData[inputElement.name] = inputElement.value;
            }
        });

        const result = await sendData(sectionName, sheetName, formData, null);

        if (result.success) {
            showMessage(modalMessage, result.message, 'success');
            modalForm.reset();
            setTimeout(() => {
                closeModal();
                // Si estamos en Presupuestos, reseteamos la paginación al añadir
                if (currentSection === "Presupuestos" && currentSheet === "Presupuesto") {
                    currentPage = 1; // Volver a la primera página para ver el nuevo registro
                }
                renderSectionPage(sectionName, sheetName); // Recargar la página actual
            }, 1500);
        } else {
            showMessage(modalMessage, result.error || 'Ocurrió un error desconocido al añadir.', 'error');
        }
    };
}

/**
 * Abre el modal para editar un registro existente.
 * @param {string} sectionName
 * @param {string} sheetName La hoja específica donde editar.
 * @param {Object} recordData Los datos del registro a editar, incluyendo __rowIndex.
 * @param {string[]} headers_actuales Los encabezados de la hoja específica (obtenidos del servidor).
 */
function openModalForEdit(sectionName, sheetName, recordData, headers_actuales) {
    modalTitle.textContent = `Editar en ${sheetName.replace('GRAL', '')}`;
    renderFormFields(modalForm, headers_actuales, recordData);
    // Obtener la referencia al botón que ahora está DENTRO del modalForm
    const submitBtn = modalForm.querySelector('#modalSubmitBtn');
    if (submitBtn) {
        submitBtn.textContent = `Actualizar`;
    }
    modal.style.display = 'block';
    modalMessage.style.display = 'none';

    // El evento onsubmit se adjunta al formulario, no al botón directamente
    modalForm.onsubmit = async (event) => {
        event.preventDefault(); // Evitar el envío estándar del formulario
        modalMessage.style.display = 'none';

        const formData = {};
        // Recorrer los grupos de campos para obtener los valores
        modalForm.querySelectorAll('.form-field-group').forEach(group => {
            const inputElement = group.querySelector('input, select, textarea');
            if (inputElement && inputElement.name) {
                formData[inputElement.name] = inputElement.value;
            }
        });

        const rowIndexToUpdate = recordData.__rowIndex;
        const result = await sendData(sectionName, sheetName, formData, rowIndexToUpdate);
        if (result.success) {
            showMessage(modalMessage, result.message, 'success');
            setTimeout(() => {
                closeModal();
                renderSectionPage(sectionName, sheetName); // Recargar la página actual (manteniendo la paginación si aplica)
            }, 1500);
        } else {
            showMessage(modalMessage, result.error || 'Ocurrió un error desconocido al actualizar.', 'error');
        }
    };
}

/**
 * Cierra el modal.
 */
function closeModal() {
    modal.style.display = 'none';
    modalForm.reset();
    modalMessage.style.display = 'none';
}

// --- INICIALIZACIÓN DE LA APLICACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    // Botón para el panel principal (Landing Page)
    const landingButton = document.createElement('button');
    landingButton.textContent = "Panel Principal";
    landingButton.classList.add('landing-button'); // Clase para estilos específicos si es necesario
    landingButton.addEventListener('click', () => {
        document.querySelectorAll('nav#main-nav button').forEach(btn => btn.classList.remove('active'));
        landingButton.classList.add('active');
        renderLandingPage();
    });
    mainNav.appendChild(landingButton);


    // Generar botones de navegación para secciones (Presupuestos, Certificados, Mensuras)
    for (const sectionName in SECTION_HEADERS) {
        const button = document.createElement('button');
        button.textContent = sectionName;
        button.addEventListener('click', () => {
            document.querySelectorAll('nav#main-nav button').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentPage = 1; // Resetear la página a 1 al cambiar de sección
            renderSectionPage(sectionName, SECTION_HEADERS[sectionName].defaultSheet);
        });
        mainNav.appendChild(button);
    }

    // Configurar Event Listeners para el modal
    closeButton.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            closeModal();
        }
    });

    // Asegurarse de que el modal esté oculto al cargar la página por primera vez
    closeModal();

    // Cargar la landing page al inicio
    renderLandingPage();
    // Activar el botón de la landing al inicio
    const initialLandingButton = document.querySelector('.landing-button');
    if(initialLandingButton) {
        initialLandingButton.classList.add('active');
    }
});
