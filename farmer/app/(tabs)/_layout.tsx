import { Tabs } from 'expo-router';
import React from 'react';
import { CustomTabBar } from '@/components/custom-tab-bar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen
        name="navigation"
        options={{ title: 'Nav' }}
      />
      <Tabs.Screen
        name="history"
        options={{ title: 'History' }}
      />
      <Tabs.Screen
        name="new-product"
        options={{ title: 'New' }}
      />
      <Tabs.Screen
        name="insights"
        options={{ title: 'Insights' }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Settings' }}
      />
      <Tabs.Screen
        name="scan"
        options={{ title: 'Scan' }}
      />
      {/* Marketplace is hidden or removed in favor of the new design */}
      <Tabs.Screen
        name="marketplace"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="index"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="main"
        options={{ href: null }}
      />
    </Tabs>
  );
}
