import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLoadScript, GoogleMap, Autocomplete } from "@react-google-maps/api";
import toast from "react-hot-toast";
import api from "../api/axios";
import Loader from "../components/Loader";
import { useAuth } from "../auth/AuthContext";

const libraries = ["places", "marker"];

const scrollbarStyles =
  "overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-indigo-500 transition-colors pr-1";

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
    <div className="h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden flex flex-col pt-12 pb-28 transition-colors duration-300">
      <div className="px-6 pb-4 shrink-0 max-w-[85%] mx-auto w-full">
        <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 drop-shadow-sm">
          Operative Profile
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm font-semibold tracking-wide uppercase mt-1">
          Configure Your Identity & Arsenal
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex-1 flex flex-col overflow-hidden px-4 max-w-[85%] mx-auto w-full"
      >
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden min-h-0 mb-4">
          <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                Identity Module
              </h3>
            </div>

            <div className={`p-6 space-y-6 overflow-y-auto ${scrollbarStyles}`}>
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700/50">
                <div className="relative w-24 h-24 shrink-0 group">
                  <img
                    src={
                      avatarFile
                        ? URL.createObjectURL(avatarFile)
                        : formData.avatar ||
                          "https://via.placeholder.com/200x200"
                    }
                    alt="Avatar"
                    className="w-full h-full rounded-full object-cover border-4 border-white dark:border-slate-700 shadow-lg"
                  />
                </div>
                <div className="flex-1 w-full text-center sm:text-left">
                  <label className="cursor-pointer inline-block px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors shadow-md shadow-indigo-500/20">
                    Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setAvatarFile(e.target.files[0])}
                    />
                  </label>
                  <p className="text-[10px] text-slate-400 mt-2 font-medium">
                    Max 2MB (JPG/PNG)
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold ml-1 mb-1.5 block text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Codename
                  </label>
                  <input
                    required
                    value={formData.username}
                    className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 text-sm p-4 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-slate-900 dark:text-slate-100 font-bold"
                    placeholder="e.g. ShadowHunter"
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-xs font-bold ml-1 mb-1.5 block text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Location
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
                      placeholder="Search city..."
                      className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 text-sm p-4 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 mb-4 text-slate-900 dark:text-slate-100 font-bold"
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                    />
                  </Autocomplete>

                  {formData.coordinates.lat !== 0 && (
                    <div className="w-full h-64 rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-lg">
                      <GoogleMap
                        mapContainerStyle={{ width: "100%", height: "100%" }}
                        center={formData.coordinates}
                        zoom={13}
                        onLoad={(map) => setMapInstance(map)}
                        options={{
                          disableDefaultUI: true,
                          zoomControl: false,
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
          </div>

          <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Arsenal Module (You can only add 3 games on the free plan)
              </h3>
            </div>

            <div className={`p-6 space-y-8 overflow-y-auto ${scrollbarStyles}`}>
              <div className="space-y-4">
                <div className="relative group z-20">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <SearchIcon />
                  </div>
                  <input
                    value={gameSearch}
                    onChange={(e) => setGameSearch(e.target.value)}
                    placeholder="Search & Add Games..."
                    className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 text-xs p-4 pl-10 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-slate-900 dark:text-slate-100 font-bold"
                  />
                  {gameResults.length > 0 && (
                    <div
                      className={`absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl max-h-48 overflow-y-auto shadow-2xl ${scrollbarStyles}`}
                    >
                      {gameResults.map((g) => (
                        <div
                          key={g.id}
                          onClick={() => addGame(g)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-600 cursor-pointer border-b border-slate-100 dark:border-slate-700/50 last:border-0"
                        >
                          <img
                            src={
                              g.cover?.url || "https://via.placeholder.com/40"
                            }
                            alt=""
                            className="w-8 h-10 object-cover rounded bg-slate-200"
                          />
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                            {g.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-2">
                  {formData.games.map((g, i) => (
                    <div
                      key={i}
                      className="relative group aspect-[3/4] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-md bg-slate-100 dark:bg-slate-800"
                    >
                      <img
                        src={g.coverUrl}
                        alt={g.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              games: formData.games.filter(
                                (_, idx) => idx !== i,
                              ),
                            })
                          }
                          className="text-white hover:text-red-400 transform scale-110"
                        >
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2.5"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                  {formData.games.length === 0 && (
                    <div className="col-span-full py-10 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-400 uppercase tracking-widest">
                      No games configured
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                {/* FIX: Increased Z-Index to 50 to sit above other elements.
                  The dropdown below will now render upwards (bottom-full) to avoid clipping.
                */}
                <div className="relative z-50">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <SearchIcon />
                  </div>
                  <input
                    value={charSearch}
                    onChange={(e) => setCharSearch(e.target.value)}
                    placeholder="Search & Add Agents..."
                    className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 text-xs p-4 pl-10 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-slate-900 dark:text-slate-100 font-bold"
                  />
                  {charResults.length > 0 && (
                    <div
                      // FIX: Changed 'top-full mt-2' to 'bottom-full mb-2'
                      // This forces the dropdown to open UPWARDS, preventing it from being
                      // cut off by the overflow-hidden boundary of the parent container.
                      className={`absolute left-0 right-0 bottom-full mb-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl max-h-48 overflow-y-auto shadow-2xl ${scrollbarStyles}`}
                    >
                      {charResults.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => addCharacter(c)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-600 cursor-pointer border-b border-slate-100 dark:border-slate-700/50 last:border-0"
                        >
                          <img
                            src={
                              c.mug_shot?.url ||
                              "https://via.placeholder.com/30"
                            }
                            alt=""
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                            {c.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 pt-1">
                  {formData.topCharacters.map((c, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 pl-1.5 pr-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm"
                    >
                      <img
                        src={c.imageUrl}
                        alt=""
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-xs font-bold uppercase text-slate-700 dark:text-slate-200">
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
                        className="text-slate-400 hover:text-red-500 ml-1"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.5"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                  {formData.topCharacters.length === 0 && (
                    <div className="text-xs font-medium text-slate-400 italic pl-1">
                      No agents selected
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="shrink-0 flex justify-center pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full max-w-sm bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-xl shadow-lg shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 uppercase tracking-widest text-xs"
          >
            {saving ? "Synchronizing..." : "Finalize Profile"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProfile;
