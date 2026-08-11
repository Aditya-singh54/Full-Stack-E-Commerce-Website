import React, { createContext, useState, useEffect } from 'react';

export const CompareContext = createContext();

export const CompareProvider = ({ children }) => {
  const [compareItems, setCompareItems] = useState([]);

  // Load comparison list from sessionStorage on mount
  useEffect(() => {
    const storedCompare = sessionStorage.getItem('compareItems');
    if (storedCompare) {
      try {
        setCompareItems(JSON.parse(storedCompare));
      } catch (e) {
        console.error('Error loading compare items:', e);
      }
    }
  }, []);

  const addToCompare = (product) => {
    // Check if already in list
    if (compareItems.some((item) => item._id === product._id)) {
      return { success: false, message: 'Product is already in the comparison list.' };
    }

    // Limit to 3 items
    if (compareItems.length >= 3) {
      return { success: false, message: 'You can compare a maximum of 3 products.' };
    }

    const updated = [...compareItems, product];
    setCompareItems(updated);
    sessionStorage.setItem('compareItems', JSON.stringify(updated));
    return { success: true };
  };

  const removeFromCompare = (productId) => {
    const updated = compareItems.filter((item) => item._id !== productId);
    setCompareItems(updated);
    sessionStorage.setItem('compareItems', JSON.stringify(updated));
  };

  const clearCompare = () => {
    setCompareItems([]);
    sessionStorage.removeItem('compareItems');
  };

  const isInCompare = (productId) => {
    return compareItems.some((item) => item._id === productId);
  };

  return (
    <CompareContext.Provider
      value={{
        compareItems,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};
