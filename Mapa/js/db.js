// Importamos las herramientas de Firebase directamente desde Internet (CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Sustituye esto por TU código del Paso 1
const firebaseConfig = {

  apiKey: "AIzaSyDvDjfRXM6GBMLZdvPXIyqBYhJn1PXwTZ0",

  authDomain: "caminosantiago-1fd3b.firebaseapp.com",

  projectId: "caminosantiago-1fd3b",

  storageBucket: "caminosantiago-1fd3b.firebasestorage.app",

  messagingSenderId: "478230083546",

  appId: "1:478230083546:web:008c42fafbe66d30fdb2e3",

  measurementId: "G-CPZPRHSR54"

};



// Inicializamos Firebase y la Base de datos
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- Lógica de la Interfaz ---
document.addEventListener('DOMContentLoaded', () => {
    const btnFeedback = document.getElementById('btn-feedback');
    const overlayFeedback = document.getElementById('feedback-overlay');
    const closeFeedback = document.getElementById('close-feedback');
    const formFeedback = document.getElementById('form-feedback');
    
    // El botón original (que pusiste en el index.html) tiene style="display: none;"
    // Aquí forzamos a que se vea si existe
    if(btnFeedback) {
        btnFeedback.style.display = 'flex';
        btnFeedback.addEventListener('click', () => overlayFeedback.classList.add('active'));
    }

    if(closeFeedback) {
        closeFeedback.addEventListener('click', () => overlayFeedback.classList.remove('active'));
    }

    if(overlayFeedback) {
        overlayFeedback.addEventListener('click', (e) => {
            if (e.target === overlayFeedback) overlayFeedback.classList.remove('active');
        });
    }

    // CUANDO ALGUIEN LE DA A "GUARDAR RECUERDO"
    if(formFeedback) {
        formFeedback.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            
            // Cambiamos el texto del botón para que parezca que está cargando
            const btnSubmit = formFeedback.querySelector('.btn-submit');
            const textoOriginal = btnSubmit.innerText;
            btnSubmit.innerText = "Guardando...";
            btnSubmit.disabled = true;

            const autor = document.getElementById('fb-autor').value;
            const etapa = document.getElementById('fb-etapa').value;
            const comentario = document.getElementById('fb-comentario').value;

            try {
                // Guardamos los datos en una colección llamada "diario" en Firestore
                await addDoc(collection(db, "diario"), {
                    autor: autor,
                    etapa: etapa,
                    comentario: comentario,
                    fecha: new Date().toISOString()
                });

                alert("¡Recuerdo de etapa guardado correctamente!");
                formFeedback.reset();
                overlayFeedback.classList.remove('active');
            } catch (error) {
                console.error("Error al guardar en Firebase: ", error);
                alert("Hubo un error al guardar. Revisa la consola.");
            } finally {
                // Restauramos el botón
                btnSubmit.innerText = textoOriginal;
                btnSubmit.disabled = false;
            }
        });
    }
});
