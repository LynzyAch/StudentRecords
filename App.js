import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BASE_URl } from './config';

const StudentForm = ({
  name,
  setName,
  course,
  setCourse,
  year,
  setYear,
  saving,
  createStudent,
  formError,
  success,
  listError,
  refreshing,
  fetchStudents,
  students,
}) => {
  return (
    <View>
      <Text style={styles.title}>Student Records</Text>
      <Text style={styles.subtitle}>Manage student information</Text>

      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Add Student</Text>

        <TextInput
          style={styles.input}
          placeholder="Student name"
          value={name}
          onChangeText={setName}
          editable={!saving}
          autoCapitalize="words"
          returnKeyType="next"
        />

        <TextInput
          style={styles.input}
          placeholder="Course (e.g. BSIT)"
          value={course}
          onChangeText={setCourse}
          editable={!saving}
          returnKeyType="next"
        />

        <TextInput
          style={styles.input}
          placeholder="Year level"
          value={year}
          onChangeText={setYear}
          keyboardType="number-pad"
          editable={!saving}
          returnKeyType="done"
        />

        {formError ? (
          <Text style={styles.error}>{formError}</Text>
        ) : null}

        {success ? (
          <Text style={styles.success}>{success}</Text>
        ) : null}

        <TouchableOpacity
          style={[styles.addButton, saving && styles.disabledButton]}
          onPress={createStudent}
          disabled={saving}
          accessibilityRole="button"
        >
          {saving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>+ Add Student</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.listHeader}>
        <View style={styles.listTitleRow}>
          <Text style={styles.sectionTitle}>Student List</Text>

          <View style={styles.countBadge}>
            <Text style={styles.countText}>Record: {students.length}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => fetchStudents(true)}
          disabled={refreshing}
          accessibilityRole="button"
        >
          {refreshing ? (
            <ActivityIndicator color="#2563eb" size="small" />
          ) : (
            <Text style={styles.refreshText}>↻ Refresh</Text>
          )}
        </TouchableOpacity>
      </View>

      {listError ? (
        <Text style={styles.error}>{listError}</Text>
      ) : null}
    </View>
  );
};

export default function App() {
  const [students, setStudents] = useState([]);
  const [name, setName] = useState('');
  const [course, setCourse] = useState('');
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [listError, setListError] = useState('');
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchStudents = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setListError('');

    try {
      const response = await fetch(`${BASE_URl}/students`);

      if (!response.ok) {
        throw new Error('Failed to load students.');
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('Invalid student data.');
      }

      setStudents(data);
    } catch (error) {
      setListError(error.message || 'Cannot connect to server.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const createStudent = async () => {
    const student = {
      name: name.trim(),
      course: course.trim(),
      year: year.trim(),
    };

    if (!student.name || !student.course || !student.year) {
      setFormError('Please fill in all fields.');
      setSuccess('');
      return;
    }

    setSaving(true);
    setFormError('');
    setSuccess('');

    try {
      const response = await fetch(`${BASE_URl}/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(student),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to add student.');
      }

      setName('');
      setCourse('');
      setYear('');
      setSuccess('Student added successfully!');

      await fetchStudents(true);
    } catch (error) {
      setFormError(error.message || 'Cannot connect to server.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.container}
      data={students}
      keyExtractor={(item, index) =>
        item._id ? String(item._id) : String(index)
      }
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <StudentForm
          name={name}
          setName={setName}
          course={course}
          setCourse={setCourse}
          year={year}
          setYear={setYear}
          saving={saving}
          createStudent={createStudent}
          formError={formError}
          success={success}
          listError={listError}
          refreshing={refreshing}
          fetchStudents={fetchStudents}
          students={students}
        />
      }
      refreshing={refreshing}
      onRefresh={() => fetchStudents(true)}
      ListEmptyComponent={
        loading ? (
          <ActivityIndicator
            size="large"
            color="#2563eb"
            style={styles.empty}
          />
        ) : (
          <Text style={styles.empty}>
            {listError
              ? 'Unable to load records.'
              : 'No student records yet.'}
          </Text>
        )
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(item.name || item.fullname || 'S')
                .charAt(0)
                .toUpperCase()}
            </Text>
          </View>

          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>
              {item.name || item.fullname || 'Unnamed Student'}
            </Text>

            <Text style={styles.detail}>
              Course: {item.course || 'N/A'}
            </Text>

            <Text style={styles.detail}>
              Year Level: {item.year || 'N/A'}
            </Text>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#172033',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 5,
    marginBottom: 25,
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 14,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#172033',
    marginBottom: 14,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#dbe2ea',
    borderRadius: 9,
    paddingHorizontal: 13,
    marginBottom: 12,
    fontSize: 15,
    color: '#172033',
    backgroundColor: '#ffffff',
  },
  addButton: {
    height: 48,
    backgroundColor: '#2563eb',
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countBadge: {
    backgroundColor: '#dbeafe',
    minWidth: 28,
    height: 28,
    paddingHorizontal: 8,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  countText: {
    color: '#2563eb',
    fontSize: 13,
    fontWeight: 'bold',
  },
  refreshButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#dbeafe',
    borderRadius: 8,
    marginBottom: 14,
  },
  refreshText: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 14,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  avatarText: {
    color: '#2563eb',
    fontSize: 20,
    fontWeight: 'bold',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#172033',
    marginBottom: 5,
  },
  detail: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  error: {
    color: '#dc2626',
    marginBottom: 10,
    fontSize: 14,
    textAlign: 'center'
  },
  success: {
    color: '#15803d',
    marginBottom: 10,
    fontSize: 14,
    textAlign: 'center'
  },
  empty: {
    textAlign: 'center',
    color: '#64748b',
    paddingVertical: 20,
  },
});
