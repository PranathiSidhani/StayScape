const map = L.map("map").setView(coordinates, 12);

// Modern map tiles (Carto Light)
L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; CARTO',
}).addTo(map);

// Custom marker icon
const customIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -35],
});

// Add marker
L.marker(coordinates, { icon: customIcon })
  .addTo(map)
  .bindPopup(
    `
    <div style="text-align:center; font-family:'Plus Jakarta Sans', sans-serif;">
      <h6 style="margin:0;"><b>${listingTitle}</b></h6>
      <p style="margin:5px 0 0 0;">Exact location provided after booking</p>
    </div>
  `,
  )
  .openPopup();
