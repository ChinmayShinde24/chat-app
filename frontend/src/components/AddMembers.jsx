import React, { useContext, useEffect, useState } from "react";
import { ChatContext } from "../context/ChatContext";
import axios from "axios";
import assets from "../assets/assets";

const AddMembers = ({ group }) => {
  const { addMemberToGroup } = useContext(ChatContext);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // get all users
  useEffect(() => {
    if (!open) return;
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get("/api/messages/users"); // adjust endpoint name
        setAllUsers(data.users);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [open]);

  const existingIds = group?.members?.map(m => m._id) || [];

  const filteredUsers = Array.isArray(allUsers)
  ? allUsers.filter((u) =>
      u.fullName?.toLowerCase().includes(search.toLowerCase())
    )
  : [];


  const handleAdd = async (userId) => {
    await addMemberToGroup(group._id, userId);
    // optionally refresh modal list
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition"
      >
        Add Members
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
          <div className="bg-[#2a2b3c] rounded-xl w-full max-w-md p-4 relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
            >
              ✕
            </button>
            <h2 className="text-lg font-semibold mb-3 text-white">Add Members</h2>

            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-2 mb-3 rounded bg-[#1e1e2d] text-gray-200 border border-gray-600"
            />

            <div className="max-h-80 overflow-y-auto space-y-2">
              {loading ? (
                <p className="text-gray-400 text-center py-4">Loading...</p>
              ) : filteredUsers.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No users found</p>
              ) : (
                filteredUsers.map((user) => {
                  const isMember = existingIds.includes(user._id);
                  return (
                    <div
                      key={user._id}
                      className="flex justify-between items-center bg-[#1e1e2d] p-2 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={user.profilePic || assets.avatar_icon}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span className="text-gray-200">{user.fullName}</span>
                      </div>
                      <button
                        disabled={isMember}
                        onClick={() => !isMember && handleAdd(user._id)}
                        className={`px-3 py-1 text-sm rounded ${
                          isMember
                            ? "bg-gray-600 cursor-not-allowed text-gray-300"
                            : "bg-indigo-600 hover:bg-indigo-500 text-white"
                        }`}
                      >
                        {isMember ? "Already a member" : "Add"}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddMembers;
