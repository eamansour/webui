/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';
import { useCallback, useEffect, useState } from 'react';
import { BreadCrumbProps } from '@/utils/interfaces';
import { HOME } from '@/utils/constants/breadcrumb';
import { usePathname, useSearchParams } from 'next/navigation';

const SESSION_STORAGE_KEY = 'breadCrumbHistory';

/**
 * Function to check if two routes are the same ignoring the 'tab' query parameter
 * Prevents duplicate breadcrumbs when switching tabs on the same Test Run page
 */
function isSameRouteIgnoringTab(route1: string, route2: string): boolean {
  if (!route1 || !route2) {
    return false;
  }

  const [path1, query1] = route1.split('?');
  const [path2, query2] = route2.split('?');

  // Different paths = different routes
  if (path1 !== path2) {
    return false;
  }

  // Same path, no queries = same route
  if (!query1 && !query2) {
    return true;
  }

  // Remove 'tab' parameter from both query strings
  const params1 = new URLSearchParams(query1 || '');
  const params2 = new URLSearchParams(query2 || '');
  params1.delete('tab');
  params2.delete('tab');

  // Compare the remaining parameters
  const paramsMatch = params1.toString() === params2.toString();
  return paramsMatch;
}

/**
 * Custom Hook to manage BreadCrumbs history and save it to the sessionStorage
 *
 * @returns breadCrumbItems - current bread crumb items in the history
 * @returns pushBreadCrumb - function to add bread crumb to the history
 * @returns resetBreadCrumbs - function to reset all breadcrumbs to HOME
 */
export default function useHistoryBreadCrumbs() {
  const [items, setItems] = useState<BreadCrumbProps[]>([]);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Load items initially from session storage
  useEffect(() => {
    const storedItems = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (storedItems) {
      setItems(JSON.parse(storedItems));
    } else {
      // Default starting point
      setItems([HOME]);
    }
  }, []);

  // Function to add a new breadcrumb item
  const pushBreadCrumb = useCallback((item: BreadCrumbProps) => {
    // Avoid duplicate items (If the user refreshes the page, it will not add the same item again)
    setItems((prevItems) => {
      const newItems = [...prevItems];
      const lastItem = newItems[newItems.length - 1];

      // Check if this is a duplicate, ignoring 'tab' parameter on Test Runs page
      if (!lastItem || !isSameRouteIgnoringTab(lastItem.route, item.route)) {
        newItems.push(item);
      }
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newItems));
      return newItems;
    });
  }, []);

  // Funtion to reset the breadcrumbs (e.g. when clicking HOME)
  const resetBreadCrumbs = useCallback((baseItems: BreadCrumbProps[] = [HOME]) => {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(baseItems));
    setItems(baseItems);
  }, []);

  // Handle browser backward/forward navigation
  useEffect(() => {
    const queryString = searchParams.toString();
    const fullPath = queryString ? `${pathname}?${queryString}` : pathname;

    if (fullPath === '/test-runs') {
      // If the path is '/test-runs', reset to HOME
      resetBreadCrumbs([HOME]);
      return;
    }

    setItems((prevItems) => {
      const currentPathIndex = prevItems.findIndex((item) => item.route === fullPath);

      let finalItems = prevItems;
      // If the current path is found in our history, truncate the list to that point
      if (currentPathIndex > -1) {
        const truncatedItems = prevItems.slice(0, currentPathIndex);
        sessionStorage.setItem(
          SESSION_STORAGE_KEY,
          truncatedItems.length <= 0 ? JSON.stringify([HOME]) : JSON.stringify(truncatedItems)
        );
        finalItems = truncatedItems;
      }
      return finalItems;
    });
  }, [pathname, searchParams, resetBreadCrumbs]);

  return { breadCrumbItems: items, pushBreadCrumb, resetBreadCrumbs };
}
