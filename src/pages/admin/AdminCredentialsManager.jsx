import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Check, X, Key, User, Mail, Shield, ShieldOff } from 'lucide-react';
import { toast } from '../../components/ui/ToastProvider';
import {
  getAdminCredentials,
  createAdminCredentials,
  updateAdminCredentials,
  updateAdminPassword,
  deleteAdminCredentials,
  toggleAdminStatus,
} from '../../services/adminAuthService';

export default function AdminCredentialsManager() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    setLoading(true);
    const { admins: data, error } = await getAdminCredentials();
    if (error) {
      toast(error, 'error');
    } else {
      setAdmins(data);
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!formData.username || !formData.email || !formData.password) {
      toast('All fields are required', 'error');
      return;
    }

    if (formData.password.length < 8) {
      toast('Password must be at least 8 characters', 'error');
      return;
    }

    setSaving(true);
    const { success, error } = await createAdminCredentials(
      formData.username,
      formData.email,
      formData.password
    );

    if (success) {
      toast('Admin created successfully', 'success');
      setShowCreateModal(false);
      setFormData({ username: '', email: '', password: '' });
      loadAdmins();
    } else {
      toast(error || 'Failed to create admin', 'error');
    }
    setSaving(false);
  };

  const handleUpdate = async () => {
    if (!formData.username || !formData.email) {
      toast('Username and email are required', 'error');
      return;
    }

    setSaving(true);
    const { success, error } = await updateAdminCredentials(selectedAdmin.id, {
      username: formData.username,
      email: formData.email,
    });

    if (success) {
      toast('Admin updated successfully', 'success');
      setShowEditModal(false);
      setSelectedAdmin(null);
      setFormData({ username: '', email: '', password: '' });
      loadAdmins();
    } else {
      toast(error || 'Failed to update admin', 'error');
    }
    setSaving(false);
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      toast('Password must be at least 8 characters', 'error');
      return;
    }

    setSaving(true);
    const { success, error } = await updateAdminPassword(selectedAdmin.id, newPassword);

    if (success) {
      toast('Password updated successfully', 'success');
      setShowPasswordModal(false);
      setSelectedAdmin(null);
      setNewPassword('');
    } else {
      toast(error || 'Failed to update password', 'error');
    }
    setSaving(false);
  };

  const handleDelete = async (admin) => {
    if (!confirm(`Are you sure you want to delete admin "${admin.username}"?`)) {
      return;
    }

    const { success, error } = await deleteAdminCredentials(admin.id);

    if (success) {
      toast('Admin deleted successfully', 'success');
      loadAdmins();
    } else {
      toast(error || 'Failed to delete admin', 'error');
    }
  };

  const handleToggleStatus = async (admin) => {
    const { success, error } = await toggleAdminStatus(admin.id, !admin.is_active);

    if (success) {
      toast(`Admin ${!admin.is_active ? 'activated' : 'deactivated'}`, 'success');
      loadAdmins();
    } else {
      toast(error || 'Failed to update status', 'error');
    }
  };

  const openEditModal = (admin) => {
    setSelectedAdmin(admin);
    setFormData({ username: admin.username, email: admin.email, password: '' });
    setShowEditModal(true);
  };

  const openPasswordModal = (admin) => {
    setSelectedAdmin(admin);
    setNewPassword('');
    setShowPasswordModal(true);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <p className="font-plex text-concrete">Loading admin credentials...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-grotesk font-bold text-[10px] uppercase tracking-widest text-concrete mb-1">
            Security
          </p>
          <h1 className="font-unica text-5xl uppercase tracking-tighter text-bone">
            ADMIN CREDENTIALS
          </h1>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-bone text-matte-black font-grotesk font-bold uppercase tracking-widest text-[10px] px-5 py-3 hover:bg-gold transition-colors"
        >
          <Plus size={14} /> CREATE ADMIN
        </button>
      </div>

      {/* Admin List */}
      <div className="border border-[#2a2a26]">
        <div className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 bg-[#1c1c18] px-6 py-4 border-b border-[#2a2a26]">
          <p className="font-grotesk font-bold text-[10px] uppercase tracking-widest text-concrete">Username</p>
          <p className="font-grotesk font-bold text-[10px] uppercase tracking-widest text-concrete">Email</p>
          <p className="font-grotesk font-bold text-[10px] uppercase tracking-widest text-concrete">Status</p>
          <p className="font-grotesk font-bold text-[10px] uppercase tracking-widest text-concrete">Last Login</p>
          <p className="font-grotesk font-bold text-[10px] uppercase tracking-widest text-concrete">Actions</p>
        </div>

        {admins.length === 0 ? (
          <div className="px-6 py-20 text-center">
            <Shield size={48} className="text-concrete/20 mx-auto mb-4" />
            <p className="font-plex text-concrete">No admin credentials found</p>
          </div>
        ) : (
          admins.map((admin) => (
            <div
              key={admin.id}
              className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 px-6 py-4 border-b border-[#2a2a26] hover:bg-[#1c1c18]/30 transition-colors items-center"
            >
              <div className="flex items-center gap-3">
                <User size={16} className="text-concrete" />
                <span className="font-plex text-sm text-bone">{admin.username}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-concrete" />
                <span className="font-plex text-sm text-concrete">{admin.email}</span>
              </div>
              <div>
                {admin.is_active ? (
                  <span className="inline-flex items-center gap-1 font-grotesk font-bold text-[9px] uppercase tracking-widest bg-green-900/30 text-green-400 px-2 py-1">
                    <Shield size={10} /> ACTIVE
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-grotesk font-bold text-[9px] uppercase tracking-widest bg-red-900/30 text-red-400 px-2 py-1">
                    <ShieldOff size={10} /> INACTIVE
                  </span>
                )}
              </div>
              <span className="font-plex text-xs text-concrete">
                {admin.last_login ? new Date(admin.last_login).toLocaleDateString() : 'Never'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(admin)}
                  className="text-concrete hover:text-bone transition-colors"
                  title="Edit"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => openPasswordModal(admin)}
                  className="text-concrete hover:text-bone transition-colors"
                  title="Change Password"
                >
                  <Key size={14} />
                </button>
                <button
                  onClick={() => handleToggleStatus(admin)}
                  className="text-concrete hover:text-bone transition-colors"
                  title={admin.is_active ? 'Deactivate' : 'Activate'}
                >
                  {admin.is_active ? <ShieldOff size={14} /> : <Shield size={14} />}
                </button>
                <button
                  onClick={() => handleDelete(admin)}
                  className="text-concrete hover:text-red-400 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0f0f0c] border border-[#2a2a26] w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a26]">
              <h3 className="font-unica text-2xl uppercase tracking-tighter text-bone">CREATE ADMIN</h3>
              <button onClick={() => setShowCreateModal(false)}>
                <X size={18} className="text-concrete hover:text-bone" />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div>
                <label className="font-plex text-xs uppercase tracking-widest text-concrete mb-2 block">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full bg-[#1c1c18] border border-[#2a2a26] focus:border-bone text-bone px-4 py-3 font-plex outline-none"
                  placeholder="admin"
                />
              </div>
              <div>
                <label className="font-plex text-xs uppercase tracking-widest text-concrete mb-2 block">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#1c1c18] border border-[#2a2a26] focus:border-bone text-bone px-4 py-3 font-plex outline-none"
                  placeholder="admin@44luxury.org"
                />
              </div>
              <div>
                <label className="font-plex text-xs uppercase tracking-widest text-concrete mb-2 block">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-[#1c1c18] border border-[#2a2a26] focus:border-bone text-bone px-4 py-3 pr-12 font-plex outline-none"
                    placeholder="Min. 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-concrete hover:text-bone"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={handleCreate}
                disabled={saving}
                className="flex-1 bg-bone text-matte-black font-grotesk font-bold uppercase tracking-widest text-xs py-3 hover:bg-gold transition-colors disabled:opacity-50"
              >
                {saving ? 'CREATING...' : 'CREATE'}
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                disabled={saving}
                className="flex-1 border border-[#2a2a26] text-concrete hover:text-bone font-grotesk font-bold uppercase tracking-widest text-xs py-3 transition-colors"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0f0f0c] border border-[#2a2a26] w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a26]">
              <h3 className="font-unica text-2xl uppercase tracking-tighter text-bone">EDIT ADMIN</h3>
              <button onClick={() => setShowEditModal(false)}>
                <X size={18} className="text-concrete hover:text-bone" />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div>
                <label className="font-plex text-xs uppercase tracking-widest text-concrete mb-2 block">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full bg-[#1c1c18] border border-[#2a2a26] focus:border-bone text-bone px-4 py-3 font-plex outline-none"
                />
              </div>
              <div>
                <label className="font-plex text-xs uppercase tracking-widest text-concrete mb-2 block">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#1c1c18] border border-[#2a2a26] focus:border-bone text-bone px-4 py-3 font-plex outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={handleUpdate}
                disabled={saving}
                className="flex-1 bg-bone text-matte-black font-grotesk font-bold uppercase tracking-widest text-xs py-3 hover:bg-gold transition-colors disabled:opacity-50"
              >
                {saving ? 'SAVING...' : 'SAVE'}
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                disabled={saving}
                className="flex-1 border border-[#2a2a26] text-concrete hover:text-bone font-grotesk font-bold uppercase tracking-widest text-xs py-3 transition-colors"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0f0f0c] border border-[#2a2a26] w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a26]">
              <h3 className="font-unica text-2xl uppercase tracking-tighter text-bone">CHANGE PASSWORD</h3>
              <button onClick={() => setShowPasswordModal(false)}>
                <X size={18} className="text-concrete hover:text-bone" />
              </button>
            </div>
            <div className="p-6">
              <p className="font-plex text-sm text-concrete mb-4">
                Changing password for: <span className="text-bone">{selectedAdmin.username}</span>
              </p>
              <div>
                <label className="font-plex text-xs uppercase tracking-widest text-concrete mb-2 block">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#1c1c18] border border-[#2a2a26] focus:border-bone text-bone px-4 py-3 pr-12 font-plex outline-none"
                    placeholder="Min. 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-concrete hover:text-bone"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={handleUpdatePassword}
                disabled={saving}
                className="flex-1 bg-bone text-matte-black font-grotesk font-bold uppercase tracking-widest text-xs py-3 hover:bg-gold transition-colors disabled:opacity-50"
              >
                {saving ? 'UPDATING...' : 'UPDATE PASSWORD'}
              </button>
              <button
                onClick={() => setShowPasswordModal(false)}
                disabled={saving}
                className="flex-1 border border-[#2a2a26] text-concrete hover:text-bone font-grotesk font-bold uppercase tracking-widest text-xs py-3 transition-colors"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

