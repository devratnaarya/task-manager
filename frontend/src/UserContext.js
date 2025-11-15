import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentOrganization, setCurrentOrganization] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const storedUser = localStorage.getItem('currentUser');
    const storedOrg = localStorage.getItem('currentOrganization');
    const storedToken = localStorage.getItem('authToken');

    if (storedUser && storedToken) {
      setCurrentUser(JSON.parse(storedUser));
      setCurrentOrganization(storedOrg ? JSON.parse(storedOrg) : null);
      setIsAuthenticated(true);
    }
  }, []);

  const login = (user, organization, token) => {
    setCurrentUser(user);
    setCurrentOrganization(organization);
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('currentOrganization', JSON.stringify(organization));
    localStorage.setItem('authToken', token);
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentOrganization(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentOrganization');
    localStorage.removeItem('authToken');
  };

  const getAPIHeaders = () => {
    return {
      'X-Organization-ID': currentOrganization?.id || 'null',
      'X-User-Name': currentUser?.name || 'Guest',
      'X-User-Role': currentUser?.role || 'Developer'
    };
  };

  const hasRole = (roles) => {
    if (!currentUser) return false;
    return roles.includes(currentUser.role);
  };

  const canAccessTab = (tab) => {
    if (!currentUser) return false;
    
    const permissions = {
      dashboard: ['SuperAdmin', 'Admin', 'Product', 'Developer', 'Ops'],
      projects: ['SuperAdmin', 'Admin', 'Product', 'Developer'],
      kanban: ['SuperAdmin', 'Admin', 'Product', 'Developer'],
      todo: ['SuperAdmin', 'Admin', 'Product', 'Developer', 'Ops'],
      weekly: ['SuperAdmin', 'Admin', 'Product', 'Developer', 'Ops'],
      team: ['SuperAdmin', 'Admin'],
      departments: ['SuperAdmin', 'Admin'],
      performance: ['SuperAdmin', 'Admin'],
      organizations: ['SuperAdmin']
    };

    return permissions[tab]?.includes(currentUser.role) || false;
  };

  const canCreateProject = () => hasRole(['SuperAdmin', 'Admin', 'Product']);
  const canCreateStory = () => hasRole(['SuperAdmin', 'Admin', 'Product']);
  const canCreateTask = () => hasRole(['SuperAdmin', 'Admin', 'Product', 'Developer']);
  const canUpdateTaskStatus = () => hasRole(['SuperAdmin', 'Admin', 'Developer']);

  return (
    <UserContext.Provider value={{
      currentUser,
      currentOrganization,
      isAuthenticated,
      login,
      logout,
      getAPIHeaders,
      hasRole,
      canAccessTab,
      canCreateProject,
      canCreateStory,
      canCreateTask,
      canUpdateTaskStatus
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};
