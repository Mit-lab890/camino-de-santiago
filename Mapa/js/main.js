document.addEventListener("DOMContentLoaded", () => {

    const map = L.map('map', {
        zoomControl: false,
        center: [42.15, -8.75],
        zoom: 10
    });
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri',
        maxZoom: 19
    }).addTo(map);

    L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19
    }).addTo(map);

// 3. Configuración Plugin de Elevación
    const elevationControl = L.control.elevation({
        theme: "camino-theme", // Forzado por CSS a Blanco y Negro
        detached: true,
        elevationDiv: "#elevation-div",
        autofitBounds: true,
        displayTrackInfo: false,
        profile: "elevation",
        waypoints: true,
        polyline: { color: '#ffffff', weight: 4, opacity: 0.9, lineCap: 'round' }, // Línea BLANCA en el mapa
        
        // LA SOLUCIÓN AL DESPLAZAMIENTO: Ajustar los márgenes internos de D3.js
        margins: {
            top: 20,    // Reducimos el espacio vacío de arriba
            right: 25, 
            bottom: 30, // Dejamos espacio para los números del eje X (kilómetros)
            left: 50    // Dejamos espacio para los números del eje Y (altitud)
        }
    }).addTo(map);
    elevationControl.load("ruta.gpx");

    // Lógica de Menús Accesibles
    const btnElevation = document.getElementById('btn-elevation');
    const panelElevation = document.getElementById('elevation-panel');
    const btnCloseElevation = document.getElementById('close-elevation');

    const btnStages = document.getElementById('btn-stages');
    const panelStages = document.getElementById('stages-panel');
    const btnCloseStages = document.querySelector('.close-stages');

const togglePanel = (btn, panel) => {
        const isActive = panel.classList.contains('active');
        const newState = !isActive;
        
        panel.classList.toggle('active', newState);
        btn.classList.toggle('active', newState);
        
        // Atributos de Accesibilidad
        btn.setAttribute('aria-expanded', newState);
        panel.setAttribute('aria-hidden', !newState);
        
        if (newState) {
            const closeBtn = panel.querySelector('.btn-close');
            if (closeBtn) closeBtn.focus();
        }
        
        // ¡Se ha eliminado el recalculo del gráfico aquí para garantizar cero tirones!
    };

    btnElevation.addEventListener('click', () => togglePanel(btnElevation, panelElevation));
    btnCloseElevation.addEventListener('click', () => togglePanel(btnElevation, panelElevation));

    btnStages.addEventListener('click', () => togglePanel(btnStages, panelStages));
    btnCloseStages.addEventListener('click', () => togglePanel(btnStages, panelStages));

    // Motor de Etapas
    elevationControl.on('eledata_loaded', function (e) {
        fetch('ruta.gpx').then(res => res.text()).then(xmlStr => {
            const parser = new DOMParser();
            const xml = parser.parseFromString(xmlStr, "application/xml");

            const trkpts = Array.from(xml.querySelectorAll('trkpt'));
            let trackCoords = [];
            let cumulativeDist = 0;

            for (let i = 0; i < trkpts.length; i++) {
                let currentP = L.latLng(trkpts[i].getAttribute('lat'), trkpts[i].getAttribute('lon'));
                if (i > 0) {
                    let prevP = L.latLng(trkpts[i - 1].getAttribute('lat'), trkpts[i - 1].getAttribute('lon'));
                    cumulativeDist += prevP.distanceTo(currentP);
                }
                trackCoords.push({ point: currentP, dist: cumulativeDist });
            }

            const wpts = Array.from(xml.querySelectorAll('wpt'));
            let stagesData = [];

            wpts.forEach(wpt => {
                let wpLatLng = L.latLng(wpt.getAttribute('lat'), wpt.getAttribute('lon'));
                let name = wpt.querySelector('name').textContent;
                let minDist = Infinity;
                let trackDistAtWp = 0;

                trackCoords.forEach(t => {
                    let d = wpLatLng.distanceTo(t.point);
                    if (d < minDist) {
                        minDist = d;
                        trackDistAtWp = t.dist;
                    }
                });
                stagesData.push({ name: name, routeDist: trackDistAtWp });
            });

            stagesData.sort((a, b) => a.routeDist - b.routeDist);

            let html = '';
            for (let i = 0; i < stagesData.length - 1; i++) {
                let distMeters = stagesData[i + 1].routeDist - stagesData[i].routeDist;
                let distKm = (distMeters / 1000).toFixed(2);
                let timeHours = distKm / 4;
                let h = Math.floor(timeHours);
                let m = Math.round((timeHours - h) * 60);

                html += `
                    <article class="stage-card" tabindex="0">
                        <h4>Etapa ${i + 1}</h4>
                        <p style="color:#fff; margin-bottom: 8px;">${stagesData[i].name} <br> a <br> ${stagesData[i + 1].name}</p>
                        <p><span><i class="fa-solid fa-route" aria-hidden="true"></i> ${distKm} km</span> <span><i class="fa-regular fa-clock" aria-hidden="true"></i> ${h}h ${m}m</span></p>
                    </article>
                `;
            }
            document.getElementById('stages-content').innerHTML = html;
        });
    });

    // Puntos de Interés
    const poiLayer = L.featureGroup().addTo(map);
    const cachedPOIs = new Set();
    let fetchTimer;

    map.on('moveend', () => {
        if (map.getZoom() < 12) {
            poiLayer.clearLayers();
            cachedPOIs.clear();
            return;
        }
        clearTimeout(fetchTimer);
        fetchTimer = setTimeout(fetchPOIs, 800);
    });

    function fetchPOIs() {
        const bounds = map.getBounds();
        const bbox = `${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`;

        const query = `
            [out:json][timeout:15];
            (
                node["amenity"~"restaurant|cafe|drinking_water|place_of_worship"](${bbox});
                node["shop"~"supermarket|convenience"](${bbox});
                node["tourism"~"hostel|hotel|guest_house"](${bbox});
                node["historic"~"monument"](${bbox});
            );
            out body;
        `;

        fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`)
            .then(res => res.json())
            .then(data => {
                data.elements.forEach(node => {
                    if (!cachedPOIs.has(node.id)) {
                        cachedPOIs.add(node.id);
                        let iconClass = 'fa-map-marker';
                        const t = node.tags;
                        const type = t.amenity || t.shop || t.tourism || t.historic || 'Punto';

                        if (['restaurant', 'cafe'].includes(type)) iconClass = 'fa-utensils';
                        if (['supermarket', 'convenience'].includes(type)) iconClass = 'fa-shopping-basket';
                        if (type === 'drinking_water') iconClass = 'fa-faucet-drip';
                        if (['place_of_worship', 'monument'].includes(type)) iconClass = 'fa-church';
                        if (['hostel', 'hotel', 'guest_house'].includes(type)) iconClass = 'fa-bed';

                        const customIcon = L.divIcon({
                            html: `<div class="poi-marker"><i class="fa-solid ${iconClass}" aria-hidden="true"></i></div>`,
                            className: '',
                            iconSize: [28, 28]
                        });

                        L.marker([node.lat, node.lon], { icon: customIcon, alt: t.name || 'Punto de interés' })
                            .bindPopup(`<b>${t.name || 'Lugar sin nombre'}</b><br><small style="color:#aaa; text-transform:capitalize;">${type.replace('_', ' ')}</small>`)
                            .addTo(poiLayer);
                    }
                });
            })
            .catch(err => console.log("Llamada pausada."));
    }
});
