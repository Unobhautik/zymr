import React, { useState, useMemo } from 'react';
// removed unused Link import
import { format } from 'date-fns';
import UserModal from './UserModal';
import './UserList.css';

const UserList = ({ users, onUserUpdate, onUserCreate, onUserDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'edit', 'create'
  const usersPerPage = 10;

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter(user => {
      const searchLower = searchTerm.toLowerCase();
      return (
        (user.name && user.name.toLowerCase().includes(searchLower)) ||
        (user.email && user.email.toLowerCase().includes(searchLower))
      );
    });

    return filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle date sorting
      if (sortBy === 'createdAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      // Handle string sorting
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [users, searchTerm, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const paginatedUsers = filteredAndSortedUsers.slice(startIndex, startIndex + usersPerPage);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setModalMode('view');
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const handleUserSave = async (userData) => {
    try {
      if (modalMode === 'create') {
        const newUser = await onUserCreate(userData);
        console.log('User created:', newUser);
      } else if (modalMode === 'edit') {
        await onUserUpdate(userData);
        console.log('User updated:', userData);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Failed to save user. Please try again.');
    }
  };

  const handleUserDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await onUserDelete(userId);
        handleCloseModal();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="user-list-container">
      <div className="user-list-header">
        <h2 className="user-list-title">User Management</h2>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            className="sort-select"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
          </select>
          <button
            onClick={handleCreateUser}
            className="btn btn-primary"
          >
            + Add User
          </button>
        </div>
      </div>

      {paginatedUsers.length === 0 ? (
        <div className="no-users">
          <p>No users found matching your search criteria.</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="user-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('name')} className="sortable">
                    User {getSortIcon('name')}
                  </th>
                  <th>Email</th>
                  <th onClick={() => handleSort('createdAt')} className="sortable">
                    Joined {getSortIcon('createdAt')}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar-container">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={`${user.name} avatar`}
                              className="user-avatar"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className="user-avatar-placeholder"
                            style={{ display: user.avatar ? 'none' : 'flex' }}
                          >
                            {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                          </div>
                        </div>
                        <div className="user-info">
                          <div className="user-name">
                            {user.name || 'Unknown User'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="user-email">
                        {user.email || 'No email provided'}
                      </div>
                    </td>
                    <td>
                      <div className="user-date">
                        {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td>
                      <div className="user-actions">
                        <button
                          onClick={() => handleUserClick(user)}
                          className="btn btn-sm btn-secondary"
                          title="View Details"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEditUser(user)}
                          className="btn btn-sm btn-secondary"
                          title="Edit User"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleUserDelete(user.id)}
                          className="btn btn-sm btn-secondary"
                          title="Delete User"
                          style={{ color: '#dc2626' }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="btn btn-sm"
              >
                First
              </button>
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn btn-sm"
              >
                Previous
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`btn btn-sm ${currentPage === pageNum ? 'active' : ''}`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="btn btn-sm"
              >
                Next
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="btn btn-sm"
              >
                Last
              </button>
            </div>
          )}

          <div className="pagination-info">
            Showing {startIndex + 1} to {Math.min(startIndex + usersPerPage, filteredAndSortedUsers.length)} of {filteredAndSortedUsers.length} users
          </div>
        </>
      )}

      {/* User Modal */}
      {showModal && (
        <UserModal
          user={selectedUser}
          mode={modalMode}
          onClose={handleCloseModal}
          onSave={handleUserSave}
          onDelete={handleUserDelete}
          onRequestEdit={() => setModalMode('edit')}
        />
      )}
    </div>
  );
};

export default UserList;
