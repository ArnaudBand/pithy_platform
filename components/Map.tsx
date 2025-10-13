import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Custom green marker to match your brand colors
const customIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const Map = () => {
  const position = [0.28461, 32.60856];

  return (
    <div className="w-full">
      {/* Map Container */}
      <div className="relative rounded-2xl overflow-hidden shadow-xl border-2 border-[#5AC35A]/20">
        {/* Live Status Badge */}
        <div className="absolute top-4 left-4 z-[1000] bg-white rounded-xl shadow-lg px-4 py-2.5 backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-3 h-3 bg-[#5AC35A] rounded-full"></div>
              <div className="absolute inset-0 w-3 h-3 bg-[#5AC35A] rounded-full animate-ping"></div>
            </div>
            <span className="text-sm font-semibold text-gray-800">
              Office Open
            </span>
          </div>
        </div>

        {/* Zoom Controls Info */}
        <div className="absolute top-4 right-4 z-[1000] bg-white/95 rounded-lg shadow-md px-3 py-2 backdrop-blur-sm hidden sm:block">
          <p className="text-xs text-gray-600 font-medium">
            📍 Kansanga, Kampala
          </p>
        </div>

        {/* Map */}
        <MapContainer
          center={[0.28461, 32.60856]}
          zoom={16}
          scrollWheelZoom={true}
          zoomControl={true}
          className="w-full h-[400px] sm:h-[450px] lg:h-[500px]"
          style={{ background: '#f0f0f0' }}
        >
          {/* Custom Map Style - CartoDB Positron for cleaner look */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            maxZoom={20}
          />

          <Marker position={[0.28461, 32.60856]} icon={customIcon}>
            <Popup className="custom-popup" maxWidth={280}>
              <div className="p-3">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#5AC35A] to-[#00AE76] rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-gray-900 mb-1">
                      Pithy Means Uganda Office
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Plot No 546, ROFRA House, 4th Floor
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-3 border-t border-gray-200 pt-3">
                  <div className="flex items-center gap-2 text-xs text-gray-700">
                    <svg className="w-4 h-4 text-[#5AC35A] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Ggaba Road, Kansanga</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-700">
                    <svg className="w-4 h-4 text-[#5AC35A] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Mon-Fri: 9:00 AM - 5:00 PM</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${position[0]},${position[1]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center bg-gradient-to-r from-[#5AC35A] to-[#00AE76] hover:from-[#4AB34A] hover:to-[#009966] text-white text-xs font-semibold py-2.5 px-3 rounded-lg transition-all duration-200 hover:shadow-md"
                  >
                    Get Directions
                  </a>
                  <a
                    href="tel:+256750175892"
                    className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 p-2.5 rounded-lg transition-all duration-200"
                    title="Call us"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Info Cards Below Map */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md p-4 border border-gray-100 hover:shadow-lg hover:border-[#5AC35A]/30 transition-all duration-300 group">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#5AC35A]/10 to-[#00AE76]/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-2xl">📍</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">Location</h3>
              <p className="text-xs text-gray-600">Kansanga, Kampala</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md p-4 border border-gray-100 hover:shadow-lg hover:border-[#5AC35A]/30 transition-all duration-300 group">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#5AC35A]/10 to-[#00AE76]/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-2xl">🕒</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">Hours</h3>
              <p className="text-xs text-gray-600">Mon-Fri: 9AM - 5PM</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md p-4 border border-gray-100 hover:shadow-lg hover:border-[#5AC35A]/30 transition-all duration-300 group">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#5AC35A]/10 to-[#00AE76]/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-2xl">📞</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">Phone</h3>
              <p className="text-xs text-gray-600">+256 750 175 892</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md p-4 border border-gray-100 hover:shadow-lg hover:border-[#5AC35A]/30 transition-all duration-300 group">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#5AC35A]/10 to-[#00AE76]/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-2xl">✉️</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">Email</h3>
              <p className="text-xs text-gray-600 truncate">pithymeansafrica@...</p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Popup Styles */}
      <style jsx global>{`
        .leaflet-popup-content-wrapper {
          border-radius: 16px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          padding: 0;
          border: 2px solid #5AC35A20;
        }
        .leaflet-popup-content {
          margin: 0;
          width: 280px !important;
        }
        .leaflet-popup-tip {
          background: white;
          border: 2px solid #5AC35A20;
          border-top: none;
          border-right: none;
        }
        .leaflet-popup-close-button {
          color: #4B5563 !important;
          font-size: 24px !important;
          padding: 8px 12px !important;
          font-weight: 300 !important;
        }
        .leaflet-popup-close-button:hover {
          color: #1F2937 !important;
        }
        .leaflet-control-zoom {
          border: 2px solid #5AC35A20 !important;
          border-radius: 12px !important;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
        }
        .leaflet-control-zoom a {
          color: #374151 !important;
          font-size: 20px !important;
          width: 36px !important;
          height: 36px !important;
          line-height: 36px !important;
          border: none !important;
        }
        .leaflet-control-zoom a:hover {
          background: #5AC35A !important;
          color: white !important;
        }
      `}</style>
    </div>
  );
};

export default Map;