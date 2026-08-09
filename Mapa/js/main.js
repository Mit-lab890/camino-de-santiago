// --- 1. CONFIGURACIÓN DEL MAPA ---
var map = L.map('map', {
    center: [42.5, -8.0], // Centro aproximado (Galicia)
    zoom: 8,
    zoomControl: false
});

// Control de zoom en la esquina inferior derecha
L.control.zoom({ position: 'bottomright' }).addTo(map);

// Capa de Satélite (Esri)
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: 'Tiles &copy; Esri'
}).addTo(map);

// Capa de etiquetas de poblaciones
L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19
}).addTo(map);

// --- 2. CONFIGURACIÓN DE LA ELEVACIÓN ---
var controlElevation = L.control.elevation({
    theme: "dark-theme",
    detached: true,
    elevationDiv: "#elevation-div",
    followMarker: true,
    autohide: false,
    summary: true,
    legend: false,
    waypoints: true,
    trk: true,
    pts: false,
    gpxOptions: {
        polyline_options: {
            weight: 5,
            color: '#3b82f6',
            opacity: 0.9,
            lineCap: 'round',
            lineJoin: 'round'
        },
        marker_options: {
            startIcon: null,
            endIcon: null,
            point_icon: null,
            wptIcon: L.divIcon({
                className: 'custom-waypoint',
                html: '<div style="background-color: #ffaa00; width: 14px; height: 14px; border: 2px solid #ffffff; border-radius: 50%; box-shadow: 0 0 6px rgba(0,0,0,0.7);"></div>',
                iconSize: [14, 14],
                iconAnchor: [7, 7]
            })
        }
    }
});

controlElevation.addTo(map);

// Cargar el archivo GPX (Asegúrate de que la ruta coincida con tu carpeta)
controlElevation.load("data/ruta.gpx");

// --- 3. LÓGICA DE INTERFAZ (BOTONES) ---
const btnElevation = document.getElementById('btn-elevation');
const containerElevation = document.getElementById('elevation-container');
const closeElevation = document.getElementById('close-elevation');

const btnTeam = document.getElementById('btn-team');
const overlayTeam = document.getElementById('team-overlay');
const closeTeam = document.getElementById('close-team');

// Toggle Elevación
btnElevation.addEventListener('click', () => {
    containerElevation.classList.toggle('active');
    setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
    }, 400);
});
closeElevation.addEventListener('click', () => containerElevation.classList.remove('active'));

// Toggle Equipo
btnTeam.addEventListener('click', () => overlayTeam.classList.add('active'));
closeTeam.addEventListener('click', () => overlayTeam.classList.remove('active'));
overlayTeam.addEventListener('click', (e) => {
    if (e.target === overlayTeam) overlayTeam.classList.remove('active');
});

// --- 4. GENERAR LOS INTEGRANTES DINÁMICAMENTE ---
const integrantes = ["María", "Mario", "Irene", "Carlota", "Carmen", "Santi", "Alejo", "Andrés"];
const gridTeam = document.getElementById('team-grid');
const colores = ['#ef4444', '#f97316', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e'];

integrantes.forEach((nombre, index) => {
    const inicial = nombre.charAt(0);
    const colorFondo = colores[index % colores.length];
    
    const htmlMiembro = `
        <div class="team-member">
            <div class="member-avatar" style="background-color: ${colorFondo};">${inicial}</div>
            <span>${nombre}</span>
        </div>
    `;
    gridTeam.innerHTML += htmlMiembro;
});
