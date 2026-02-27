import { Tabs } from 'expo-router';
import React from 'react';
import "../../global.css"
import { CustomTabBar } from '@/components/custom-tab-bar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen
        name="navigation"
        options={{ title: 'Nav' }}
      />
      <Tabs.Screen
        name="index"
        options={{ title: 'Marketplace' }}
      />
      <Tabs.Screen
        name="all-orders"
        options={{ title: 'All Orders' }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile' }}
      />
    </Tabs>
  );
}
