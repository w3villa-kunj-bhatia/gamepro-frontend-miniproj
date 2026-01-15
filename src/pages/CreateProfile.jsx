import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Loader from "../components/Loader";

const CreateProfile = () => {
  const [formData, setFormData] = useState({
    username: "",
    address: "",
    avatar: "",
    games: [],
    topCharacters: [],
  });

  const [gameSearch, setGameSearch] = useState("");
  const [gameResults, setGameResults] = useState([]);
  const [charSearch, setCharSearch] = useState("");
  const [charResults, setCharResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // Load existing profile data for editing
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

  // Debounced Game Search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (gameSearch.length > 2) {
        const res = await api.get(
          `/igdb/search?q=${encodeURIComponent(gameSearch)}`
        );
        setGameResults(res.data.data || []);
      } else {
        setGameResults([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [gameSearch]);

  // Debounced Character Search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (charSearch.length > 2) {
        const res = await api.get(
          `/igdb/characters?q=${encodeURIComponent(charSearch)}`
        );
        setCharResults(res.data.data || []);
      } else {
        setCharResults([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [charSearch]);

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
      await api.post("/profile", formData);
      navigate("/profile");
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 pt-24 overflow-y-auto">
      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl"
      >
        <h2 className="col-span-full text-2xl font-black uppercase tracking-tighter border-b border-slate-800 pb-4">
          Complete Your Operative Profile
        </h2>

        {/* IDENTITY SECTION */}
        <div className="space-y-4">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
            Identity & Location
          </label>
          <input
            required
            value={formData.username}
            placeholder="Gamer Username"
            className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl outline-none focus:border-indigo-500 transition-all"
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
          />
          <input
            value={formData.address}
            placeholder="Base Location (Address)"
            className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl outline-none focus:border-indigo-500 transition-all"
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
          />
          <input
            value={formData.avatar}
            placeholder="Avatar Image URL"
            className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl outline-none focus:border-indigo-500 transition-all"
            onChange={(e) =>
              setFormData({ ...formData, avatar: e.target.value })
            }
          />
        </div>

        {/* GAME SEARCH SECTION */}
        <div className="space-y-4 relative">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
            Deploy Arsenal (Games)
          </label>
          <input
            value={gameSearch}
            onChange={(e) => setGameSearch(e.target.value)}
            placeholder="Search IGDB for games..."
            className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl outline-none focus:border-indigo-500 transition-all"
          />
          {gameResults.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl max-h-48 overflow-y-auto shadow-2xl">
              {gameResults.map((g) => (
                <div
                  key={g.id}
                  onClick={() => addGame(g)}
                  className="p-3 hover:bg-slate-700 cursor-pointer text-xs border-b border-slate-700 last:border-0"
                >
                  {g.name}
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-2 pt-2">
            {formData.games.map((g, i) => (
              <div key={i} className="relative group">
                <img
                  src={g.coverUrl}
                  className="w-12 h-16 rounded object-cover border border-slate-700"
                  title={g.name}
                />
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      games: formData.games.filter((_, idx) => idx !== i),
                    })
                  }
                  className="absolute -top-1 -right-1 bg-red-600 rounded-full w-4 h-4 text-[8px] opacity-0 group-hover:opacity-100 transition-all"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* CHARACTER SEARCH SECTION */}
        <div className="col-span-full space-y-4 relative">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
            Select Top Characters
          </label>
          <input
            value={charSearch}
            onChange={(e) => setCharSearch(e.target.value)}
            placeholder="Search IGDB for characters..."
            className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl outline-none focus:border-indigo-500 transition-all"
          />
          {charResults.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl max-h-48 overflow-y-auto shadow-2xl">
              {charResults.map((char) => (
                <div
                  key={char.id}
                  onClick={() => addCharacter(char)}
                  className="flex items-center gap-3 p-3 hover:bg-slate-700 cursor-pointer text-xs border-b border-slate-700 last:border-0"
                >
                  <img
                    src={char.mug_shot?.url || "https://via.placeholder.com/40"}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span>{char.name}</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-6 pt-2">
            {formData.topCharacters.map((c, i) => (
              <div key={i} className="text-center group relative">
                <img
                  src={c.imageUrl}
                  className="w-16 h-16 rounded-full mx-auto border-2 border-indigo-500 object-cover"
                />
                <p className="text-[10px] mt-1 uppercase font-bold text-slate-400">
                  {c.name}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      topCharacters: formData.topCharacters.filter(
                        (_, idx) => idx !== i
                      ),
                    })
                  }
                  className="absolute -top-1 right-0 bg-red-600 rounded-full w-4 h-4 text-[8px] opacity-0 group-hover:opacity-100 transition-all"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="col-span-full bg-indigo-600 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-500 transition-all disabled:bg-slate-800 shadow-lg shadow-indigo-600/20"
        >
          {saving ? "Synchronizing Data..." : "Finalize Profile"}
        </button>
      </form>
    </div>
  );
};

export default CreateProfile;
