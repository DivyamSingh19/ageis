import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../../context/auth-context';
import { LinearGradient } from 'expo-linear-gradient';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ProfileScreen() {
  const { user, logout, token } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  // Form state
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [phone, setPhone] = useState('');
  const [zip, setZip] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    if (!user || !token) return;
    try {
      const response = await fetch(`${API_URL}/api/user/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setProfile(data.data);
        setAddress1(data.data.addressLine01 || '');
        setAddress2(data.data.addressLine02 || '');
        setPhone(data.data.phoneNumber || '');
        setZip(data.data.postalCode || '');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          addressLine01: address1,
          addressLine02: address2,
          phoneNumber: phone,
          postalCode: zip
        })
      });
      const data = await response.json();
      if (response.ok) {
        setProfile(data.data);
        setEditing(false);
        Alert.alert("Success", "Profile updated successfully");
      } else {
        Alert.alert("Error", data.message || "Failed to update profile");
      }
    } catch (e) {
      Alert.alert("Error", "Network error");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#39FF14" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <TouchableOpacity onPress={() => setEditing(!editing)}>
            <Text style={styles.editLink}>{editing ? 'Cancel' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>

        {editing ? (
          <View style={styles.form}>
            <Text style={styles.label}>Address Line 1</Text>
            <TextInput style={styles.input} value={address1} onChangeText={setAddress1} placeholder="Street address" placeholderTextColor="#444" />

            <Text style={styles.label}>Address Line 2</Text>
            <TextInput style={styles.input} value={address2} onChangeText={setAddress2} placeholder="Apartment, suite, etc." placeholderTextColor="#444" />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.label}>Phone</Text>
                <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Phone number" placeholderTextColor="#444" keyboardType="phone-pad" />
              </View>
              <View style={{ width: 100 }}>
                <Text style={styles.label}>ZIP</Text>
                <TextInput style={styles.input} value={zip} onChangeText={setZip} placeholder="Code" placeholderTextColor="#444" keyboardType="numeric" />
              </View>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <LinearGradient colors={['#39FF14', '#28cc0d']} style={styles.saveGradient}>
                <Text style={styles.saveText}>Save Changes</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.infoBox}>
            <InfoItem label="Address" value={profile ? `${profile.addressLine01}\n${profile.addressLine02}` : 'Not set'} />
            <InfoItem label="Phone" value={profile?.phoneNumber || 'Not set'} />
            <InfoItem label="Postal Code" value={profile?.postalCode || 'Not set'} />
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function InfoItem({ label, value }: { label: string, value: string }) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  content: { padding: 20, paddingBottom: 40 },
  centered: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', marginTop: 40, marginBottom: 30 },
  avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#111', borderWidth: 1, borderColor: '#39FF14', alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  avatarText: { color: '#39FF14', fontSize: 32, fontWeight: '700' },
  name: { color: '#fff', fontSize: 24, fontWeight: '700' },
  email: { color: '#888', fontSize: 14, marginTop: 4 },
  section: { backgroundColor: '#0a0a0a', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#1a1a1a' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '600' },
  editLink: { color: '#39FF14', fontSize: 14 },
  infoBox: { gap: 16 },
  infoItem: { borderBottomWidth: 1, borderBottomColor: '#111', paddingBottom: 12 },
  infoLabel: { color: '#555', fontSize: 12, marginBottom: 4 },
  infoValue: { color: '#ddd', fontSize: 15 },
  form: { gap: 12 },
  label: { color: '#888', fontSize: 13, marginBottom: 4 },
  input: { backgroundColor: '#111', borderWidth: 1, borderColor: '#222', borderRadius: 8, padding: 12, color: '#fff' },
  row: { flexDirection: 'row' },
  saveBtn: { marginTop: 10, borderRadius: 8, overflow: 'hidden' },
  saveGradient: { paddingVertical: 14, alignItems: 'center' },
  saveText: { color: '#000', fontWeight: '700' },
  logoutBtn: { marginTop: 40, padding: 16, alignItems: 'center' },
  logoutText: { color: '#ff4b4b', fontWeight: '600' }
});
