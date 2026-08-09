// Este archivo manejará la base de datos de los comentarios.
// Más adelante, aquí pegaremos la configuración real de Firebase.

const firebaseConfig = {
    // API KEY y datos de Firebase irán aquí cuando lo crees
};

// --- Lógica de la Interfaz del Feedback ---
document.addEventListener('DOMContentLoaded', () => {
    const btnFeedback = document.getElementById('btn-feedback');
    const overlayFeedback = document.getElementById('feedback-overlay');
    const closeFeedback = document.getElementById('close-feedback');
    const formFeedback = document.getElementById('form-feedback');

    // Mostramos el botón de feedback (lo habíamos ocultado en HTML)
    if(btnFeedback) {
        btnFeedback.style.display = 'flex';
        btnFeedback.addEventListener('click', () => overlayFeedback.classList.add('active'));
    }

    if(closeFeedback) {
        closeFeedback.addEventListener('click', () => overlayFeedback.classList.remove('active'));
    }

    // Cerrar al hacer clic fuera
    if(overlayFeedback) {
        overlayFeedback.addEventListener('click', (e) => {
            if (e.target === overlayFeedback) overlayFeedback.classList.remove('active');
        });
    }

    // Manejar el envío del formulario
    if(formFeedback) {
        formFeedback.addEventListener('submit', (e) => {
            e.preventDefault(); // Evita que la página se recargue

            const autor = document.getElementById('fb-autor').value;
            const etapa = document.getElementById('fb-etapa').value;
            const comentario = document.getElementById('fb-comentario').value;

            const nuevoFeedback = {
                autor: autor,
                etapa: etapa,
                comentario: comentario,
                fecha: new Date().toISOString()
            };

            // Aquí enviaremos "nuevoFeedback" a Firebase más adelante
            console.log("Feedback listo para enviar a Base de Datos:", nuevoFeedback);
            
            alert("¡Comentario guardado correctamente!");
            formFeedback.reset();
            overlayFeedback.classList.remove('active');
        });
    }
});
