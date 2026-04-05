import { useState } from "react";
import { useSelector } from "react-redux";
import { PuffLoader } from "react-spinners";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
  useDeleteUserMutation,
  useGetAllUsersProfilesQuery,
  useUpdateAdminUserMutation,
} from "../../features/APIS/UserApi";

import "../adminDashboard/style.css";
import { FaEdit, FaSearch, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FaTrashCan, FaUserShield, FaUserGroup } from "react-icons/fa6";

/**
 * Interface for User Data
 */
interface userData {
  nationalId: number;
  address: string;
  createdAt: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

const MySwal = withReactContent(Swal);

export const AllUsers = () => {
  // --- API Hooks ---
  const { data: AllUsersData = [], isLoading, error } = useGetAllUsersProfilesQuery({ pollingInterval: 30000 });
  const [deleteUser] = useDeleteUserMutation();
  const [updateUser] = useUpdateAdminUserMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; 

  const admin = useSelector((state: any) => state.auth.user);
  const adminName = admin?.firstName || "Admin";

  // --- Search Logic ---
  const filteredUsers = AllUsersData.filter((user: userData) => {
    const lowerSearch = searchTerm.toLowerCase();
    return (
      user.firstName.toLowerCase().includes(lowerSearch) ||
      user.lastName.toLowerCase().includes(lowerSearch) ||
      user.nationalId.toString().includes(lowerSearch)
    );
  });

  // --- Pagination Logic ---
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // --- Action Handlers ---

  const handleDelete = async (nationalId: number) => {
    const confirm = await MySwal.fire({
      title: "Confirm Deletion",
      text: "This user profile will be permanently removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#374151",
      confirmButtonText: "Yes, delete it",
      background: "rgba(15, 23, 42, 0.8)",
      color: "#f3f4f6",
      customClass: { popup: "glass-modal rounded-[2rem] border border-white/10 backdrop-blur-xl" },
    });

    if (confirm.isConfirmed) {
      try {
        await deleteUser(nationalId).unwrap();
        MySwal.fire({
          title: "Success",
          text: "User profile removed.",
          icon: "success",
          background: "rgba(15, 23, 42, 0.8)",
          color: "#f3f4f6",
        });
      } catch {
        MySwal.fire({ title: "Error", text: "Delete operation failed.", icon: "error" });
      }
    }
  };

  const handleEdit = async (user: userData) => {
    const { value: formValues } = await MySwal.fire({
      title: `Update ${user.firstName}'s Profile`,
      background: "rgba(15, 23, 42, 0.8)",
      color: "#f8fafc",
      customClass: { popup: "glass-modal rounded-[2.5rem] border border-blue-500/20 shadow-2xl backdrop-blur-xl" },
      html: `
        <div class="flex flex-col gap-4 p-4 text-left">
          <div class="grid grid-cols-2 gap-3">
             <div>
               <label class="text-[10px] uppercase font-black opacity-40 ml-2">First Name</label>
               <input id="swal-input1" class="swal2-input !m-0 !w-full !rounded-xl !bg-slate-800/50 !border-slate-700" value="${user.firstName}">
             </div>
             <div>
               <label class="text-[10px] uppercase font-black opacity-40 ml-2">Last Name</label>
               <input id="swal-input2" class="swal2-input !m-0 !w-full !rounded-xl !bg-slate-800/50 !border-slate-700" value="${user.lastName}">
             </div>
          </div>
          <div>
            <label class="text-[10px] uppercase font-black opacity-40 ml-2">Email Address</label>
            <input id="swal-input3" class="swal2-input !m-0 !w-full !rounded-xl !bg-slate-800/50 !border-slate-700" value="${user.email}">
          </div>
          <div class="relative">
            <label class="text-[10px] uppercase font-black opacity-40 ml-2">Password (Change or View)</label>
            <input id="swal-input4" type="password" class="swal2-input !m-0 !w-full !rounded-xl !bg-slate-800/50 !border-slate-700" placeholder="••••••••">
            <button type="button" id="togglePassword" class="absolute right-4 bottom-3 text-primary text-xs font-bold uppercase tracking-widest">Show</button>
          </div>
          <div>
            <label class="text-[10px] uppercase font-black opacity-40 ml-2">Access Role</label>
            <select id="swal-input5" class="swal2-input !m-0 !w-full !rounded-xl !bg-slate-800/50 !border-slate-700">
              <option value="user" ${user.role === "user" ? "selected" : ""}>Standard User</option>
              <option value="admin" ${user.role === "admin" ? "selected" : ""}>Administrator</option>
            </select>
          </div>
        </div>
      `,
      didOpen: () => {
        const toggleBtn = document.getElementById("togglePassword");
        const passwordInput = document.getElementById("swal-input4") as HTMLInputElement;
        toggleBtn?.addEventListener("click", () => {
          const isPassword = passwordInput.type === "password";
          passwordInput.type = isPassword ? "text" : "password";
          toggleBtn.innerText = isPassword ? "Hide" : "Show";
        });
      },
      preConfirm: () => {
        const firstName = (document.getElementById("swal-input1") as HTMLInputElement).value;
        const lastName = (document.getElementById("swal-input2") as HTMLInputElement).value;
        const email = (document.getElementById("swal-input3") as HTMLInputElement).value;
        const password = (document.getElementById("swal-input4") as HTMLInputElement).value;
        const role = (document.getElementById("swal-input5") as HTMLSelectElement).value;

        if (!firstName || !lastName || !email) {
          Swal.showValidationMessage("Please fill in the required fields.");
          return false;
        }

        const payload: any = { nationalId: user.nationalId, firstName, lastName, email, role };
        if (password) payload.password = password;
        return payload;
      },
    });

    if (formValues) {
      try {
        await updateUser(formValues).unwrap();
        MySwal.fire({ title: "Updated", icon: "success", background: "rgba(15, 23, 42, 0.8)", color: "#fff" });
      } catch {
        MySwal.fire({ title: "Update Failed", icon: "error" });
      }
    }
  };

  return (
    <div className="min-h-screen bg-base-100 p-4 md:p-8 font-sans transition-all duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-base-200/50 backdrop-blur-xl p-8 rounded-[2rem] border border-base-content/5 shadow-2xl">
          <div>
            <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-base-content">
              👋 Welcome, <span className="text-primary">{adminName}</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mt-2 ml-1">Central User Registry Dashboard</p>
          </div>
          <div className="text-right">
             <p className="text-xs font-black uppercase tracking-widest opacity-30 italic">Administrator Portal</p>
          </div>
        </div>

        {/* Main Table Interface */}
        <div className="bg-base-200/30 backdrop-blur-md border border-base-content/5 rounded-[3rem] shadow-inner p-6 md:p-10">
          
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-10">
            <h2 className="text-xl font-black uppercase tracking-tighter italic">
              User Directory <span className="text-primary opacity-50">[{filteredUsers.length}]</span>
            </h2>
            
            <div className="relative w-full lg:max-w-md group">
              <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:text-primary group-focus-within:opacity-100 transition-all" />
              <input
                type="text"
                placeholder="Search by name, email or ID..."
                className="w-full pl-14 pr-6 py-4 bg-base-100/50 rounded-2xl border border-base-content/10 outline-none focus:ring-2 focus:ring-primary/20 font-bold text-[10px] tracking-[0.2em] uppercase"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {error ? (
            <div className="p-20 text-center bg-error/10 rounded-[2rem] border border-error/20">
               <p className="text-error font-black uppercase tracking-widest">System Sync Error</p>
               <button onClick={() => window.location.reload()} className="mt-4 text-xs font-bold underline opacity-50">Retry Connection</button>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center h-96 gap-6">
              <PuffLoader color="hsl(var(--p))" size={60} />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30 animate-pulse">Initializing Data Stream...</span>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="overflow-x-auto rounded-[2rem]">
                <table className="table w-full border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 border-none">
                      <th className="bg-transparent px-8">Names</th>
                      <th className="bg-transparent">Email</th>
                      <th className="bg-transparent">Role </th>
                      <th className="bg-transparent">Reg Date</th>
                      <th className="bg-transparent text-right pr-8">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.map((user: userData, index: number) => (
                      <tr key={index} className="bg-base-100/40 hover:bg-base-100/80 transition-all border-none">
                        <td className="px-8 py-5 rounded-l-3xl">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center font-black text-primary italic shadow-inner">
                              {user.firstName[0]}{user.lastName[0]}
                            </div>
                            <div>
                              <p className="font-black text-xs uppercase tracking-tighter">{user.firstName} {user.lastName}</p>
                              <p className="text-[10px] opacity-40 font-bold italic tracking-wider">ID: {user.nationalId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="text-[11px] font-bold opacity-60 italic">{user.email}</td>
                        <td>
                          <div className={`badge badge-outline gap-2 font-black italic uppercase text-[8px] tracking-[0.2em] p-3 rounded-xl ${
                            user.role === 'admin' ? "badge-primary shadow-lg shadow-primary/10" : "opacity-40"
                          }`}>
                            {user.role === 'admin' ? <FaUserShield size={10}/> : <FaUserGroup size={10}/>}
                            {user.role}
                          </div>
                        </td>
                        <td className="text-[10px] font-bold opacity-30 uppercase tracking-widest">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="rounded-r-3xl text-right pr-8">
                          <div className="flex justify-end gap-3 transition-opacity">
                            <button 
                              onClick={() => handleEdit(user)}
                              className="p-3 bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                              title="Edit Profile"
                            >
                              <FaEdit size={14} />
                            </button>
                            <button 
                              onClick={() => handleDelete(user.nationalId)}
                              className="p-3 bg-error/10 text-error rounded-xl hover:bg-error hover:text-white transition-all shadow-sm"
                              title="Delete User"
                            >
                              <FaTrashCan size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Section */}
              <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-base-content/5 gap-6">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-20">
                  Showing {paginatedUsers.length} of {filteredUsers.length} total entries
                </p>
                
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-4 rounded-2xl bg-base-100 border border-base-content/5 hover:bg-primary/10 disabled:opacity-20 transition-all shadow-md"
                  >
                    <FaChevronLeft size={12} />
                  </button>
                  
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-black italic text-primary">{currentPage}</span>
                    <span className="text-xs font-black opacity-20 mx-1">/</span>
                    <span className="text-xs font-black opacity-40">{totalPages}</span>
                  </div>

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-4 rounded-2xl bg-base-100 border border-base-content/5 hover:bg-primary/10 disabled:opacity-20 transition-all shadow-md"
                  >
                    <FaChevronRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};