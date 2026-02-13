import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';

const PermissionsContext = createContext(null);

export function PermissionsProvider({ children }) {
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('field_permissions')
        .select('*');

      if (error) {
        // Default: all fields editable if table doesn't exist
        setPermissions({});
        return;
      }

      // Convert to a lookup object: { FIELD_NAME: { editable: true/false, category: '...' } }
      const permsMap = {};
      data?.forEach(p => {
        permsMap[p.field_name] = {
          editable: p.editable,
          category: p.category || 'general'
        };
      });
      setPermissions(permsMap);
    } catch (_e) {
      setPermissions({});
    } finally {
      setLoading(false);
    }
  };

  // Check if a specific field is editable
  // Default to LOCKED unless explicitly allowed in field_permissions.
  const isFieldEditable = (fieldName) => {
    if (!permissions[fieldName]) return false; // Default: locked if not specified
    return Boolean(permissions[fieldName].editable);
  };

  // Check if any field in a list is editable (for showing/hiding Edit button)
  const hasAnyEditableField = (fieldNames) => {
    return fieldNames.some(field => isFieldEditable(field));
  };

  // Refresh permissions (call after admin makes changes)
  const refreshPermissions = () => {
    fetchPermissions();
  };

  return (
    <PermissionsContext.Provider value={{ 
      permissions, 
      loading, 
      isFieldEditable, 
      hasAnyEditableField,
      refreshPermissions 
    }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
}
