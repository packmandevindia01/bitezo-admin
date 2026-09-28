import { Loader, Button, Modal } from "../../../components/common";
import UserTable from "../components/UserTable";
import UserForm from "../components/UserForm";
import PasswordChangeForm from "../components/PasswordChangeForm";
import { useUserManager } from "../hooks/useUserManager";

const UserList = () => {
  const {
    users,
    loading,
    editUser,
    editOpen,
    createOpen,
    deleteId,
    passwordUser,
    passwordOpen,
    passwordError,
    passwordLoading,
    setPasswordError,
    openCreate,
    closeCreate,
    openEdit,
    closeEdit,
    openPasswordChange,
    closePasswordChange,
    openDelete,
    closeDelete,
    handleCreate,
    handleEditSubmit,
    handlePasswordChange,
    confirmDelete,
  } = useUserManager();

  return (
    <>
      {loading && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <Loader />
        </div>
      )}

      {/* USER TABLE */}
      <UserTable
        users={users}
        onEdit={openEdit}
        onDelete={openDelete}
        onChangePassword={openPasswordChange}
        onAdd={openCreate}
      />

      {/* CREATE MODAL */}
      <Modal
        isOpen={createOpen}
        onClose={closeCreate}
        title="Add User"
      >
        <UserForm
          onSubmit={handleCreate}
          isEdit={false}
        />
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        isOpen={editOpen}
        onClose={closeEdit}
        title={`Edit User — ${editUser?.name ?? ""}`}
      >
        <UserForm
          initialData={editUser}
          onSubmit={handleEditSubmit}
          isEdit={true}
        />
      </Modal>

      {/* CHANGE PASSWORD MODAL */}
      <Modal
        isOpen={passwordOpen}
        onClose={closePasswordChange}
        title={`Change Password — ${passwordUser?.name ?? ""}`}
      >
        <PasswordChangeForm
          onSubmit={handlePasswordChange}
          onCancel={closePasswordChange}
          serverError={passwordError}
          loading={passwordLoading}
          onClearServerError={() => setPasswordError(null)}
        />
      </Modal>

      {/* DELETE CONFIRM MODAL */}
      <Modal
        isOpen={deleteId !== null}
        onClose={closeDelete}
        title="Confirm Delete"
      >
        <div className="text-center space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete this user?
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="secondary" onClick={closeDelete}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default UserList;
