import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useLoadScript, GoogleMap, Marker } from "@react-google-maps/api";
import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";
import toast from "react-hot-toast";

const libraries = ["places"];

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

const CreateProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [avatar, setAvatar] = useState(
    `https://ui-avatars.com/api/?name=${user?.username || "User"}&background=random`,
  );
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState({ lat: 0, lng: 0 });
  const [games, setGames] = useState([]);
  const [topCharacters, setTopCharacters] = useState([]);

  const [gameQuery, setGameQuery] = useState("");
  const [charQuery, setCharQuery] = useState("");
  const [gameResults, setGameResults] = useState([]);
  const [charResults, setCharResults] = useState([]);
  const [loadingGames, setLoadingGames] = useState(false);
  const [loadingChars, setLoadingChars] = useState(false);

  const debouncedGameQuery = useDebounce(gameQuery, 500);
  const debouncedCharQuery = useDebounce(charQuery, 500);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 });
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/profile/me");
        if (res.data.data) {
          const { avatar, address, coordinates, games, topCharacters } =
            res.data.data;
          setAvatar(avatar);
          setAddress(address);
          setCoordinates(coordinates);
          setGames(games || []);
          setTopCharacters(topCharacters || []);
          if (coordinates.lat !== 0) setMapCenter(coordinates);
        }
      } catch (err) {}
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!debouncedGameQuery) {
      setGameResults([]);
      return;
    }

    const searchGames = async () => {
      setLoadingGames(true);
      try {
        const res = await api.get(
          `/igdb/search?q=${encodeURIComponent(debouncedGameQuery)}`,
        );
        setGameResults(res.data.data || []);
      } catch (err) {
        console.error("Game search error", err);
      } finally {
        setLoadingGames(false);
      }
    };
    searchGames();
  }, [debouncedGameQuery]);

  useEffect(() => {
    if (!debouncedCharQuery) {
      setCharResults([]);
      return;
    }

    const searchChars = async () => {
      setLoadingChars(true);
      try {
        const res = await api.get(
          `/igdb/characters?q=${encodeURIComponent(debouncedCharQuery)}`,
        );
        setCharResults(res.data.data || []);
      } catch (err) {
        console.error("Character search error", err);
      } finally {
        setLoadingChars(false);
      }
    };
    searchChars();
  }, [debouncedCharQuery]);

  const handleMapClick = useCallback(async (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setCoordinates({ lat, lng });

    try {
      const geocoder = new window.google.maps.Geocoder();
      const response = await geocoder.geocode({ location: { lat, lng } });
      if (response.results[0]) {
        setAddress(response.results[0].formatted_address);
      }
    } catch (err) {
      console.error("Geocoding error", err);
    }
  }, []);

  const addGame = (game) => {
    if (games.find((g) => g.gameId === game.gameId)) return;
    setGames([...games, game]);
    setGameQuery("");
    setGameResults([]);
  };

  const removeGame = (gameId) => {
    setGames(games.filter((g) => g.gameId !== gameId));
  };

  const addCharacter = (char) => {
    if (topCharacters.find((c) => c.characterId === char.characterId)) return;
    setTopCharacters([...topCharacters, char]);
    setCharQuery("");
    setCharResults([]);
  };

  const removeCharacter = (charId) => {
    setTopCharacters(topCharacters.filter((c) => c.characterId !== charId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        avatar,
        address,
        coordinates,
        games,
        topCharacters,
      };
      await api.post("/profile", payload);
      toast.success("Profile updated successfully!");
      navigate("/profile");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save profile");
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-4xl mx-auto text-gray-900 dark:text-white transition-colors duration-500">
      <h1 className="text-4xl font-black mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
        Setup Identity
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-xl">
          <h2 className="text-xl font-bold mb-4">Avatar URL</h2>
          <div className="flex gap-4 items-center">
            <img
              src={avatar}
              alt="Avatar Preview"
              className="w-16 h-16 rounded-full border-2 border-indigo-500 object-cover"
              onError={(e) =>
                (e.target.src = `https://ui-avatars.com/api/?name=${user?.username}`)
              }
            />
            <input
              type="text"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="flex-1 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="https://example.com/my-avatar.png"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-xl">
          <h2 className="text-xl font-bold mb-4">Base of Operations</h2>
          <p className="text-sm text-gray-500 mb-4">
            Click on the map to pin your location.
          </p>
          <div className="mb-4">
            <input
              type="text"
              value={address}
              readOnly
              className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed"
              placeholder="Address will appear here..."
            />
          </div>
          <div className="h-64 w-full rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-700">
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "100%" }}
                center={coordinates.lat ? coordinates : mapCenter}
                zoom={5}
                onClick={handleMapClick}
                options={{
                  disableDefaultUI: true,
                  styles: [
                    {
                      elementType: "geometry",
                      stylers: [{ color: "#242f3e" }],
                    },
                    {
                      elementType: "labels.text.stroke",
                      stylers: [{ color: "#242f3e" }],
                    },
                    {
                      elementType: "labels.text.fill",
                      stylers: [{ color: "#746855" }],
                    },
                    {
                      featureType: "water",
                      elementType: "geometry",
                      stylers: [{ color: "#17263c" }],
                    },
                  ],
                }}
              >
                {coordinates.lat !== 0 && <Marker position={coordinates} />}
              </GoogleMap>
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-100 dark:bg-slate-800">
                Loading Map...
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-xl relative z-20">
          <h2 className="text-xl font-bold mb-4">Favourite Games</h2>
          <div className="relative">
            <input
              type="text"
              value={gameQuery}
              onChange={(e) => setGameQuery(e.target.value)}
              className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="Search games (e.g. Witcher 3, Valorant)..."
            />
            {loadingGames && (
              <div className="absolute right-4 top-3.5 text-gray-400 text-sm">
                Searching...
              </div>
            )}

            {gameResults.length > 0 && (
              <ul className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                {gameResults.map((game) => (
                  <li
                    key={game.gameId}
                    onClick={() => addGame(game)}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer transition-colors border-b border-gray-100 dark:border-slate-700 last:border-0 flex items-center gap-3"
                  >
                    <img
                      src={
                        game.coverUrl ||
                        "https://via.placeholder.com/40x60?text=?"
                      }
                      alt={game.name}
                      className="w-8 h-10 object-cover rounded bg-gray-200 dark:bg-slate-600"
                    />
                    <span className="font-medium text-sm">{game.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-wrap gap-4 mt-6">
            {games.map((game) => (
              <div
                key={game.gameId}
                className="group relative w-24 aspect-[3/4] rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-slate-700"
              >
                <img
                  src={game.coverUrl}
                  alt={game.name}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeGame(game.gameId)}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-xl relative z-10">
          <h2 className="text-xl font-bold mb-4">Top Agents / Characters</h2>
          <div className="relative">
            <input
              type="text"
              value={charQuery}
              onChange={(e) => setCharQuery(e.target.value)}
              className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="Search characters (e.g. Mario, Jett)..."
            />
            {loadingChars && (
              <div className="absolute right-4 top-3.5 text-gray-400 text-sm">
                Searching...
              </div>
            )}

            {charResults.length > 0 && (
              <ul className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                {charResults.map((char) => (
                  <li
                    key={char.characterId}
                    onClick={() => addCharacter(char)}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer transition-colors border-b border-gray-100 dark:border-slate-700 last:border-0 flex items-center gap-3"
                  >
                    <img
                      src={
                        char.imageUrl ||
                        "https://via.placeholder.com/40x40?text=?"
                      }
                      alt={char.name}
                      className="w-8 h-8 object-cover rounded-full bg-gray-200 dark:bg-slate-600"
                    />
                    <span className="font-medium text-sm">{char.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            {topCharacters.map((char) => (
              <div
                key={char.characterId}
                className="flex items-center gap-2 bg-gray-100 dark:bg-slate-800 px-3 py-2 rounded-full border border-gray-200 dark:border-slate-700"
              >
                <img
                  src={char.imageUrl}
                  alt={char.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <span className="text-sm font-bold">{char.name}</span>
                <button
                  type="button"
                  onClick={() => removeCharacter(char.characterId)}
                  className="ml-2 text-gray-400 hover:text-red-500"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-600/30 transform transition-all active:scale-95 text-lg"
        >
          Save Identity
        </button>
      </form>
    </div>
  );
};

export default CreateProfile;
