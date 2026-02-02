import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLoadScript, GoogleMap, Autocomplete } from "@react-google-maps/api";
import toast from "react-hot-toast";
import api from "../api/axios";
import Loader from "../components/Loader";
import { useAuth } from "../auth/AuthContext";

const libraries = ["places", "marker"];

const scrollbarStyles =
  "overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-indigo-500 transition-colors pr-2";

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
        toast.success("Profile saved successfully!");
        await checkUser();
        navigate("/profile");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !isLoaded) return <Loader />;

  return (
    <div className="h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden flex flex-col pt-20 transition-colors duration-300">
      <form
        onSubmit={handleSubmit}
        className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden"
      >
        <div
          className={`lg:col-span-5 flex flex-col gap-6 h-full ${scrollbarStyles} pb-20`}
        >
          <div className="bg-white dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-sm">
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-1 text-indigo-600 dark:text-white">
              Operative Profile
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              Configure your identity and location.
            </p>

            <div className="mb-6 p-4 bg-slate-100 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <label className="text-xs font-bold block mb-3 uppercase text-slate-500 dark:text-slate-400">
                Profile Avatar
              </label>
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 shrink-0">
                  <img
                    src={
                      avatarFile
                        ? URL.createObjectURL(avatarFile)
                        : formData.avatar ||
                          "https://via.placeholder.com/200x200"
                    }
                    alt="Avatar"
                    className="w-full h-full rounded-full object-cover border-4 border-white dark:border-slate-700 shadow-md bg-slate-200 dark:bg-slate-800"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                    onChange={(e) => setAvatarFile(e.target.files[0])}
                  />
                  <p className="text-[10px] text-slate-400 mt-2">
                    Max size 2MB. Supports PNG, JPG.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs font-semibold ml-1 mb-1 block text-slate-500 dark:text-slate-400">
                Codename / Username
              </label>
              <input
                required
                value={formData.username}
                placeholder="e.g. ShadowHunter"
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm p-3.5 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-slate-900 dark:text-slate-100"
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
              />
            </div>

            <div className="mb-2">
              <label className="text-xs font-semibold ml-1 mb-1 block text-slate-500 dark:text-slate-400">
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
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm p-3.5 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 mb-3 text-slate-900 dark:text-slate-100"
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </Autocomplete>

              {formData.coordinates.lat !== 0 && (
                <div className="w-full h-40 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner">
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
          </div>
        </div>

        <div
          className={`lg:col-span-7 flex flex-col h-full gap-6 ${scrollbarStyles} pb-24`}
        >
          <div className="bg-white dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-sm">
            <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-4">
              Deployed Arsenal (Games)
            </h3>

            <div className="relative group mb-4">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <SearchIcon />
              </div>
              <input
                value={gameSearch}
                onChange={(e) => setGameSearch(e.target.value)}
                placeholder="Search game database..."
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm p-3.5 pl-10 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-slate-900 dark:text-slate-100"
              />

              {gameResults.length > 0 && (
                <div
                  className={`absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl max-h-60 overflow-y-auto shadow-2xl ${scrollbarStyles}`}
                >
                  {gameResults.map((g) => (
                    <div
                      key={g.id}
                      onClick={() => addGame(g)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-600 hover:text-indigo-700 dark:hover:text-white cursor-pointer text-sm border-b border-slate-100 dark:border-slate-700/50 last:border-0 transition-colors"
                    >
                      <img
                        src={g.cover?.url || "https://via.placeholder.com/40"}
                        alt={g.name}
                        className="w-8 h-10 object-cover rounded bg-slate-200 dark:bg-slate-700"
                      />
                      <span>{g.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {formData.games.map((g, i) => (
                <div
                  key={i}
                  className="relative group aspect-[3/4] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-xl transition-all"
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
                <div className="col-span-full border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-8 flex items-center justify-center text-slate-400 text-xs">
                  No games selected
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-sm">
            <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-4">
              Top Agents (Characters)
            </h3>

            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <SearchIcon />
              </div>
              <input
                value={charSearch}
                onChange={(e) => setCharSearch(e.target.value)}
                placeholder="Search character database..."
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm p-3.5 pl-10 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-slate-900 dark:text-slate-100"
              />

              {charResults.length > 0 && (
                <div
                  className={`absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl max-h-48 overflow-y-auto shadow-2xl ${scrollbarStyles}`}
                >
                  {charResults.map((char) => (
                    <div
                      key={char.id}
                      onClick={() => addCharacter(char)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-600 hover:text-indigo-700 dark:hover:text-white cursor-pointer text-sm border-b border-slate-100 dark:border-slate-700/50 last:border-0 transition-colors"
                    >
                      <img
                        src={
                          char.mug_shot?.url || "https://via.placeholder.com/40"
                        }
                        alt={char.name}
                        className="w-8 h-8 rounded-full object-cover bg-slate-200 dark:bg-slate-700"
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
                  className="group relative flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 pl-1 pr-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 hover:border-indigo-500 transition-colors"
                >
                  <img
                    src={c.imageUrl}
                    alt={c.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-300 dark:border-slate-600 group-hover:border-indigo-400"
                  />
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
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
                    className="ml-1 text-slate-400 hover:text-red-500 transition-colors"
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
                <div className="text-slate-400 text-xs italic py-2">
                  No agents selected.
                </div>
              )}
            </div>
          </div>

          <div className="mt-auto pt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="w-full md:w-auto px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-600/30 transition-all disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              {saving ? "Synchronizing Data..." : "Finalize Profile"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateProfile;
