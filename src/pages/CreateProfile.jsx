import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLoadScript, GoogleMap, Autocomplete } from "@react-google-maps/api";
import toast from "react-hot-toast"; // Import toast
import api from "../api/axios";
import Loader from "../components/Loader";
import { useAuth } from "../auth/AuthContext";

const libraries = ["places", "marker"];

const SearchIcon = () => (
  <svg
    className="w-4 h-4 text-slate-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const CustomMarker = ({ position, map }) => {
  useEffect(() => {
    if (!map || !position) return;

    let marker;

    const initMarker = async () => {
      try {
        const { AdvancedMarkerElement } =
          await google.maps.importLibrary("marker");

        marker = new AdvancedMarkerElement({
          map,
          position,
          title: "Operative Location",
        });
      } catch (error) {
        console.error("Error loading AdvancedMarkerElement:", error);
      }
    };

    initMarker();

    return () => {
      if (marker) marker.map = null;
    };
  }, [map, position]);

  return null;
};

const CreateProfile = () => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [formData, setFormData] = useState({
    username: "",
    address: "",
    avatar: "",
    games: [],
    topCharacters: [],
    coordinates: { lat: 0, lng: 0 },
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [gameSearch, setGameSearch] = useState("");
  const [gameResults, setGameResults] = useState([]);
  const [charSearch, setCharSearch] = useState("");
  const [charResults, setCharResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);

  const autocompleteRef = useRef(null);
  const navigate = useNavigate();
  const { checkUser } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/profile/me");
        if (res.data.data) {
          setFormData(res.data.data);
        }
      } catch (err) {
        console.log("No profile found, starting fresh.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (gameSearch.length > 2) {
        const res = await api.get(
          `/igdb/search?q=${encodeURIComponent(gameSearch)}`,
        );
        setGameResults(res.data.data || []);
      } else {
        setGameResults([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [gameSearch]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (charSearch.length > 2) {
        const res = await api.get(
          `/igdb/characters?q=${encodeURIComponent(charSearch)}`,
        );
        setCharResults(res.data.data || []);
      } else {
        setCharResults([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [charSearch]);

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      const address = place.formatted_address || "";
      let lat = 0;
      let lng = 0;

      if (place.geometry && place.geometry.location) {
        lat = place.geometry.location.lat();
        lng = place.geometry.location.lng();
      }

      setFormData((prev) => ({
        ...prev,
        address,
        coordinates: { lat, lng },
      }));
    }
  };

  const addGame = (game) => {
    const cover =
      game.cover?.url?.replace("t_thumb", "t_cover_big") ||
      "https://via.placeholder.com/150";
    if (!formData.games.find((g) => g.name === game.name)) {
      setFormData({
        ...formData,
        games: [
          ...formData.games,
          {
            name: game.name,
            coverUrl: cover,
            platform: "PC",
            skill: "Intermediate",
          },
        ],
      });
    }
    setGameSearch("");
    setGameResults([]);
  };

  const addCharacter = (char) => {
    const imageUrl =
      char.mug_shot?.url?.replace("t_thumb", "t_cover_big") ||
      `https://ui-avatars.com/api/?name=${char.name}`;
    if (!formData.topCharacters.find((c) => c.name === char.name)) {
      setFormData({
        ...formData,
        topCharacters: [
          ...formData.topCharacters,
          { name: char.name, imageUrl },
        ],
      });
    }
    setCharSearch("");
    setCharResults([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const dataToSend = new FormData();
      dataToSend.append("username", formData.username);
      dataToSend.append("address", formData.address);
      if (avatarFile) dataToSend.append("avatar", avatarFile);
      else if (formData.avatar) dataToSend.append("avatar", formData.avatar);
      dataToSend.append("coordinates", JSON.stringify(formData.coordinates));
      dataToSend.append("games", JSON.stringify(formData.games));
      dataToSend.append(
        "topCharacters",
        JSON.stringify(formData.topCharacters),
      );

      const res = await api.post("/profile", dataToSend);
      if (res.status === 200 || res.status === 201) {
        toast.success("Profile saved successfully!"); // Added Success Toast
        await checkUser();
        navigate("/profile");
      }
    } catch (err) {
      // Replaced alert with toast.error
      toast.error(err.response?.data?.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !isLoaded) return <Loader />;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 pt-24 pb-12 overflow-y-auto">
      <form
        onSubmit={handleSubmit}
        className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-900/50 backdrop-blur-sm p-8 rounded-3xl border border-slate-800 shadow-2xl"
      >
        <div className="col-span-full border-b border-slate-800 pb-6 mb-2">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-white">
            Operative Profile
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Configure your identity and arsenal settings.
          </p>
        </div>

        <div className="space-y-6">
          <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
            Identity & Location
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 font-semibold ml-1 mb-1 block">
                Codename / Username
              </label>
              <input
                required
                value={formData.username}
                placeholder="e.g. ShadowHunter"
                className="w-full bg-slate-800/50 border border-slate-700 text-sm p-3.5 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-semibold ml-1 mb-1 block">
                Base Location
              </label>

              <Autocomplete
                onLoad={(autocomplete) =>
                  (autocompleteRef.current = autocomplete)
                }
                onPlaceChanged={onPlaceChanged}
              >
                <input
                  required
                  value={formData.address}
                  placeholder="Start typing your city..."
                  className="w-full bg-slate-800/50 border border-slate-700 text-sm p-3.5 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600 mb-3"
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </Autocomplete>

              {formData.coordinates.lat !== 0 && (
                <div className="w-full h-48 rounded-xl overflow-hidden border border-slate-700 shadow-inner">
                  <GoogleMap
                    mapContainerStyle={{ width: "100%", height: "100%" }}
                    center={formData.coordinates}
                    zoom={13}
                    onLoad={(map) => setMapInstance(map)}
                    options={{
                      disableDefaultUI: true,
                      zoomControl: true,
                      mapId: "DEMO_MAP_ID",
                    }}
                  >
                    <CustomMarker
                      position={formData.coordinates}
                      map={mapInstance}
                    />
                  </GoogleMap>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-800/50">
              <label className="text-xs text-slate-400 font-bold block mb-3 uppercase">
                Profile Picture
              </label>
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 shrink-0">
                  <img
                    src={
                      avatarFile
                        ? URL.createObjectURL(avatarFile)
                        : formData.avatar ||
                          "https://via.placeholder.com/200x200"
                    }
                    alt="Avatar"
                    className="w-full h-full rounded-full object-cover border-2 border-slate-700 bg-slate-800"
                  />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                  onChange={(e) => setAvatarFile(e.target.files[0])}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8 relative">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
              Deployed Arsenal (Games)
            </h3>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <SearchIcon />
              </div>
              <input
                value={gameSearch}
                onChange={(e) => setGameSearch(e.target.value)}
                placeholder="Search game database..."
                className="w-full bg-slate-800/50 border border-slate-700 text-sm p-3.5 pl-10 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
              />

              {gameResults.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-slate-800/95 backdrop-blur border border-slate-600 rounded-xl max-h-60 overflow-y-auto shadow-2xl">
                  {gameResults.map((g) => (
                    <div
                      key={g.id}
                      onClick={() => addGame(g)}
                      className="px-4 py-3 hover:bg-indigo-600 hover:text-white cursor-pointer text-sm border-b border-slate-700/50 last:border-0 transition-colors"
                    >
                      {g.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto pr-1">
              {formData.games.map((g, i) => (
                <div
                  key={i}
                  className="relative group aspect-[3/4] rounded-lg overflow-hidden border border-slate-700 shadow-lg"
                >
                  <img
                    src={g.coverUrl}
                    alt={g.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          games: formData.games.filter((_, idx) => idx !== i),
                        })
                      }
                      className="bg-red-500/90 text-white p-1.5 rounded-full hover:bg-red-600 transform scale-90 hover:scale-100 transition-all"
                      title="Remove Game"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/90 to-transparent p-2">
                    <p className="text-[10px] font-bold text-white truncate text-center">
                      {g.name}
                    </p>
                  </div>
                </div>
              ))}
              {formData.games.length === 0 && (
                <div className="col-span-full border-2 border-dashed border-slate-800 rounded-xl p-8 flex items-center justify-center text-slate-600 text-xs">
                  No games selected
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 border-t border-slate-800/50 pt-6">
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
              Top Agents (Characters)
            </h3>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <SearchIcon />
              </div>
              <input
                value={charSearch}
                onChange={(e) => setCharSearch(e.target.value)}
                placeholder="Search character database..."
                className="w-full bg-slate-800/50 border border-slate-700 text-sm p-3.5 pl-10 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
              />
              {charResults.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-slate-800/95 backdrop-blur border border-slate-600 rounded-xl max-h-48 overflow-y-auto shadow-2xl">
                  {charResults.map((char) => (
                    <div
                      key={char.id}
                      onClick={() => addCharacter(char)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-indigo-600 hover:text-white cursor-pointer text-sm border-b border-slate-700/50 last:border-0 transition-colors"
                    >
                      <img
                        src={
                          char.mug_shot?.url || "https://via.placeholder.com/40"
                        }
                        alt={char.name}
                        className="w-8 h-8 rounded-full object-cover bg-slate-700"
                      />
                      <span>{char.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.topCharacters.map((c, i) => (
                <div
                  key={i}
                  className="group relative flex items-center gap-2 bg-slate-800/80 pl-1 pr-3 py-1 rounded-full border border-slate-700 hover:border-indigo-500/50 transition-colors"
                >
                  <img
                    src={c.imageUrl}
                    alt={c.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-600 group-hover:border-indigo-400"
                  />
                  <span className="text-[11px] font-bold text-slate-200">
                    {c.name}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        topCharacters: formData.topCharacters.filter(
                          (_, idx) => idx !== i,
                        ),
                      })
                    }
                    className="ml-1 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
              {formData.topCharacters.length === 0 && (
                <div className="text-slate-600 text-xs italic py-2">
                  No agents selected.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-full pt-6 border-t border-slate-800 flex justify-center">
          <button
            type="submit"
            disabled={saving}
            className="w-full md:w-auto md:px-12 bg-indigo-600 py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-indigo-500 transition-all disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20"
          >
            {saving ? "Synchronizing Data..." : "Finalize Profile"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProfile;
